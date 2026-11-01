import test from 'node:test';import assert from 'node:assert/strict';
import {CROPS,makeFarm,restoreFarm,act,hasPests,sellAll,upgradeFarm} from '../src/farm';import {applyLife} from '../src/life-rules';import {animalReady,dogProtects,validAvatar} from '../src/content';
test('old farms keep coins, crops and identity while adding new content',()=>{const f=makeFarm();const raw:any=structuredClone(f);raw.coins=891;for(const k of ['avatar','animals','products','feed','decorations','socialRaids','visitLog','raidProtectionUntil'])delete raw[k];for(const c of ['strawberry','corn','sunflower','tulip']){delete raw.seeds[c];delete raw.inventory[c];}const restored=restoreFarm(JSON.stringify(raw));assert.equal(restored.coins,891);assert.equal(restored.seeds.carrot,8);assert.equal(restored.seeds.tulip,0);assert.equal(restored.animals[0].kind,'chicken');assert.equal(restored.socialRaids,false);});
test('avatar validates palette bounds and preserves equal game rules',()=>{const f=makeFarm();assert.equal(validAvatar({style:'crop',skin:4,hair:0,shirt:1}),true);assert.equal(applyLife(f,{type:'avatar',avatar:{style:'puffs',skin:5,hair:0,shirt:2}},0).ok,true);assert.equal(f.avatar.skin,5);assert.equal(f.coins,250);assert.equal(applyLife(f,{type:'avatar',avatar:{style:'x',skin:1,hair:0,shirt:0}},0).ok,false);assert.equal(f.avatar.style,'puffs');});
test('animals consume one feed, mature by server time and cannot collect twice',()=>{const f=makeFarm(),a=f.animals[0];assert.equal(applyLife(f,{type:'feed-animal',id:a.id},1000).ok,true);assert.equal(f.feed,4);assert.equal(applyLife(f,{type:'feed-animal',id:a.id},2000).ok,false);assert.equal(animalReady(a,90999),false);assert.equal(applyLife(f,{type:'collect-animal',id:a.id},91000).ok,true);assert.equal(f.products.egg,1);assert.equal(applyLife(f,{type:'collect-animal',id:a.id},91000).ok,false);assert.equal(animalReady(a,86401000),false);assert.equal(sellAll(f),12);assert.equal(f.products.egg,0);assert.equal(sellAll(f),0);});
test('fed dogs protect only for 24 hours and animal purchases enforce funds',()=>{const f=makeFarm();assert.equal(applyLife(f,{type:'buy-animal',kind:'cow'},0).ok,false);assert.equal(applyLife(f,{type:'buy-animal',kind:'dog'},0).ok,true);assert.equal(f.coins,70);const dog=f.animals.at(-1)!;assert.equal(dogProtects(f.animals,0),false);assert.equal(applyLife(f,{type:'feed-animal',id:dog.id},0).ok,true);assert.equal(dogProtects(f.animals,0),false);assert.equal(applyLife(f,{type:'water-animal',id:dog.id},0).ok,true);assert.equal(dogProtects(f.animals,86399999),true);assert.equal(dogProtects(f.animals,86400000),false);});
test('decorations reserve distinct valid spaces and cannot overlap or mint coins',()=>{const f=makeFarm();assert.equal(applyLife(f,{type:'buy-decor',kind:'cocoaTree'},0).ok,true);assert.equal(f.coins,130);assert.equal(applyLife(f,{type:'buy-decor',kind:'flowerPlanter'},1).ok,true);assert.equal(applyLife(f,{type:'move-decor',id:f.decorations[0].id,slot:1},2).ok,false);assert.equal(applyLife(f,{type:'move-decor',id:f.decorations[0].id,slot:7},2).ok,true);assert.equal(applyLife(f,{type:'move-decor',id:f.decorations[0].id,slot:-1},2).ok,false);});
test('pests need a separate care action and theft preserves the owner yield',()=>{const f=makeFarm();for(const tool of ['hoe','seed','water'] as const)assert.equal(act(f,1,tool,'carrot',1000).ok,true);assert.equal(hasPests(f.plots[1],CROPS.carrot.seconds*1000+999),true);assert.equal(act(f,1,'hand','carrot',CROPS.carrot.seconds*1000+1000).harvest,undefined);assert.equal(f.inventory.carrot,0);assert.equal(hasPests(f.plots[1],CROPS.carrot.seconds*1000+1000),false);f.plots[1].stolen=1;assert.equal(act(f,1,'hand','carrot',CROPS.carrot.seconds*1000+1000).harvest,true);assert.equal(f.inventory.carrot,1);});

test('animal identity and water survive saves without replacing legacy animals',()=>{
 const f=makeFarm();f.coins=500;assert.equal(applyLife(f,{type:'buy-animal',kind:'cow'},10).ok,true);
 const cow=f.animals.at(-1)!;const id=cow.id;
 assert.equal(applyLife(f,{type:'rename-animal',id,name:' Mimosa '},20).ok,true);
 assert.equal(cow.name,'Mimosa');assert.equal(applyLife(f,{type:'rename-animal',id,name:'<img>'},21).ok,false);assert.equal(cow.name,'Mimosa');
 assert.equal(applyLife(f,{type:'feed-animal',id},100).ok,true);assert.equal(animalReady(cow,2700100),false);
 assert.equal(applyLife(f,{type:'water-animal',id},100).ok,true);assert.equal(animalReady(cow,2700100),true);
 assert.equal(applyLife(f,{type:'pet-animal',id},150).ok,true);assert.equal(cow.pettedAt,150);
 const restored=restoreFarm(JSON.stringify(f));assert.equal(restored.animals.at(-1)?.name,'Mimosa');assert.equal(restored.animals.at(-1)?.wateredAt,100);
 assert.equal(applyLife(restored,{type:'collect-animal',id},2700100).ok,true);assert.equal(applyLife(restored,{type:'collect-animal',id},2700100).ok,false);
});

