import json
import os
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class StackTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        env = dict(os.environ, BLUE_IMAGE='ghcr.io/don-zo/grit-backend:' + '1'*40,
                   GREEN_IMAGE='ghcr.io/don-zo/grit-backend:' + '2'*40)
        result = subprocess.check_output(['docker','compose','--profile','backend','--env-file',str(ROOT/'.env.example'),
                                          '-f',str(ROOT/'compose.yaml'),'config','--format','json'],env=env,text=True)
        cls.services = json.loads(result)['services']

    def test_unified_stack_keeps_stateful_data_but_telemetry_on_tmpfs(self):
        services = self.services
        self.assertTrue({'postgres','redis','livekit','backend-blue','backend-green','proxy','prometheus','loki','tempo','grafana','snmp-exporter'} <= services.keys())
        for service, path in [('prometheus','/prometheus'),('loki','/loki'),('tempo','/tmp/tempo'),('redis','/data')]:
            self.assertTrue(any(t.split(':')[0] == path for t in services[service]['tmpfs']))
            self.assertFalse(any(v['target'] == path for v in services[service].get('volumes',[])))
        for service, path in [('postgres','/var/lib/postgresql'),('grafana','/var/lib/grafana')]:
            self.assertTrue(any(v['type']=='bind' and v['target']==path for v in services[service]['volumes']))
        self.assertNotIn('fsync=off', services['postgres']['command'])
        self.assertIn('--save', services['redis']['command'])

    def test_default_start_does_not_start_both_backend_slots(self):
        for name in ['backend-blue','backend-green','proxy']:
            self.assertEqual(self.services[name]['profiles'], ['backend'])
        for name in ['backend-blue','backend-green']:
            self.assertNotIn('ports', self.services[name])
        self.assertEqual(str(self.services['proxy']['ports'][0]['published']), '14036')
        self.assertEqual(self.services['proxy']['ports'][0]['host_ip'], '127.0.0.1')
        for name in ['backend-blue','backend-green']:
            env = self.services[name]['environment']
            self.assertEqual(env['LOKI_URL'], 'http://loki:3100/loki/api/v1/push')
            self.assertIn('tempo:4318',env['OTEL_ENDPOINT'])


if __name__ == '__main__':
    unittest.main()
