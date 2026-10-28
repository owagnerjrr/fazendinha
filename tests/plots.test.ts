import test from 'node:test';import assert from 'node:assert/strict';
import {plotPosition} from '../src/plots';import {findPath} from '../src/pathfinding';
test('new plots are distinct and reachable without crossing house or well',()=>{
 const blocks=[{x:318,y:356,width:180,height:88},{x:471,y:518,width:44,height:25},{x:181,y:670,width:18,height:20}];const positions=Array.from({length:12},(_,i)=>plotPosition(24+i)!);
 assert.equal(new Set(positions.map(p=>`${p.x}:${p.y}`)).size,12);
 for(const p of positions){const target={x:p.x-40,y:p.y+10};assert.ok(findPath({x:710,y:650},target,blocks).length,`cant reach ${p.x},${p.y}`);assert.ok(Math.hypot(target.x-p.x,target.y-p.y)<70);}
 assert.equal(plotPosition(36),null);assert.equal(plotPosition(-1),null);
});
