import test from 'node:test';import assert from 'node:assert/strict';import {nearestPenAnimal} from '../src/barn-interaction';
test('barn care chooses only the nearest animal in the approached pen, including after movement',()=>{
 const hen={id:'hen',pen:{id:1},sprite:{x:710,y:300}},rooster={id:'rooster',pen:{id:1},sprite:{x:780,y:350}},cow={id:'cow',pen:{id:0},sprite:{x:640,y:323}};const animals=[hen,rooster,cow];
 assert.equal(nearestPenAnimal(animals,1,{x:650,y:323})?.id,'hen');
 hen.sprite.x=900;assert.equal(nearestPenAnimal(animals,1,{x:650,y:323})?.id,'rooster');
 assert.equal(nearestPenAnimal(animals,1,{x:800,y:360})?.id,'rooster');assert.equal(nearestPenAnimal(animals,0,{x:650,y:323})?.id,'cow');assert.equal(nearestPenAnimal(animals,7,{x:650,y:323}),undefined);
});
