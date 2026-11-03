import{roamGate,type AnimalRoom}from'./animal-autonomy';
import{ENTRANCES}from'./entrances';
import type{Point}from'./pathfinding';
/** The schedule chooses a destination; visible animals still have to reach its doorway. */
export function autonomyPassage(room:AnimalRoom,next:AnimalRoom):Point{
 if(room==='farm'&&(next==='house'||next==='barn')){const door=ENTRANCES.find(e=>e.id===next)!;return{x:door.x,y:door.y+12};}
 return roamGate(room,next);
}
export function roamingPresence(room:AnimalRoom,destination:AnimalRoom,position?:Point,engaged=false){
 if(room===destination)return{visible:true,exit:undefined};
 if(!position)return{visible:false,exit:undefined};
 if(engaged)return{visible:true,exit:undefined};
 const exit=autonomyPassage(room,destination);
 return{visible:Math.hypot(position.x-exit.x,position.y-exit.y)>14,exit};
}
