import test from 'node:test';import assert from 'node:assert/strict';
import {makeFarm,act,upgradeFarm} from '../src/farm';import {applyLife} from '../src/life-rules';import {applyCommand,newOnlineFarm} from '../src/online-rules';import {plotPosition,plotUsable,LAND_SITES,buildProblem} from '../src/plots';import {restoreLocalFarm,splitLocalFarm} from '../src/local-farm';import {requiresNewClient} from '../src/client-compat';import {findPath} from '../src/pathfinding';import {cleanDogPixels} from '../src/dog-art';
test('buy chosen parcels once, preserve old crops, restore every position and prevent duplicate purchases',()=>{
 const f=makeFarm();f.coins=4000;act(f,0,'hoe','carrot',100);act(f,0,'seed','carrot',100);const original=structuredClone(f.plots[0]);
 for(const site of ['north','west','south'])assert.equal(applyLife(f,{type:'buy-land',site},200).ok,true);
 assert.equal(f.coins,1750);assert.equal(f.plots.length,60);assert.deepEqual(f.plots[0],original);assert.deepEqual(plotPosition(24,f),{x:650,y:285});assert.deepEqual(plotPosition(36,f),{x:230,y:550});
 const snapshot=JSON.stringify(f);assert.equal(applyLife(f,{type:'buy-land',site:'north'},200).ok,false);assert.equal(applyLife(f,{type:'buy-land',site:'river'},200).ok,false);assert.equal(JSON.stringify(f),snapshot);
 const parts=splitLocalFarm(f),restored=restoreLocalFarm(parts.core,parts.land);assert.deepEqual(restored,f);assert.throws(()=>restoreLocalFarm(parts.core,null));assert.equal(requiresNewClient(f,'2'),true);assert.equal(requiresNewClient(f,'3'),false);
});
test('legacy fixed land keeps its exact plot IDs and growing crops when upgraded',()=>{
 const f=makeFarm();delete f.landParcels;f.landOwned=true;for(let id=24;id<36;id++)f.plots.push({id,tilled:true,crop:'tomato',wateredAt:100});const before=structuredClone(f.plots);upgradeFarm(f);assert.deepEqual(f.plots,before);assert.deepEqual(plotPosition(24,f),{x:230,y:550});assert.equal(f.landParcels![0].site,'west');assert.equal(requiresNewClient(f,'2'),false);
});
test('construction validates ownership, footprint, crops, funds and occupancy before changing money',()=>{
 const f=makeFarm();f.coins=2000;const build={type:'build-land',site:'north',kind:'shed',col:1,row:0};assert.equal(applyLife(f,build,10).ok,false);applyLife(f,{type:'buy-land',site:'north'},10);act(f,25,'hoe','carrot',10);act(f,25,'seed','carrot',10);const before=JSON.stringify(f);assert.equal(applyLife(f,build,10).ok,false);assert.equal(JSON.stringify(f),before);f.plots[25].crop=null;assert.equal(applyLife(f,{...build,col:3},10).ok,false);assert.equal(applyLife(f,build,10).ok,true);assert.equal(f.coins,1000);assert.equal(plotUsable(f,25),false);assert.equal(act(f,25,'seed','carrot',10).ok,false);assert.equal(plotUsable(f,24),true);const saved=JSON.stringify(f);assert.equal(applyLife(f,build,10).ok,false);assert.equal(JSON.stringify(f),saved);assert.equal(restoreLocalFarm(splitLocalFarm(f).core,splitLocalFarm(f).land).buildings![0].col,1);
});
test('online expansion and construction use server prices and energy; malformed requests cannot mutate farm',()=>{
 const f=newOnlineFarm(100);f.coins=2000;assert.equal(applyCommand(f,{type:'buy-land',site:'south'},100).ok,false);f.unlockedPlots=24;assert.equal(applyCommand(f,{type:'buy-land',site:'south',price:0},100).ok,true);assert.equal(f.coins,1250);assert.equal(applyCommand(f,{type:'build-land',site:'south',kind:'gazebo',col:0,row:1},100).ok,true);assert.equal(f.coins,1070);const energy=f.energy;assert.equal(applyCommand(f,{type:'work',plot:28,tool:'hoe',crop:'carrot'},100).ok,false);assert.equal(f.energy,energy);assert.equal(applyCommand(f,{type:'work',plot:24,tool:'hoe',crop:'carrot'},100).ok,true);assert.equal(f.energy,energy-2);
});
test('all supported building entrances and remaining plot approaches stay reachable',()=>{
 for(const site of Object.keys(LAND_SITES))for(let row=0;row<2;row++)for(let col=0;col<3;col++){
 const f=makeFarm();f.coins=2000;applyLife(f,{type:'buy-land',site},1);assert.equal(buildProblem(f,'shed',site as keyof typeof LAND_SITES,col,row),null);applyLife(f,{type:'build-land',site,kind:'shed',col,row},1);const s=LAND_SITES[site as keyof typeof LAND_SITES],x=s.x+col*40+20,y=s.y+row*40+58;
 const blocks=[{x:318,y:356,width:180,height:88},{x:986,y:712,width:128,height:80},{x:471,y:517.5,width:44,height:25},{x:1076.5,y:949,width:87,height:48},{x:x-33,y:y-38,width:66,height:36}];
 assert.ok(findPath({x:710,y:650},{x,y:y+27},blocks).length,`${site} ${col},${row} entrance`);
 for(let id=24;id<36;id++)if(plotUsable(f,id)){const p=plotPosition(id,f)!;assert.ok([[42,10],[-42,10],[0,45],[0,-45]].some(([dx,dy])=>findPath({x:710,y:650},{x:p.x+dx,y:p.y+dy},blocks).length),`${site} plot ${id}`);}
 }
});
test('dog frames remove translucent trails and detached pixels without changing source or main silhouette',()=>{
 const pixels=new Uint8ClampedArray(6*6*4);for(const i of [7,8,13,14])pixels.set([180,120,60,252],i*4);pixels.set([180,120,60,90],15*4);pixels.set([180,120,60,255],35*4);const original=pixels.slice(),result=cleanDogPixels(pixels,6,6);assert.deepEqual(pixels,original);for(const i of [7,8,13,14])assert.equal(result[i*4+3],255);assert.equal(result[15*4+3],0);assert.equal(result[35*4+3],0);
});
