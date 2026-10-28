import {workerSource} from './service-worker-source.mjs';
import { readdirSync,readFileSync,writeFileSync } from 'node:fs';import {createHash} from 'node:crypto';
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${p}/${e.name}`):[`${p}/${e.name}`]);
const files=walk('dist').filter(p=>!p.endsWith('/sw.js'));const urls=files.map(p=>p.slice(4));
const hash=createHash('sha256');for(const file of files)hash.update(readFileSync(file));const version=hash.digest('hex').slice(0,12);
writeFileSync('dist/sw.js',workerSource(version,urls));
console.log(`PWA: ${urls.length} arquivos · ${version}`);
