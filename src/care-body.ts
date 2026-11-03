import type Phaser from'phaser';import type{Avatar}from'./content';import type{AvatarArt}from'./avatar-art';
/** Short lived render state; never changes saved avatar or animal data. */
export function markCareBody(scene:Phaser.Scene,side:number,visible=true){if(visible)scene.data.set('care-body',{side,until:performance.now()+100});}
export function applyCareBody(scene:Phaser.Scene,art:AvatarArt,actor:Phaser.GameObjects.Image,avatar:Avatar){const pose=scene.data.get('care-body');if(pose&&pose.until>performance.now())actor.setTexture(art.key('care-body',avatar),pose.side<0?1:2).setOrigin(.5,62/64).setScale(1.08);}
