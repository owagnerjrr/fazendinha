import type {Obstacle} from './pathfinding.js';
export const HOUSE_BOUNDS={x:270,y:220,width:660,height:500};
export const HOUSE_PROPS=[
 {kind:'lamp',x:303,y:703,width:42,height:70,facing:'south',body:{x:0,y:0,width:0,height:0},access:{x:352,y:685},name:'Luz'},
 {kind:'bed',x:317,y:315,width:74,height:84,facing:'south',body:{x:284,y:271,width:66,height:42},access:{x:376,y:337},name:'Cama'},
 {kind:'wardrobe',x:887,y:315,width:66,height:90,facing:'south',body:{x:857,y:283,width:60,height:30},access:{x:887,y:349},name:'Guarda-roupa'},
 {kind:'tv',x:740,y:326,width:78,height:90,facing:'south',body:{x:705,y:307,width:70,height:18},access:{x:740,y:359},name:'TV'},
 {kind:'sofa',x:740,y:520,width:124,height:78,facing:'north',body:{x:681,y:473,width:118,height:44},access:{x:829,y:497},name:'Sofá'},
 {kind:'coffee',x:740,y:417,width:80,height:42,facing:'south',body:{x:704,y:391,width:72,height:23},access:{x:814,y:414},name:'Mesa de centro'},
 {kind:'table',x:410,y:540,width:94,height:55,facing:'south',body:{x:367,y:510,width:86,height:27},access:{x:484,y:545},name:'Mesa'},
 {kind:'chair',x:410,y:587,width:32,height:40,facing:'north',body:{x:397,y:566,width:26,height:18},access:{x:466,y:587},name:'Cadeira'},
] as const;
export const HOUSE_LAMP={x:303,y:703};
export const HOUSE_SEAT={x:740,y:514};
export const HOUSE_SLEEP={x:317,y:294};
export const HOUSE_TV_SCREEN={x:710,y:271,width:39,height:24};
export const HOUSE_DETAIL_BODIES:Obstacle[]=[{x:286,y:680,width:34,height:21}];
export const HOUSE_WALLS:Obstacle[]=[{x:258,y:154,width:16,height:580},{x:928,y:154,width:16,height:580},{x:270,y:154,width:660,height:70},{x:270,y:716,width:280,height:16},{x:650,y:716,width:280,height:16}];
