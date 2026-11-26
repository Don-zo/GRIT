#!/usr/bin/env python3
"""Backend-only blue/green deployment. Python 3.8+, Docker Compose v2."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import urllib.request

IMAGE = re.compile(r'^[a-z0-9][a-z0-9./_-]*(?::[0-9a-f]{40}|@sha256:[0-9a-f]{64})$')


def atomic(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + '.new')
    with tmp.open('w') as stream:
        stream.write(content)
        stream.flush()
        os.fsync(stream.fileno())
    os.chmod(tmp, 0o600)
    tmp.replace(path)


class Deployment:
    def __init__(self, root, timeout=180, drain_timeout=120, observe=15):
        self.root = Path(root).resolve()
        self.runtime = self.root / 'runtime'
        self.runtime.mkdir(parents=True, exist_ok=True)
        self.lock = (self.runtime / 'deploy.lock').open('a')
        try:
            fcntl.flock(self.lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except Exception:
            self.lock.close()
            raise
        self.state_file = self.runtime / 'state.json'
        self.journal = self.runtime / 'pending.json'
        self.images = self.runtime / 'images.env'
        self.route = self.runtime / 'nginx' / 'active.conf'
        self.timeout, self.drain_timeout, self.observe = timeout, drain_timeout, observe
        self.base = ['docker', 'compose', '--project-name', 'grit-backend',
                     '--env-file', str(self.root / '.env'), '--env-file', str(self.images),
                     '-f', str(self.root / 'compose.backend.yaml')]

    def docker(self, *args, check=True):
        return subprocess.run(['docker', *args], check=check, text=True, capture_output=True)

    def compose(self, *args):
        result = subprocess.run(self.base + list(args), text=True, capture_output=True)
        if result.returncode:
            # Compose errors can include interpolated configuration. Never print secrets.
            raise RuntimeError('Compose {} failed (exit {})'.format(args[0], result.returncode))
        return result.stdout

    def load(self, path):
        return json.loads(path.read_text()) if path.exists() else None

    def save(self, path, value):
        atomic(path, json.dumps(value, indent=2) + '\n')

    def set_images(self, state):
        atomic(self.images, 'BLUE_IMAGE={}\nGREEN_IMAGE={}\n'.format(state['images']['blue'], state['images']['green']))

    def route_text(self, slot, image):
        return ('upstream grit_backend { server backend-' + slot + ':8080; keepalive 16; }\n'
                'map $host $grit_slot { default "' + slot + '"; }\n'
                'map $host $grit_revision { default "' + image + '"; }\n')

    def workers(self):
        result = self.docker('exec', 'grit-backend', 'ps', '-o', 'pid,args')
        return [line.split()[0] for line in result.stdout.splitlines()
                if 'nginx: worker process' in line and line.split()[0].isdigit()]

    def wait_workers(self, pids):
        deadline = time.monotonic() + self.drain_timeout
        while pids:
            result = self.docker('exec', 'grit-backend', 'sh', '-c',
                                 'for p do test ! -d "/proc/$p" || exit 1; done', 'sh', *pids, check=False)
            retiring = self.docker('exec', 'grit-backend', 'ps', '-o', 'pid,args', check=False)
            if result.returncode == 0 and retiring.returncode == 0 and 'worker process is shutting down' not in retiring.stdout:
                return
            if time.monotonic() >= deadline:
                raise RuntimeError('Old proxy workers still have connections; both backends retained. Run recover later.')
            time.sleep(1)

    def candidate_ready(self, slot, image):
        container = 'grit-backend-' + slot
        for endpoint in ('health/readiness', 'info'):
            result = self.docker('exec', container, 'curl', '--fail', '--silent', '--max-time', '5',
                                 'http://127.0.0.1:8080/actuator/' + endpoint)
            body = json.loads(result.stdout)
            if endpoint == 'health/readiness' and body.get('status') != 'UP':
                raise RuntimeError('Candidate not ready')
            if endpoint == 'info' and body.get('app', {}).get('revision') != image:
                raise RuntimeError('Candidate revision mismatch')

    def wait_ready(self, slot, image):
        deadline = time.monotonic() + self.timeout
        consecutive = 0
        while time.monotonic() < deadline:
            try:
                self.candidate_ready(slot, image)
                consecutive += 1
                if consecutive == 3:
                    return
            except (subprocess.CalledProcessError, ValueError, RuntimeError):
                consecutive = 0
            time.sleep(1)
        raise RuntimeError('Candidate readiness deadline exceeded')

    def proxy_check(self, state):
        rendered = json.loads(self.compose('config', '--format', 'json'))
        port = rendered['services']['proxy']['ports'][0]['published']
        for endpoint in ('health/readiness', 'info'):
            with urllib.request.urlopen('http://127.0.0.1:{}/actuator/{}'.format(port, endpoint), timeout=5) as response:
                body = json.load(response)
                if response.headers.get('X-Grit-Slot') != state['active']:
                    raise RuntimeError('Proxy slot mismatch')
                if response.headers.get('X-Grit-Revision') != state['images'][state['active']]:
                    raise RuntimeError('Proxy image mismatch')
                if endpoint == 'health/readiness' and body.get('status') != 'UP':
                    raise RuntimeError('Routed backend not ready')
                if endpoint == 'info' and body.get('app', {}).get('revision') != state['images'][state['active']]:
                    raise RuntimeError('Routed application revision mismatch')

    def wait_proxy(self, state, bootstrap=False):
        deadline = time.monotonic() + (self.timeout if bootstrap else min(self.timeout, 15))
        while True:
            try:
                self.proxy_check(state)
                return
            except Exception:
                if time.monotonic() >= deadline:
                    raise
                time.sleep(1)

    def reload(self):
        self.docker('exec', 'grit-backend', 'nginx', '-t')
        self.docker('exec', 'grit-backend', 'nginx', '-s', 'reload')

    def finish(self, journal):
        state = journal['next']
        self.proxy_check(state)
        self.save(self.state_file, state)
        if journal['previous']:
            self.wait_workers(journal['workers'])
            self.compose('stop', 'backend-' + journal['previous']['active'])
        self.journal.unlink()

    def recover(self):
        journal = self.load(self.journal)
        if not journal:
            print('No interrupted deployment.')
            return
        if journal.get('committed'):
            # The new route passed observation. Only finish draining the old instance.
            self.finish(journal)
            return
        previous = journal['previous']
        if previous:
            # Restore compatibility-tested image/config, never reverse a DB migration.
            self.set_images(previous)
            self.compose('up', '-d', '--no-deps', 'backend-' + previous['active'])
            self.wait_ready(previous['active'], previous['images'][previous['active']])
            workers = self.workers()
            atomic(self.route, journal['previous_route'])
            self.reload()
            self.wait_proxy(previous)
            self.wait_workers(workers)
            self.compose('stop', 'backend-' + journal['next']['active'])
            self.save(self.state_file, previous)
        else:
            self.compose('stop', 'proxy', 'backend-' + journal['next']['active'])
            self.compose('rm', '-f', 'proxy', 'backend-' + journal['next']['active'])
            self.route.unlink(missing_ok=True)
            self.images.unlink(missing_ok=True)
        self.journal.unlink()
        print('Previous deployment restored.')

    def deploy(self, image, bootstrap=False):
        if not IMAGE.fullmatch(image):
            raise RuntimeError('Image must be pinned to a 40-character commit tag or sha256 digest')
        if self.journal.exists():
            raise RuntimeError('Interrupted deployment found; run deploy.py recover first')
        previous = self.load(self.state_file)
        if bootstrap != (previous is None):
            raise RuntimeError('Use bootstrap exactly once, then deploy')
        if bootstrap:
            if self.docker('inspect', 'grit-backend', check=False).returncode == 0:
                raise RuntimeError('Existing grit-backend detected; complete the documented initial migration first')
        else:
            self.proxy_check(previous)
        slot = 'green' if previous and previous['active'] == 'blue' else 'blue'
        images = dict(previous['images']) if previous else {'blue': image, 'green': image}
        images[slot] = image
        state = {'active': slot, 'images': images}
        journal = {'previous': previous, 'next': state,
                   'previous_route': self.route.read_text() if previous else None,
                   'workers': [], 'committed': False}
        self.save(self.journal, journal)
        try:
            self.set_images(state)
            self.compose('config', '--quiet')
            self.compose('pull', 'backend-' + slot)
            self.compose('up', '-d', '--no-deps', 'backend-' + slot)
            self.wait_ready(slot, image)
            if previous:
                journal['workers'] = self.workers()
                if not journal['workers']:
                    raise RuntimeError('No proxy worker found; refusing an unverified cutover')
                self.save(self.journal, journal)
            atomic(self.route, self.route_text(slot, image))
            if previous:
                self.reload()
            else:
                self.compose('up', '-d', '--no-deps', 'proxy')
            self.wait_proxy(state, bootstrap=bootstrap)
            for _ in range(self.observe):
                self.proxy_check(state)
                time.sleep(1)
            journal['committed'] = True
            self.save(self.journal, journal)
        except (Exception, KeyboardInterrupt):
            print('Deployment failed; attempting recovery.', file=sys.stderr)
            self.recover()
            raise
        self.finish(journal)
        print('Active backend: {}'.format(slot))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['bootstrap', 'deploy', 'recover'])
    parser.add_argument('image', nargs='?')
    parser.add_argument('--root', default=str(Path(__file__).resolve().parent))
    parser.add_argument('--timeout', type=int, default=180)
    parser.add_argument('--drain-timeout', type=int, default=120)
    parser.add_argument('--observe', type=int, default=15)
    args = parser.parse_args()
    try:
        deployment = Deployment(args.root, args.timeout, args.drain_timeout, args.observe)
        if args.command == 'recover':
            deployment.recover()
        elif args.image:
            deployment.deploy(args.image, bootstrap=args.command == 'bootstrap')
        else:
            parser.error('image is required')
    except Exception as exc:
        message = str(exc) if isinstance(exc, RuntimeError) else type(exc).__name__
        print('Deployment stopped: {}'.format(message), file=sys.stderr)
        # No exception repr: CLI libraries may include interpolated credentials.
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
