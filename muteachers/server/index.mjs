/* ------------------------------------------------------------------
   Optional companion server.
   • serves the built app from dist/
   • gives each card a short id so the shared link stays tiny
   Zero dependencies — plain node:http + a JSON file per card.
   The app works without it: it falls back to packing the whole card
   into the URL fragment.
   ------------------------------------------------------------------ */
import { createServer } from 'node:http'
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'

const PORT = Number(process.env.PORT || 8787)
const ROOT = resolve(process.cwd(), 'dist')
const DATA = resolve(process.cwd(), '.data/cards')
mkdirSync(DATA, { recursive: true })

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon',
}

const ID = /^[a-z0-9]{10}$/
const json = (res, code, body) => {
  const s = JSON.stringify(body)
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(s) })
  res.end(s)
}

function readBody(req, limit = 12 * 1024 * 1024) {
  return new Promise((ok, fail) => {
    let n = 0
    const chunks = []
    req.on('data', c => {
      n += c.length
      if (n > limit) { fail(new Error('too large')); req.destroy() }
      else chunks.push(c)
    })
    req.on('end', () => ok(Buffer.concat(chunks).toString('utf8')))
    req.on('error', fail)
  })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const p = decodeURIComponent(url.pathname)

  /* ---------- api ---------- */
  if (p === '/api/cards' && req.method === 'POST') {
    try {
      const raw = await readBody(req)
      const doc = JSON.parse(raw)
      if (!doc?.templateId || !Array.isArray(doc.elements)) return json(res, 400, { error: 'bad card' })
      const id = randomBytes(5).toString('hex')
      writeFileSync(join(DATA, id + '.json'), JSON.stringify(doc))
      return json(res, 200, { id })
    } catch (e) {
      return json(res, e.message === 'too large' ? 413 : 400, { error: e.message })
    }
  }

  if (p.startsWith('/api/cards/') && req.method === 'GET') {
    const id = p.slice('/api/cards/'.length)
    if (!ID.test(id)) return json(res, 400, { error: 'bad id' })
    const f = join(DATA, id + '.json')
    if (!existsSync(f)) return json(res, 404, { error: 'not found' })
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' })
    return res.end(readFileSync(f))
  }

  if (p.startsWith('/api/')) return json(res, 404, { error: 'not found' })

  /* ---------- static ---------- */
  const rel = normalize(p).replace(/^(\.\.[/\\])+/, '')
  let file = join(ROOT, rel)
  if (!file.startsWith(ROOT)) file = join(ROOT, 'index.html')
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(ROOT, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(500, { 'content-type': 'text/plain' })
    return res.end('Run "npm run build" first — dist/ is missing.')
  }
  const type = MIME[extname(file)] || 'application/octet-stream'
  const immutable = /\/assets\/|\/fonts\//.test(file)
  res.writeHead(200, { 'content-type': type, 'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' })
  createReadStream(file).pipe(res)
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} is already in use — another cards server is probably still running.\n` +
      `  see it:   lsof -nP -iTCP:${PORT} -sTCP:LISTEN\n` +
      `  stop it:  kill $(lsof -t -iTCP:${PORT} -sTCP:LISTEN)\n` +
      `  or pick another port:  PORT=8788 npm run serve\n`,
    )
  } else {
    console.error('Cards server failed to start:', err.message)
  }
  process.exit(1)
})

server.listen(PORT, () => console.log(`μlearn cards server → http://localhost:${PORT}`))
