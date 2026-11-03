/** Interpolate only the presentation between two already resolved physics positions. */
export class PhysicsPose {
 readonly position:{x:number;y:number};
 private dx=0;private dy=0;private body?:{x:number;y:number};private previous?:{x:number;y:number};
 constructor(position:{x:number;y:number}){this.position={x:position.x,y:position.y};}
 step(from:{x:number;y:number},to:{x:number;y:number}){const dx=to.x-from.x,dy=to.y-from.y,safe=Math.hypot(dx,dy)<=32;this.dx=safe?dx:0;this.dy=safe?dy:0;this.body={x:to.x,y:to.y};}
 sample(source:{x:number;y:number},body:{x:number;y:number},alpha:number){
  if((this.body&&Math.hypot(body.x-this.body.x,body.y-this.body.y)>.001)||(this.previous&&Math.hypot(source.x-this.previous.x,source.y-this.previous.y)>32)){this.dx=this.dy=0;this.body=undefined;}
  const t=Math.max(0,Math.min(1,alpha));this.position.x=source.x-this.dx*(1-t);this.position.y=source.y-this.dy*(1-t);this.previous={x:source.x,y:source.y};return this.position;
 }
}
