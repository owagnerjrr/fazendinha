import type Phaser from 'phaser';

/** Snap only the rendered translation. Never feed rounded coordinates back into follow easing. */
export function stableCameraScroll(camera:Phaser.Cameras.Scene2D.Camera){
 const original=camera.preRender;
 let state:{x:number;y:number;drawX:number;drawY:number}|undefined;
 const render=function(this:Phaser.Cameras.Scene2D.Camera & {rotation?:number}){
  if(state){
   if(this.scrollX===state.drawX)this.scrollX=state.x;
   if(this.scrollY===state.drawY)this.scrollY=state.y;
  }
  original.call(this);
  // Fractional zoom / rotation (e.g. the bed cinematic) needs its continuous transform.
  if(this.roundPixels||(this.rotation??0)!==0||!Number.isInteger(this.zoomX)||!Number.isInteger(this.zoomY)||this.zoomX<=0||this.zoomY<=0){state=undefined;return;}
  const x=this.scrollX,y=this.scrollY,drawX=Math.round(x*this.zoomX)/this.zoomX,drawY=Math.round(y*this.zoomY)/this.zoomY;
  state={x,y,drawX,drawY};
  this.scrollX=drawX;this.scrollY=drawY;
  this.midPoint.x+=drawX-x;this.midPoint.y+=drawY-y;
 };
 camera.preRender=render;
 return()=>{if(camera.preRender===render){camera.preRender=original;if(state){if(camera.scrollX===state.drawX)camera.scrollX=state.x;if(camera.scrollY===state.drawY)camera.scrollY=state.y;}}};
}
