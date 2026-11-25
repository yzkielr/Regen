// Local development fixture. Start alongside next dev; never deploy as an auth backend.
import { createServer } from 'node:http'
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'

if (process.env.NODE_ENV === 'production') throw new Error('Development only.')
process.umask(0o077)
const dir = resolve('tmp/local-article-cms')
await mkdir(dir, { recursive: true, mode: 0o700 })
const tools = createRequire(resolve('tmp/cms-tools/package.json'))
const { PGlite } = tools('@electric-sql/pglite')
const { PGLiteSocketServer } = tools('@electric-sql/pglite-socket')
async function privateFile(path, initial) {
  try { await writeFile(path, initial, {flag:'wx',mode:0o600}) }
  catch (e) { if (e.code !== 'EEXIST') throw e }
  return readFile(path,'utf8')
}
const username = 'editor-lokal'
const password = (await privateFile(join(dir,'password.txt'),randomBytes(18).toString('base64url')+'\n')).trim()
const access = (await privateFile(join(dir,'gateway.key'),randomBytes(32).toString('hex'))).trim()
const equal = (left,right) => timingSafeEqual(...[left,right].map(v=>createHash('sha256').update(String(v)).digest()))
const sessions = new Map()
let failures = []
const recordTypes = 'contacts knowledge replies guardrails automations agents owners campaigns products orders appointments shipments rates calls channels adEvents integrations'.split(' ')
const server = createServer(async (req,res) => {
  function reply(status,obj) {res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
  if (!equal(req.headers['oai-sites-authorization'],'Bearer '+access)) return reply(403,{error:'Akses lokal ditolak.'})
  const token = req.headers['x-regen-admin-session']
  const now = Date.now()
  for(const [key,expiry] of sessions) if(expiry <= now) sessions.delete(key)
  if (req.url === '/api/admin-auth' && req.method==='POST') {
    let body=''
    try {
      for await(const part of req) {
        if (body.length+part.length>4096) return reply(413,{})
        body+=part
      }
      const input=JSON.parse(body)
      if (input.action==='login') {
        failures=failures.filter(t=>now-t<60000)
        if(failures.length>=10)return reply(429,{error:'Coba lagi sebentar.'})
        if(!equal(input.username,username) || !equal(input.password,password)){failures.push(now);return reply(401,{error:'Username atau password akun uji tidak sesuai.'})}
        const session=randomBytes(32).toString('hex'), expiresAt=now+8*60*60*1000
        sessions.set(session,expiresAt)
        return reply(200,{token:session,expiresAt})
      }
      if(!sessions.has(token))return reply(401,{})
      if(input.action==='logout'){sessions.delete(token);return reply(200,{ok:true})}
      if(input.action==='session')return reply(200,{username,displayName:'Editor Lokal',role:'supervisor'})
    } catch {return reply(400,{error:'Permintaan tidak valid.'})}
  }
  if(!sessions.has(token))return reply(401,{})
  if(req.method==='GET' && req.url==='/api/operations')return reply(200,{version:1,state:{records:Object.fromEntries(recordTypes.map(type=>[type,[]])),settings:{businessName:'Regen Lokal',currency:'IDR',timezone:'Asia/Jakarta'},movements:[],processed:[],logs:[]}})
  if(req.method==='GET' && req.url==='/api/health')return reply(200,{whatsapp:{state:'unconfigured',active:false,shortLabel:'Lokal',label:'Pengujian CMS lokal',detail:'Ruang uji artikel',lastAt:0,lastBackgroundAt:0}})
  return reply(404,{error:'Layanan uji ini khusus CMS artikel.'})
})
const port=43187
await new Promise((ok,fail)=>server.once('error',fail).listen(port,'127.0.0.1',ok))
const db = await PGlite.create(join(dir,'postgres'))
const sockets = new PGLiteSocketServer({ db, path:join(dir,'.s.PGSQL.5432'),maxConnections:8 })
await sockets.start()
const env = [
  'REGEN_LOCAL_ARTICLE_TEST=1',
  'REGEN_ADMIN_BACKEND_URL=http://127.0.0.1:'+port,
  'REGEN_ADMIN_BACKEND_ACCESS='+access,
  'REGEN_ARTICLES_DATABASE_URL=postgresql://postgres@localhost/postgres?host='+encodeURIComponent(dir),
].join('\n')+'\n'
if(await privateFile('.env.development.local',env)!==env)throw new Error('Konfigurasi .env.development.local sudah ada dan berbeda; periksa sebelum memakai fixture.')
console.log('Backend CMS lokal siap. Username: editor-lokal. Password: tmp/local-article-cms/password.txt')
async function close() {server.close();await sockets.stop();await db.close();process.exit()}
process.on('SIGINT',close);process.on('SIGTERM',close)
