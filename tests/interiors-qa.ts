import {AutoWake,CLOCK_HTML,updateClock} from '../src/time-ui';
import Phaser from 'phaser';import {InteriorScene} from '../src/interiors';import {createArt} from '../src/art';import {makeFarm} from '../src/farm';import {applyLife} from '../src/life-rules';import {splitLocalFarm,restoreLocalFarm} from '../src/local-farm';
let failNextRoom=false;let farm=makeFarm();farm.avatar={style:'puffs',skin:4,hair:0,shirt:2};farm.animals=['cow','goat','chicken','chicken','dog','rooster','chick'].map((kind,i)=>({id:`qa-${i}`,kind:kind as 'cow'|'goat'|'chicken'|'dog'|'rooster'|'chick',fedAt:Date.now(),wateredAt:Date.now(),collectedAt:Date.now()}));
const $=(id:string)=>document.getElementById(id)!;const panel=$('panel') as HTMLDialogElement;const status=(text:string)=>$('state').textContent=text;
const open=(title:string,body:string)=>{$('title').textContent=title;$('body').textContent=body;panel.showModal();};$('close').onclick=()=>panel.close();
async function homeCommand(c:unknown){const result=applyLife(farm,c,Date.now());if(!result.ok)throw new Error(result.message);const saved=splitLocalFarm(farm);sessionStorage.setItem('qa-interior-save',JSON.stringify(saved));return result;}
const wake=new AutoWake();$('qa-clock').innerHTML=CLOCK_HTML;
setInterval(()=>{updateClock($('qa-clock'),farm,Date.now());wake.update(farm,Date.now(),homeCommand);if(game?.scene.isActive('Interior'))status(`${interior.getActivity()} · TV ${farm.home?.tvOn?'ligada':'desligada'} · QA sem contas`);},250);
const interior=new InteriorScene({farm:()=>{if(failNextRoom){failNextRoom=false;throw new Error('Falha de renderização induzida apenas no QA');}return farm;},stick:()=>({x:0,y:0}),modal:()=>panel.open,tool:()=> 'hand',now:()=>Date.now(),avatar:()=>open('Guarda-roupa','Acesso à personalização preservado'),animals:id=>open('Cuidar do animal',id??'Painel alcançado pelo portão'),equipment:()=>open('Equipamentos','Acesso preservado'),failed:(error)=>{game.scene.stop('Interior');open('Falha recuperada',error.message+' · feche e use Celeiro para tentar novamente');},toast:status,open,home:homeCommand,exit:()=>status('Saída e retorno à fazenda confirmados'),care:async c=>{const result=applyLife(farm,c,Date.now());if(!result.ok)throw new Error(result.message);const saved=splitLocalFarm(farm);sessionStorage.setItem('qa-interior-save',JSON.stringify(saved));$('qa-care-log').textContent=`Cuidados salvos em dados fictícios · ${c.type} · moedas ${farm.coins} · ração ${farm.feed}`;}});
let room:'house'|'barn'='house';let game:Phaser.Game;
function enter(next:'house'|'barn'){room=next;game.scene.stop('Interior');game.scene.start('Interior',{room});status('QA · dados fictícios · '+room);}
$('house').onclick=()=>enter('house');$('barn').onclick=()=>enter('barn');$('view').onclick=()=>interior.toggleView();
async function bond(id:string,type:'pet-animal'|'play-animal'){if(room!=='barn'){await new Promise<void>(resolve=>{interior.events.once('create',()=>resolve());enter('barn');});}try{await interior.bond(id,type);status(`Concluído e salvo · ${type} · moedas ${farm.coins} · ração ${farm.feed}`);}catch(e){status((e as Error).message);}}
$('pet').onclick=()=>void bond('qa-2','pet-animal');$('play').onclick=()=>void bond('qa-4','play-animal');
$('reload').onclick=()=>{const saved=JSON.parse(sessionStorage.getItem('qa-interior-save')??'null');if(!saved){status('Nenhum cuidado salvo ainda.');return;}farm=restoreLocalFarm(saved.core,saved.land);enter('barn');$('qa-care-log').textContent=`Recarga: carinho ${farm.animals.find(a=>a.id==='qa-2')?.pettedAt?'preservado':'ausente'} · brincadeira ${farm.animals.find(a=>a.id==='qa-4')?.playedAt?'preservada':'ausente'} · moedas ${farm.coins} · ração ${farm.feed}`;};
class Boot extends Phaser.Scene{constructor(){super('Farm');}preload(){this.load.image('farmer-v2','/assets/v2/farmer.png');for(const k of ['dog-walk','dog-rest'])this.load.spritesheet(k,`/assets/v7/${k}.png`,{frameWidth:48,frameHeight:48});for(const k of ['bed','sofa','tv','wardrobe','rack','window','flowerPlanter','cow','goat','dog','chicken'])this.load.image(`life-${k}`,`/assets/v5/${k}.png`);for(const k of ['chick','rooster'])this.load.image(`life-${k}`,`/assets/v8/${k}.png`);for(const d of ['down','left','right','up'])this.load.image(`head-puffs-${d}`,`/assets/v5/head-puffs-${d}.png`);}create(){createArt(this);this.scene.add('Interior',interior);this.scene.start('Interior',{room});}}
game=new Phaser.Game({type:Phaser.AUTO,parent:'game',pixelArt:true,scale:{mode:Phaser.Scale.RESIZE,width:innerWidth,height:innerHeight},physics:{default:'arcade'},scene:[Boot]});

$('sit').onclick=()=>interior.requestHouseInteraction('sofa');$('sleep').onclick=()=>interior.requestHouseInteraction('bed');$('tv').onclick=()=>interior.requestHouseInteraction('tv');
$('advance').onclick=()=>{farm.calendar!.offsetMinutes+=360;};$('season').onclick=()=>{farm.calendar!.offsetMinutes+=28*1440;};

// Observe actual idle atlas frames, including the final seated/lying pose.
let breathActivity='',breathFrames=new Set<string|number>();
setInterval(()=>{
 if(!game.scene.isActive('Interior'))return;const activity=interior.getActivity();if(activity!==breathActivity){breathActivity=activity;breathFrames.clear();}
 const actor=interior.children.list.find(o=>o instanceof Phaser.GameObjects.Sprite&&o.visible&&o.texture.key.startsWith('avatar-')) as Phaser.GameObjects.Sprite|undefined;
 if(!actor||!['Em pé','Sentada no sofá','Dormindo na cama'].includes(activity)){$('breath-state').textContent='Respiração em pausa durante movimento/transição.';return;}
 if(actor.texture.key.includes('-idle-'))breathFrames.add(actor.frame.name);
 $('breath-state').textContent=`${activity}: quadros de repouso ${[...breathFrames].join(', ')} · ${breathFrames.size>1?'respiração observada':'observando ciclo…'}`;
},100);

// Fixture-only populations; never reads or overwrites a player's farm.
const qaAnimals=farm.animals.map(a=>({...a}));
$('starter').onclick=()=>{farm.animals=qaAnimals.filter((a,i)=>i===2||a.kind==='dog').map(a=>({...a}));enter('barn');};
$('populated').onclick=()=>{farm.animals=qaAnimals.map(a=>({...a}));enter('barn');};

$('fail-room').onclick=()=>{failNextRoom=true;enter('barn');};
