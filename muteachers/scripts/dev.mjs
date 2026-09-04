/* runs Vite and the short-link API together */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'

const PORT = Number(process.env.PORT || 8787)

/** resolve to true when nothing is listening on PORT */
const portFree = () => new Promise(res => {
  const probe = createServer()
  probe.once('error', () => res(false))
  probe.once('listening', () => probe.close(() => res(true)))
  probe.listen(PORT)
})

const procs = []
if (await portFree()) {
  procs.push(spawn('node', ['server/index.mjs'], { stdio: 'inherit', env: { ...process.env, PORT: String(PORT) } }))
} else {
  console.log(`↷ a cards server is already listening on ${PORT} — reusing it.`)
}
procs.push(spawn('npx', ['vite'], { stdio: 'inherit' }))

let closing = false
const bye = () => {
  if (closing) return
  closing = true
  procs.forEach(p => p.kill('SIGINT'))
  process.exit(0)
}
process.on('SIGINT', bye)
process.on('SIGTERM', bye)
procs.forEach(p => p.on('exit', bye))
