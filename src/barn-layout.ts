import {livestockMotion} from './livestock-motion.js';
import { penDogMotion } from './dog-motion.js';
import type { Animal, AnimalKind } from './content.js';
import type { Obstacle } from './pathfinding.js';
export const ANIMAL_SIZE:Record<AnimalKind,{width:number;height:number}>={cat:{width:38,height:42},rooster:{width:31,height:32},chick:{width:16,height:17},cow:{width:68,height:62},goat:{width:44,height:47},dog:{width:34,height:32},chicken:{width:27,height:29}};
const capacity:Record<AnimalKind,number>={cat:4,cow:2,goat:3,dog:4,chicken:6,rooster:6,chick:6};
export type BarnPen=Obstacle&{id:number;side:'left'|'right';animals:Animal[];kind?:AnimalKind;purpose:string;access:{x:number;y:number}};
export function barnLayout(animals:Animal[]):BarnPen[]{
 animals=animals.filter(a=>a.kind!=='cat'&&a.kind!=='dog'&&!a.walking&&(!a.housing||a.housing==='barn'));
 const pens:BarnPen[]=Array.from({length:8},(_,id)=>({id,x:id%2?680:185,y:260+Math.floor(id/2)*132,width:335,height:110,side:id%2?'right':'left',animals:[],purpose:['Feno e cama limpa','Reserva de ração','Palha seca','Utensílios limpos'][Math.floor(id/2)],access:{x:id%2?650:550,y:323+Math.floor(id/2)*132}}));
 const preferred:Record<AnimalKind,number[]>={cat:[6,4,2,0,7,5,3,1],rooster:[1,3,5,7,0,2,4,6],chick:[1,3,5,7,0,2,4,6],cow:[0,2,4,6,1,3,5,7],goat:[2,4,6,0,3,5,7,1],chicken:[1,3,5,7,0,2,4,6],dog:[7,5,3,1,6,4,2,0]};
 for(const kind of ['cow','goat','chicken','dog','cat'] as AnimalKind[]){const group=animals.filter(a=>kind==='chicken'?['chicken','rooster','chick'].includes(a.kind):a.kind===kind);while(group.length){const p=preferred[kind].map(id=>pens[id]).find(p=>!p.kind);if(!p)throw new Error('O celeiro comporta até 12 animais.');p.kind=kind;p.width={cat:290,cow:335,goat:315,chicken:285,dog:290,rooster:285,chick:285}[kind];if(p.side==='left')p.x=520-p.width;p.animals=group.splice(0,capacity[kind]);p.purpose=kind==='chicken'?'Galinheiro · ninhos e poleiros':kind==='cat'?'Cantinho dos gatos':kind==='dog'?'Cantinho dos cães':kind==='cow'?'Baias das vacas':'Baias das cabras';}}
 return pens;
}
export function animalPose(pen:BarnPen,index:number,time:number){
 const animal=pen.animals[index],size=ANIMAL_SIZE[animal.kind],motion=livestockMotion(pen,index,pen.animals.length,size,time,pen.id,animal.kind);
 const dog=animal.kind==='dog'?penDogMotion(time,index):null;
 const cellWidth=(pen.width-38)/4,dogX=pen.x+19+cellWidth*(index+.5),dogY=pen.y+91;
 return {x:dog?dogX+dog.x:motion.x,y:dog?dogY+dog.y:motion.y,width:size.width,height:size.height,flip:!dog&&motion.flip,blink:Math.floor((time+index*673+pen.id*191)/140)%37===0,eating:!dog&&!motion.walking&&Math.sin(time/700+index)>.3,dog,walking:dog?.walking??motion.walking,frame:motion.frame};
}
