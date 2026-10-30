import test from 'node:test';import assert from 'node:assert/strict';
import {isStaticFloorNode,retainLiveFloorNode,cacheFloorNodes} from '../src/floor-cache';
function node(x=0,y=0,visible=true){return{depth:2,x,y,visible,active:true,destroyed:false,destroy(){this.destroyed=true;}};}
test('floor capture preserves hidden needs/eggs and explicitly live images at depth zero',()=>{
 const floor=node(160,220),hiddenNeed=node(0,0,false),egg=retainLiveFloorNode(node(0,0,true));hiddenNeed.depth=0;egg.depth=0;
 const nodes=[floor,hiddenNeed,egg].filter(isStaticFloorNode),drawn:unknown[]=[];
 assert.equal(cacheFloorNodes(nodes,{x:140,y:130},{beginDraw(){},batchDraw(n,x,y){drawn.push([n,x,y]);},endDraw(){},destroy(){}}),1);
 assert.equal(floor.destroyed,true);assert.equal(hiddenNeed.destroyed,false);assert.equal(egg.destroyed,false);assert.equal(drawn.length,1);
 // The next animation tick can reveal needs and move the egg without touching a destroyed image.
 hiddenNeed.visible=true;egg.x=739;assert.equal(isStaticFloorNode(egg),false);
});
test('floor art retains its own offset instead of stamping every object at the same position',()=>{
 const wood=node(160,220),straw=node(185,260),positions:number[][]=[];
 cacheFloorNodes([wood,straw],{x:140,y:130},{beginDraw(){},batchDraw(_n,x,y){positions.push([x,y]);},endDraw(){},destroy(){}});
 assert.deepEqual(positions,[[20,90],[45,130]]);
});
test('a failed render-target capture keeps original art and closes the draw batch',()=>{
 const art=node();let ended=0,removed=0;
 assert.equal(cacheFloorNodes([art],{x:0,y:0},{beginDraw(){},batchDraw(){throw Error('target unavailable');},endDraw(){ended++;},destroy(){removed++;}}),0);
 assert.equal(art.destroyed,false);assert.equal(ended,1);assert.equal(removed,1);
});
