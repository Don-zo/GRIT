import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('deployment', Path(__file__).parents[1] / 'deploy.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
OLD = 'ghcr.io/don-zo/grit-backend:' + '1' * 40
NEW = 'ghcr.io/don-zo/grit-backend:' + '2' * 40


class FakeDeployment(module.Deployment):
    def __init__(self, root):
        super().__init__(root, timeout=0, observe=0)
        self.events = []
        self.bad_candidate = self.bad_route = self.block_drain = self.legacy = False

    def docker(self, *args, check=True):
        self.events.append(('docker', args))
        return subprocess.CompletedProcess(args, int(args[0] == 'inspect' and not self.legacy), '', '')

    def compose(self, *args):
        self.events.append(('compose', args))
        return ''

    def wait_ready(self, slot, image):
        self.events.append(('ready', slot))
        if slot == 'green' and self.bad_candidate:
            raise RuntimeError('candidate failure')

    def workers(self):
        return ['101']

    def wait_workers(self, pids):
        self.events.append(('drain', pids))
        if self.block_drain:
            raise RuntimeError('still processing requests')

    def reload(self):
        self.events.append(('reload', self.route.read_text()))

    def proxy_check(self, state):
        self.events.append(('probe', state['active']))
        self.assert_route(state)
        if self.bad_route and state['active'] == 'green':
            raise RuntimeError('routed application failed')

    def assert_route(self, state):
        assert 'backend-' + state['active'] + ':8080' in self.route.read_text()


class DeploymentTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.d = FakeDeployment(self.temp.name)

    def tearDown(self):
        self.d.lock.close()
        self.temp.cleanup()

    def bootstrap(self):
        self.d.deploy(OLD, bootstrap=True)
        self.d.events.clear()

    def test_success_drains_before_stopping_only_old_backend(self):
        self.bootstrap()
        self.d.deploy(NEW)
        events = self.d.events
        self.assertLess(events.index(('ready', 'green')), next(i for i, e in enumerate(events) if e[0] == 'reload'))
        self.assertLess(events.index(('drain', ['101'])), events.index(('compose', ('stop', 'backend-blue'))))
        self.assertEqual(self.d.load(self.d.state_file)['active'], 'green')
        self.assertFalse(self.d.journal.exists())
        self.assertFalse(any(e[0] == 'compose' and e[1][0] == 'down' for e in events))

    def test_failed_candidate_keeps_old_route_and_image(self):
        self.bootstrap()
        self.d.bad_candidate = True
        with self.assertRaises(RuntimeError):
            self.d.deploy(NEW)
        self.assertEqual(self.d.load(self.d.state_file)['active'], 'blue')
        self.assertIn('backend-blue:8080', self.d.route.read_text())
        self.assertNotIn(('compose', ('stop', 'backend-blue')), self.d.events)
        self.assertIn(OLD, self.d.images.read_text())
        self.assertFalse(self.d.journal.exists())

    def test_failed_routed_probe_restores_old_route(self):
        self.bootstrap()
        self.d.bad_route = True
        with self.assertRaises(RuntimeError):
            self.d.deploy(NEW)
        self.assertEqual(self.d.load(self.d.state_file)['active'], 'blue')
        self.assertIn(('compose', ('stop', 'backend-green')), self.d.events)
        self.assertNotIn(('compose', ('stop', 'backend-blue')), self.d.events)

    def test_long_request_retains_old_backend_and_can_finish_recovery(self):
        self.bootstrap()
        self.d.block_drain = True
        with self.assertRaises(RuntimeError):
            self.d.deploy(NEW)
        self.assertTrue(self.d.load(self.d.journal)['committed'])
        self.assertEqual(self.d.load(self.d.state_file)['active'], 'green')
        self.assertNotIn(('compose', ('stop', 'backend-blue')), self.d.events)
        with self.assertRaises(RuntimeError):
            self.d.deploy(OLD)
        self.d.block_drain = False
        self.d.recover()
        self.assertFalse(self.d.journal.exists())
        self.assertIn(('compose', ('stop', 'backend-blue')), self.d.events)

    def test_interrupted_uncommitted_attempt_restores_previous_image_and_route(self):
        self.bootstrap()
        previous = self.d.load(self.d.state_file)
        self.d.save(self.d.journal, {'previous': previous, 'next': {'active': 'green', 'images': {'blue': OLD, 'green': NEW}},
                                    'previous_route': self.d.route.read_text(), 'workers': ['101'], 'committed': False})
        module.atomic(self.d.route, self.d.route_text('green', NEW))
        self.d.recover()
        self.assertIn('backend-blue:8080', self.d.route.read_text())
        self.assertIn(('compose', ('stop', 'backend-green')), self.d.events)

    def test_lock_rejects_parallel_deployments(self):
        with self.assertRaises(BlockingIOError):
            module.Deployment(self.temp.name)

    def test_bootstrap_rejects_existing_gateway_and_mutable_tag(self):
        self.d.legacy = True
        with self.assertRaises(RuntimeError):
            self.d.deploy(NEW, bootstrap=True)
        with self.assertRaises(RuntimeError):
            self.d.deploy('ghcr.io/don-zo/grit-backend:latest', bootstrap=True)
        self.assertFalse(self.d.journal.exists())


if __name__ == '__main__':
    unittest.main()
