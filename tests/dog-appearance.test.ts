import test from 'node:test';import assert from 'node:assert/strict';
import {dogAppearance,type DogGait} from '../src/dog-motion';import {anchorDogPixels,dogTexture,dogWalkPixels} from '../src/dog-art';
test('interleaved physics and render ticks never flash the seated texture while travelling',()=>{
 const gait:DogGait={facing:2,distance:0,frame:8,lastMovedAt:0};
 for(let n=0;n<240;n++){const look=dogAppearance(gait,n%2?1.5:0,0,n*1000/120);assert.equal(look.walking,true);assert.ok(look.frame>=8&&look.frame<=11);}
 const last=gait.lastMovedAt;assert.equal(dogAppearance(gait,0,0,last+500).walking,true);assert.deepEqual(dogAppearance(gait,0,0,last+500),{walking:true,frame:8});assert.deepEqual(dogAppearance(gait,0,0,last+1200),{walking:false,frame:2});assert.deepEqual(dogAppearance(gait,0,0,last+10000),{walking:false,frame:6});assert.equal(dogAppearance(gait,2,0,last+10016).walking,true);
});
test('dog poses have separate texture keys and one consistent opaque ground anchor',()=>{
 const keys=new Set<string>();for(const walk of [true,false])for(let i=0;i<(walk?16:8);i++)keys.add(dogTexture(walk,i));assert.equal(keys.size,24);
 for(const offset of [0,2,5]){const p=new Uint8ClampedArray(12*16*4);for(let y=2+offset;y<8+offset;y++)for(let x=1;x<6;x++)p.set([170,110,50,230],(y*12+x)*4);const original=p.slice(),out=anchorDogPixels(p,12,16),occupied=[];for(let i=0;i<12*16;i++)if(out[i*4+3])occupied.push(i);assert.equal(Math.max(...occupied.map(i=>Math.floor(i/12))),14);assert.equal(Math.min(...occupied.map(i=>i%12)),3);assert.equal(occupied.length,30);assert.deepEqual(p,original);assert.ok(out.every((v,i)=>i%4!==3||v===0||v===255));}
});

test('horizontal gait swings front and rear paws in opposition without moving or duplicating the torso',()=>{
 const w=48,h=48,p=new Uint8ClampedArray(w*h*4);
 for(let y=20;y<36;y++)for(let x=8;x<40;x++)p.set([180,110,40,255],(y*w+x)*4);
 for(let y=36;y<47;y++)for(const x of [12,13,34,35])p.set([240,180,90,255],(y*w+x)*4);
 const original=p.slice();
 for(const facing of [1,2]){
  const frames=Array.from({length:4},(_,phase)=>dogWalkPixels(p,w,h,phase,facing));
  for(const frame of frames){assert.deepEqual(frame.slice(0,35*w*4),p.slice(0,35*w*4));assert.ok(frame.every((v,i)=>i%4!==3||v===0||v===255));}
  const footX=(frame:Uint8ClampedArray,half:number)=>{const xs=[];for(let x=half*24;x<(half+1)*24;x++)if(frame[(46*w+x)*4+3])xs.push(x);return xs;};
  assert.deepEqual(footX(frames[0],0),[9,10]);assert.deepEqual(footX(frames[2],0),[15,16]);assert.deepEqual(footX(frames[0],1),[37,38]);assert.deepEqual(footX(frames[2],1),[31,32]);
  assert.deepEqual(footX(frames[1],0),[]);assert.deepEqual(footX(frames[3],1),[]);assert.equal(new Set(frames.map(f=>Buffer.from(f).toString('base64'))).size,4);
 }
 assert.deepEqual(p,original);
});
