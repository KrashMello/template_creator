import assert from 'node:assert/strict'
import { isAllowedUrl } from '../server/utils/allow-public-url.ts'

// Solo literales: `isAllowedUrl` resuelve DNS para hostnames y este check no
// depende de la red.
const mustBlock = [
  'http://127.0.0.1/',
  'http://[::1]/',
  'http://[::ffff:127.0.0.1]/',
  'http://[::ffff:169.254.169.254]/latest/meta-data/',
  'http://[::ffff:a9fe:a9fe]/',
  'http://[::ffff:10.0.0.1]/',
  'http://[64:ff9b::7f00:1]/',
  'http://169.254.169.254/',
  'http://10.0.0.1/',
  'http://localhost/',
  'http://x.internal/',
  'file:///etc/passwd',
  'gopher://x/',
]

for (const url of mustBlock) {
  assert.equal(await isAllowedUrl(url), false, `debería bloquear ${url}`)
}

const mustAllow = ['https://1.1.1.1/', 'data:text/plain,hi', 'blob:https://x/y', 'about:blank']
for (const url of mustAllow) {
  assert.equal(await isAllowedUrl(url), true, `debería permitir ${url}`)
}

console.log(`ok: ${mustBlock.length} bloqueadas, ${mustAllow.length} permitidas`)
