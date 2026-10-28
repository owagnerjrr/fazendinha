/** Counts real rendered game steps, never the configured target FPS. */
export class FrameBudget {
 private start:number|null=null;private last=0;private samples:number[]=[];private work:number[]=[];private slow=0;private fast=0;
 fps=0;p95=0;cpu95=0;light=false;
 reset(){this.start=null;this.last=0;this.samples=[];this.work=[];this.slow=0;this.fast=0;}
 tick(now:number,active=true,workMs=0){
  if(!active){this.reset();return false;}
  if(this.start===null){this.start=now;this.last=now;return false;}
  const dt=now-this.last;this.last=now;if(dt<=0)return false;
  this.samples.push(dt);this.work.push(workMs);if(now-this.start<2000)return false;
  this.fps=this.samples.length*1000/(now-this.start);const sorted=this.samples.slice().sort((a,b)=>a-b);this.p95=sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))];
  this.work.sort((a,b)=>a-b);this.cpu95=this.work[Math.min(this.work.length-1,Math.floor(this.work.length*.95))];
  this.slow=this.fps<50?this.slow+1:0;this.fast=this.fps>57?this.fast+1:0;
  if(this.slow>=2)this.light=true;if(this.fast>=5)this.light=false;
  this.start=now;this.samples=[];this.work=[];return true;
 }
}
