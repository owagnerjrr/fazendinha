export function workerSource(version,urls){return `const CACHE='wj-${version}';const ASSETS=${JSON.stringify(urls)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>{const old=keys.filter(key=>key.startsWith('wj-')&&key!==CACHE);return Promise.all(old.slice(0,Math.max(0,old.length-2)).map(key=>caches.delete(key)));}).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request,{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error('offline');return response;}).catch(()=>caches.open(CACHE).then(cache=>cache.match('/index.html'))));return;}
if(ASSETS.includes(u.pathname)||u.pathname.startsWith('/assets/'))event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(cached=>cached||caches.match(event.request)).then(cached=>cached||fetch(event.request)));});`;}
