/** Gentle three-second inhale/exhale, anchored at the sprite's feet. */
export function breathingScale(elapsed:number){
 const phase=Math.max(0,elapsed)%3000/3000;
 return 1+.026*(.5-.5*Math.cos(phase*Math.PI*2));
}
export class IdleBreathing{
 private since:number|null=null;
 reset(){this.since=null;}
 sample(time:number,moving:boolean,acting:boolean,reduced:boolean){
  if(moving||acting||reduced){this.reset();return 1;}
  this.since??=time;return breathingScale(time-this.since);
 }
}
