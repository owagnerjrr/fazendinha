import test from 'node:test';import assert from 'node:assert/strict';
import {worldTime,nextMorning,nightOpacity,applyHome,SLEEP_MS,SEASONS} from '../src/world-time';import {makeFarm,remaining} from '../src/farm';import {splitLocalFarm,restoreLocalFarm} from '../src/local-farm';import {applyCommand,newOnlineFarm} from '../src/online-rules';import {requiresNewClient} from '../src/client-compat';
test('calendar advances through periods, four 28-day seasons and year wrap using elapsed server time',()=>{
 const calendar={startedAt:10000,offsetMinutes:0};const at=(minutes:number)=>worldTime(calendar,10000+minutes*1000);
 assert.equal(at(0).text,'06:00');assert.equal(at(0).period,'Manhã');assert.equal(at(360).period,'Tarde');assert.equal(at(720).period,'Anoitecer');assert.equal(at(1080).period,'Madrugada');assert.equal(at(1440).day,2);
 for(let i=0;i<4;i++){assert.equal(at(i*28*1440).season,SEASONS[i]);assert.equal(at(i*28*1440).dayOfSeason,1);}assert.equal(at(112*1440).year,2);assert.equal(at(112*1440).season,'Primavera');assert.equal(worldTime(calendar,0).text,'06:00');
 assert.equal(nextMorning(360),1800);assert.equal(nextMorning(1450),1800);assert.equal(nextMorning(1801),3240);
 for(let m=0;m<1440;m++)assert.ok(nightOpacity(m)>=0&&nightOpacity(m)<=.54);assert.ok(Math.abs(nightOpacity(720)-.012)<1e-9);assert.equal(nightOpacity(0),.54);
});
test('TV persists, sleep requires real rest and morning never alters crop clocks, products or coins',()=>{
 const f=makeFarm(1000);f.plots[0]={id:0,tilled:true,crop:'sunflower',wateredAt:1000};const economy=JSON.stringify({coins:f.coins,plots:f.plots,seeds:f.seeds,products:f.products});
 assert.equal(applyHome(f,{action:'tv',on:'yes'},1000).ok,false);assert.equal(applyHome(f,{action:'tv',on:true},1000).ok,true);assert.equal(f.home?.tvOn,true);
 assert.equal(applyHome(f,{action:'sleep',on:123},2000).ok,true);const before=JSON.stringify(f);assert.equal(applyHome(f,{action:'sleep'},3000).ok,false);assert.equal(JSON.stringify(f),before);assert.equal(applyHome(f,{action:'wake'},2000+SLEEP_MS-1).ok,false);assert.equal(applyHome(f,{action:'wake'},2000+SLEEP_MS).ok,true);
 assert.equal(worldTime(f.calendar,8000).text,'06:00');assert.equal(worldTime(f.calendar,8000).day,2);assert.equal(remaining(f.plots[0],8000),193000);assert.equal(JSON.stringify({coins:f.coins,plots:f.plots,seeds:f.seeds,products:f.products}),economy);assert.equal(applyHome(f,{action:'wake'},9000).ok,false);
 const parts=splitLocalFarm(f);const restored=restoreLocalFarm(parts.core,parts.land);assert.deepEqual(restored.calendar,f.calendar);assert.deepEqual(restored.home,f.home);assert.equal(requiresNewClient(f,'3'),true);assert.equal(requiresNewClient(f,'4'),false);
});
test('reopening after long offline rest cannot rewind the world calendar or mint energy',()=>{
 const f=newOnlineFarm(1000);f.energy=50;applyCommand(f,{type:'home',action:'sleep'},1000);const absolute=worldTime(f.calendar,4000000).absolute;const before=f.energy;assert.equal(applyCommand(f,{type:'home',action:'wake'},4000000).ok,true);assert.equal(worldTime(f.calendar,4000000).absolute,absolute);assert.ok(f.energy<=80);assert.equal(f.home?.sleep,undefined);assert.ok(before<=f.energy);assert.equal(f.coins,50);
});
