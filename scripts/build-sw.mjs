import { readdirSync,readFileSync,writeFileSync } from 'node:fs';import {createHash} from 'node:crypto';
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${p}/${e.name}`):[`${p}/${e.name}`]);
const files=walk('dist').filter(p=>!p.endsWith('/sw.js'));const urls=files.map(p=>p.slice(4));
const hash=createHash('sha256');for(const file of files)hash.update(readFileSync(file));const version=hash.digest('hex').slice(0,12);
writeFileSync('dist/sw.js',`const CACHE='wj-${version}';const ASSETS=${JSON.stringify(urls)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('wj-')&&key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;
if(event.request.mode==='navigate'){event.respondWith(caches.open(CACHE).then(cache=>cache.match('/index.html')).then(shell=>shell||fetch(event.request,{cache:'no-cache'})));return;}
if(ASSETS.includes(u.pathname))event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});`);
console.log(`PWA: ${urls.length} arquivos · ${version}`);
