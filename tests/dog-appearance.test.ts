import test from 'node:test';import assert from 'node:assert/strict';
import {dogAppearance,type DogGait} from '../src/dog-motion';import {anchorDogPixels,dogTexture} from '../src/dog-art';
test('interleaved physics and render ticks never flash the seated texture while travelling',()=>{
 const gait:DogGait={facing:2,distance:0,frame:8,lastMovedAt:0};
 for(let n=0;n<240;n++){const look=dogAppearance(gait,n%2?1.5:0,0,n*1000/120);assert.equal(look.walking,true);assert.ok(look.frame>=8&&look.frame<=11);}
 const last=gait.lastMovedAt;assert.equal(dogAppearance(gait,0,0,last+500).walking,true);assert.deepEqual(dogAppearance(gait,0,0,last+500),{walking:true,frame:8});assert.deepEqual(dogAppearance(gait,0,0,last+1200),{walking:false,frame:2});assert.deepEqual(dogAppearance(gait,0,0,last+10000),{walking:false,frame:6});assert.equal(dogAppearance(gait,2,0,last+10016).walking,true);
});
test('dog poses have separate texture keys and one consistent opaque ground anchor',()=>{
 const keys=new Set<string>();for(const walk of [true,false])for(let i=0;i<(walk?16:8);i++)keys.add(dogTexture(walk,i));assert.equal(keys.size,24);
 for(const offset of [0,2,5]){const p=new Uint8ClampedArray(12*16*4);for(let y=2+offset;y<8+offset;y++)for(let x=1;x<6;x++)p.set([170,110,50,230],(y*12+x)*4);const original=p.slice(),out=anchorDogPixels(p,12,16),occupied=[];for(let i=0;i<12*16;i++)if(out[i*4+3])occupied.push(i);assert.equal(Math.max(...occupied.map(i=>Math.floor(i/12))),14);assert.equal(Math.min(...occupied.map(i=>i%12)),3);assert.equal(occupied.length,30);assert.deepEqual(p,original);assert.ok(out.every((v,i)=>i%4!==3||v===0||v===255));}
});
