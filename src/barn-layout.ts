import { penDogMotion } from './dog-motion.js';
import type { Animal, AnimalKind } from './content.js';
import type { Obstacle } from './pathfinding.js';
export const ANIMAL_SIZE:Record<AnimalKind,{width:number;height:number}>={rooster:{width:26,height:27},chick:{width:13,height:14},cow:{width:68,height:62},goat:{width:44,height:47},dog:{width:34,height:32},chicken:{width:21,height:23}};
const capacity:Record<AnimalKind,number>={cow:2,goat:3,dog:4,chicken:6,rooster:6,chick:6};
export type BarnPen=Obstacle&{id:number;side:'left'|'right';animals:Animal[];kind?:AnimalKind;purpose:string;access:{x:number;y:number}};
export function barnLayout(animals:Animal[]):BarnPen[]{
 const pens:BarnPen[]=Array.from({length:8},(_,id)=>({id,x:id%2?680:185,y:260+Math.floor(id/2)*132,width:335,height:110,side:id%2?'right':'left',animals:[],purpose:['Feno e cama limpa','Reserva de ração','Palha seca','Utensílios limpos'][Math.floor(id/2)],access:{x:id%2?650:550,y:323+Math.floor(id/2)*132}}));
 const preferred:Record<AnimalKind,number[]>={rooster:[1,3,5,7,0,2,4,6],chick:[1,3,5,7,0,2,4,6],cow:[0,2,4,6,1,3,5,7],goat:[2,4,6,0,3,5,7,1],chicken:[1,3,5,7,0,2,4,6],dog:[7,5,3,1,6,4,2,0]};
 for(const kind of ['cow','goat','chicken','dog'] as AnimalKind[]){const group=animals.filter(a=>kind==='chicken'?['chicken','rooster','chick'].includes(a.kind):a.kind===kind);while(group.length){const p=preferred[kind].map(id=>pens[id]).find(p=>!p.kind);if(!p)throw new Error('O celeiro comporta até 12 animais.');p.kind=kind;p.width={cow:335,goat:315,chicken:285,dog:290,rooster:285,chick:285}[kind];if(p.side==='left')p.x=520-p.width;p.animals=group.splice(0,capacity[kind]);p.purpose=kind==='chicken'?'Galinheiro · ninhos e poleiros':kind==='dog'?'Cantinho dos cães':kind==='cow'?'Baias das vacas':'Baias das cabras';}}
 return pens;
}
export function animalPose(pen:BarnPen,index:number,time:number){
 const animal=pen.animals[index],size=ANIMAL_SIZE[animal.kind],columns=pen.kind==='chicken'?3:capacity[animal.kind];
 const rows=pen.kind==='chicken'?2:1,col=index%columns,row=Math.floor(index/columns);
 const cellWidth=(pen.width-38)/columns,x=pen.x+19+cellWidth*(col+.5),y=pen.y+(rows===2?52+row*32:91);
 const phase=time/1000+index*1.9+pen.id,walk=Math.sin(phase*.7)>.25;
 const dog=animal.kind==='dog'?penDogMotion(time,index):null;
 return {x:x+(dog?dog.x:Math.sin(phase*.85)*(walk?7:1)),y:y+(dog?dog.y:Math.cos(phase*.6)*2),width:size.width,height:size.height*(1+Math.sin(phase*2.3)*.012),flip:!dog&&Math.cos(phase*.85)<0,blink:Math.floor((time+index*673+pen.id*191)/140)%37===0,eating:!dog&&!walk&&Math.sin(phase*1.7)>.45,dog};
}