test('incubation requires cared-for rooster, reserves one egg and respects time and capacity',()=>{
 const f=makeFarm(),hen=f.animals[0];f.coins=500;f.products.egg=1;
 assert.equal(applyLife(f,{type:'start-incubation',id:hen.id},1000).ok,false);
 assert.equal(applyLife(f,{type:'buy-animal',kind:'rooster'},1000).ok,true);const rooster=f.animals.at(-1)!;
 for(const a of [hen,rooster]){assert.equal(applyLife(f,{type:'feed-animal',id:a.id},2000).ok,true);assert.equal(applyLife(f,{type:'water-animal',id:a.id},2000).ok,true);}
 assert.equal(applyLife(f,{type:'start-incubation',id:hen.id},3000).ok,true);assert.equal(f.products.egg,0);
 assert.equal(applyLife(f,{type:'start-incubation',id:hen.id},3001).ok,false);assert.equal(applyLife(f,{type:'hatch-chick',id:hen.id},122999).ok,false);
 assert.equal(applyLife(f,{type:'hatch-chick',id:hen.id},123000).ok,true);assert.equal(applyLife(f,{type:'hatch-chick',id:hen.id},123000).ok,false);
 const chick=f.animals.at(-1)!;assert.equal(chick.kind,'chick');assert.equal(applyLife(f,{type:'mature-chick',id:chick.id},423000).ok,false);
 assert.equal(applyLife(f,{type:'feed-animal',id:chick.id},124000).ok,true);assert.equal(applyLife(f,{type:'water-animal',id:chick.id},124000).ok,true);
 assert.equal(applyLife(f,{type:'mature-chick',id:chick.id},422999).ok,false);assert.equal(applyLife(f,{type:'mature-chick',id:chick.id},423000).ok,true);assert.equal(chick.kind,'chicken');
 assert.equal(restoreFarm(JSON.stringify(f)).animals.at(-1)?.kind,'chicken');
});

test('a reserved nest counts towards capacity and cannot be overbooked',()=>{
 const f=makeFarm(),hen=f.animals[0];f.coins=10000;f.products.egg=1;
 assert.equal(applyLife(f,{type:'buy-animal',kind:'rooster'},0).ok,true);const rooster=f.animals.at(-1)!;
 for(const a of [hen,rooster]){applyLife(f,{type:'feed-animal',id:a.id},100);applyLife(f,{type:'water-animal',id:a.id},100);}
 for(let i=0;i<2;i++)assert.equal(applyLife(f,{type:'buy-animal',kind:'chicken',pen:0},200+i).ok,true);for(let pen=1;pen<8;pen++)for(let i=0;i<5;i++)assert.equal(applyLife(f,{type:'buy-animal',kind:'chicken',pen},300+pen*5+i).ok,true);
 assert.equal(f.animals.length,39);assert.equal(applyLife(f,{type:'start-incubation',id:hen.id},1000).ok,true);
 assert.equal(applyLife(f,{type:'buy-animal',kind:'chick'},1001).ok,false);
 assert.equal(applyLife(f,{type:'hatch-chick',id:hen.id},121000).ok,true);assert.equal(f.animals.length,40);
});

test('legacy client cannot modify farms containing new kinds',async()=>{
 const {requiresNewClient}=await import('../src/client-compat');const f=makeFarm();assert.equal(requiresNewClient(f,null),false);
 f.coins=500;assert.equal(applyLife(f,{type:'buy-animal',kind:'rooster'},5).ok,true);
 assert.equal(requiresNewClient(f,null),true);assert.equal(requiresNewClient(f,'14'),false);
});

test('buying extra land preserves old crops and grants twelve usable plots exactly once',()=>{
 const f=makeFarm();f.coins=1000;act(f,0,'hoe','carrot',100);act(f,0,'seed','carrot',100);act(f,0,'water','carrot',100);const before=structuredClone(f.plots[0]);
 assert.equal(applyLife(f,{type:'buy-land'},200).ok,true);assert.equal(f.coins,250);assert.equal(f.plots.length,36);assert.deepEqual(f.plots[0],before);
 assert.equal(act(f,24,'hoe','carrot',200).ok,true);assert.equal(act(f,24,'seed','carrot',200).ok,true);assert.equal(act(f,24,'water','carrot',200).ok,true);
 const restored=restoreFarm(JSON.stringify(f));assert.equal(restored.landOwned,true);assert.equal(restored.plots[24].crop,'carrot');assert.equal(restored.plots[0].wateredAt,100);
 assert.equal(applyLife(restored,{type:'buy-land'},300).ok,false);assert.equal(restored.coins,250);assert.equal(restored.plots.length,36);
});
test('online land is unavailable until initial expansion and sufficient funds',()=>{
 const f=makeFarm() as ReturnType<typeof makeFarm>&{unlockedPlots:number};f.unlockedPlots=18;f.coins=1000;
 assert.equal(applyLife(f,{type:'buy-land'},0).ok,false);assert.equal(f.plots.length,24);assert.equal(f.coins,1000);
 f.unlockedPlots=24;f.coins=749;assert.equal(applyLife(f,{type:'buy-land'},0).ok,false);assert.equal(f.plots.length,24);
});
