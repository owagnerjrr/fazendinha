import type{Point}from'./pathfinding';
export type LeisureKind='sit'|'picnic'|'ducks'|'flowers';
export const SOUTH_LEISURE=[
 {id:'spring-bench',kind:'sit',label:'Sentar no banco',point:{x:570,y:335},seat:{x:582,y:305},hit:{x:582,y:293},radius:39},
 {id:'garden-bench',kind:'sit',label:'Sentar no banco',point:{x:746,y:1010},seat:{x:746,y:985},hit:{x:746,y:972},radius:58},
 {id:'picnic',kind:'picnic',label:'Fazer piquenique',point:{x:432,y:960},seat:{x:432,y:930},hit:{x:432,y:892},radius:53},
 {id:'spring-ducks',kind:'ducks',label:'Brincar com os patos',point:{x:519,y:311},seat:{x:519,y:311},hit:{x:360,y:284},radius:134,pond:0},
 {id:'lake-ducks',kind:'ducks',label:'Brincar com os patos',point:{x:1025,y:921},seat:{x:1025,y:921},hit:{x:1200,y:930},radius:142,pond:1},
 {id:'flowers',kind:'flowers',label:'Admirar as flores',point:{x:746,y:922},seat:{x:746,y:922},hit:{x:746,y:910},radius:79}
] as const;
export type LeisureTarget=typeof SOUTH_LEISURE[number];
export type DuckPlay={pond:number;started:number};
export function nearbyLeisure(p:Point){return SOUTH_LEISURE.filter(t=>Math.hypot(p.x-t.point.x,p.y-t.point.y)<53).sort((a,b)=>Math.hypot(p.x-a.point.x,p.y-a.point.y)-Math.hypot(p.x-b.point.x,p.y-b.point.y))[0];}
export function leisureHit(p:Point){return SOUTH_LEISURE.find(t=>Math.hypot(p.x-t.hit.x,p.y-t.hit.y)<t.radius);}
export function duckToy(pond:number,time:number,started:number){const t=Math.max(0,time-started);return{x:(pond===0?450:1110)+Math.sin(t/900)*12,y:(pond===0?299:919)+Math.cos(t/1100)*5};}
