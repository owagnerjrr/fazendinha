import test from 'node:test';import assert from 'node:assert/strict';
import {idlePixels} from '../src/idle-pixels';import {IdleBreathing} from '../src/idle-art';import {FrameBudget} from '../src/frame-budget';import {parseDisplay} from '../src/display-settings';
test('idle pixel frames visibly move head and hands together while feet and lower legs stay identical',()=>{
 const w=12,h=30,source=new Uint8ClampedArray(w*h*4);const pixel=(x:number,y:number,color:number)=>source.set([color,50,20,255],(y*w+x)*4);
 pixel(5,4,210);pixel(2,12,180);pixel(9,12,180);for(let y=15;y<30;y++){pixel(4,y,80);pixel(7,y,80);}
 for(const rise of [0,1,2]){const frame=idlePixels(source,w,h,14,20,rise);assert.deepEqual(frame.slice(20*w*4),source.slice(20*w*4));assert.equal(frame[((4-rise)*w+5)*4],210);assert.equal(frame[((12-rise)*w+2)*4],180);assert.equal(frame[((12-rise)*w+9)*4],180);}
 const idle=new IdleBreathing();assert.equal(idle.frame(100,false,false,false),0);assert.equal(idle.frame(1600,false,false,false),2);assert.equal(idle.frame(3100,false,false,false),0);assert.equal(idle.frame(3200,true,false,false),0);assert.equal(idle.frame(5000,false,false,true),0);
});
test('FPS budget measures elapsed frames, keeps stalls and changes effects with hysteresis, never reports the target as achieved',()=>{
 const b=new FrameBudget();let now=100;for(let i=0;i<300;i++)b.tick(now+=1000/60,true,3);assert.ok(b.fps>59&&b.fps<61);assert.ok(b.p95<17);assert.equal(b.cpu95,3);assert.equal(b.light,false);
 for(let i=0;i<200;i++)b.tick(now+=1000/30,true,5);assert.ok(b.fps<31);assert.equal(b.light,true);
 for(let i=0;i<800;i++)b.tick(now+=1000/60,true,2);assert.equal(b.light,false);b.tick(now,false);b.tick(now+=10000);b.tick(now+=2000,true,4);assert.equal(b.fps,.5);assert.equal(b.p95,2000);
 assert.deepEqual(parseDisplay('bad'),{breathing:true,effects:'auto'});assert.deepEqual(parseDisplay('{"breathing":false,"effects":"light"}'),{breathing:false,effects:'light'});
});
