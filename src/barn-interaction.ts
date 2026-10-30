/** Pick one animal from the approached pen, using its current visual position. */
export function nearestPenAnimal<T extends {pen:{id:number};sprite:{x:number;y:number}}>(actors:readonly T[],penId:number,player:{x:number;y:number}){
 let nearest:T|undefined,best=Infinity;
 for(const actor of actors){if(actor.pen.id!==penId)continue;const d=Math.hypot(player.x-actor.sprite.x,player.y-actor.sprite.y);if(d<best){best=d;nearest=actor;}}
 return nearest;
}
