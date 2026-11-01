/** Pace rendered game steps at 60 Hz while retaining fractional time across browser refreshes. */
export class FramePacer{
 private last:number|undefined;private next=0;private interval:number;
 constructor(fps=60){this.interval=1000/fps;}
 reset(){this.last=undefined;this.next=0;}
 advance(time:number){if(this.last===undefined){this.last=time;this.next=time+this.interval;return 0;}if(time+.4<this.next)return 0;const delta=Math.min(100,Math.max(0,time-this.last));this.last=time;this.next+=Math.max(1,Math.floor((time-this.next)/this.interval)+1)*this.interval;return delta;}
}
export function paceLoop(loop:{callback:(time:number,delta:number)=>void},pacer:FramePacer){const step=loop.callback;loop.callback=(time:number)=>{const delta=pacer.advance(time);if(delta>0)step(time,delta);};}
