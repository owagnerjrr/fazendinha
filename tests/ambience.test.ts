import test from 'node:test';import assert from 'node:assert/strict';
import {penDogMotion,dogFrame,dogFollowRoute} from '../src/dog-motion';
import {newWeather,advanceWeather,windAmount,birdPosition} from '../src/weather-state';
import {ENTRANCES,entranceAt,nearestEntrance,entranceUnlocked} from '../src/entrances';
test('dog walks a closed loop in four directions, changes paw frames and genuinely stops to rest',()=>{
 const directions=new Set<number>(),frames=new Set<number>();let last=penDogMotion(0);
 for(let t=100;t<8000;t+=100){const p=penDogMotion(t);assert.ok(p.walking);assert.ok(Math.hypot(p.x-last.x,p.y-last.y)<2);directions.add(p.facing);frames.add(p.frame);last=p;}
 assert.equal(directions.size,4);assert.ok(frames.size>8);const a=penDogMotion(13000),b=penDogMotion(15000);assert.equal(a.resting,true);assert.equal(a.walking,false);assert.equal(a.x,b.x);assert.equal(a.y,b.y);assert.equal(dogFrame(2,0),8);assert.equal(dogFrame(2,5),9);assert.deepEqual(penDogMotion(18000),penDogMotion(0));
});
test('dog follows a reachable free offset and its route cannot cross a building or end inside the player',()=>{
 const owner={x:580,y:450},wall={x:400,y:400,width:120,height:100};const route=dogFollowRoute({x:350,y:450},owner,0,[wall]);assert.ok(route.length);const end=route.at(-1)!;assert.ok(Math.hypot(end.x-owner.x,end.y-owner.y)>=47);for(const p of route)assert.ok(!(p.x>=388&&p.x<=532&&p.y>=395&&p.y<=517));
});
test('birds and leaves remain bounded through an hour and turn off with reduced motion',()=>{
 for(const mobile of [false,true]){const s=newWeather();for(let t=0;t<3600000;t+=500){advanceWeather(s,t,mobile,false);assert.ok(s.birds.length<=(mobile?2:4));assert.ok(s.leaves.length<=(mobile?5:12));for(const b of s.birds){const p=birdPosition(b,t);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));}}
 advanceWeather(s,3600000,mobile,true);assert.equal(s.birds.length,0);assert.equal(s.leaves.length,0);assert.equal(windAmount(s,3600000,true),0);}
 const s=newWeather();advanceWeather(s,9000,false,false);assert.equal(s.leaves.length,12);assert.ok(windAmount(s,9000,false)>windAmount(s,14000,false));
});
test('all buildings offer the same proximity rules and clicks route to their real entrance',()=>{
 for(const e of ENTRANCES){assert.equal(nearestEntrance({x:e.x,y:e.y})?.id,e.id);assert.equal(entranceAt({x:(e.hit.left+e.hit.right)/2,y:(e.hit.top+e.hit.bottom)/2})?.id,e.id);assert.notEqual(nearestEntrance({x:e.x+85,y:e.y})?.id,e.id);}
 assert.equal(entranceAt({x:710,y:650}),undefined);assert.equal(entranceUnlocked(100,200,false,false,false),false);assert.equal(entranceUnlocked(200,200,false,false,false),true);for(const flags of [[true,false,false],[false,true,false],[false,false,true]])assert.equal(entranceUnlocked(300,200,...flags as [boolean,boolean,boolean]),false);
});
