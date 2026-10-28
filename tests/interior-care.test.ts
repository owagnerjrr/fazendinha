import test from 'node:test';import assert from 'node:assert/strict';
import { makeFarm,restoreFarm } from '../src/farm';import {applyLife} from '../src/life-rules';
import {HOUSE_PROPS,HOUSE_WALLS} from '../src/house-art';import {findPath} from '../src/pathfinding';
import {animalReady,dogProtects} from '../src/content';
test('all furniture and the exit have reachable interaction points without passing through furniture',()=>{
 const blocks=[...HOUSE_WALLS,...HOUSE_PROPS.map(p=>p.body)];const spawn={x:600,y:660};
 for(const p of [...HOUSE_PROPS,{access:{x:600,y:697}}]){const path=findPath(spawn,p.access,blocks);assert.ok(path.length,JSON.stringify(p));}
 const bed=HOUSE_PROPS.find(p=>p.kind==='bed')!;assert.ok(bed.height<1.5*64);assert.ok(bed.width<64);
});
test('care changes wellbeing, survives reload, and cannot farm money or restart production',()=>{
 const f=makeFarm(),hen=f.animals[0],now=100000;hen.fedAt=now;hen.wateredAt=now;hen.collectedAt=now;
 const original={coins:f.coins,feed:f.feed,products:{...f.products},collectedAt:hen.collectedAt};
 assert.equal(applyLife(f,{type:'pet-animal',id:hen.id},now).ok,true);assert.equal(hen.pettedAt,now);
 assert.equal(applyLife(f,{type:'pet-animal',id:hen.id},now+59999).ok,false);assert.equal(hen.pettedAt,now);
 assert.equal(applyLife(f,{type:'play-animal',id:hen.id},now+60000).ok,false);
 assert.equal(animalReady(hen,now+90000),true);
 assert.deepEqual({coins:f.coins,feed:f.feed,products:f.products,collectedAt:hen.collectedAt},original);
 assert.equal(restoreFarm(JSON.stringify(f)).animals[0].pettedAt,now);
});
test('dog play has a shared cooldown with petting, preserves protection and persists',()=>{
 const f=makeFarm(),now=200000;f.animals.push({id:'dog',kind:'dog',fedAt:now,wateredAt:now,collectedAt:now});
 assert.equal(applyLife(f,{type:'play-animal',id:'dog'},now).ok,true);
 assert.equal(applyLife(f,{type:'pet-animal',id:'dog'},now+59999).ok,false);
 assert.equal(dogProtects(f.animals,now+60000),true);
 assert.equal(applyLife(f,{type:'pet-animal',id:'dog'},now+60000).ok,true);
 const saved=restoreFarm(JSON.stringify(f)).animals.find(a=>a.id==='dog')!;assert.equal(saved.playedAt,now);assert.equal(saved.pettedAt,now+60000);
 assert.equal(f.coins,250);assert.equal(f.feed,5);assert.deepEqual(f.products,{egg:0,milk:0,goatMilk:0});
});
