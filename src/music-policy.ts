export type MusicEnvironment='outdoors'|'barn'|'house'|'vartin';
export const MUSIC_TRACKS={outdoors:{name:'Fazenda e Campos do Sul',source:'Musica da Fazenda e Sul.mp3',src:'/assets/music-v1/outdoors.mp3'},barn:{name:'Celeiro',source:'Musica Celeiro.mp3',src:'/assets/music-v1/barn.mp3'},house:{name:'Casa',source:'Musica da casa.mp3',src:'/assets/music-v1/house.mp3'},vartin:{name:'Venda do Vartin',source:'Venda do Vartin.mp3',src:'/assets/music-v1/vartin.mp3'}} as const;
export const MUSIC_FADE=.85,LOOP_FADE=1.2;
export function musicEnvironment(s:{shop?:boolean;room?:string|null}):MusicEnvironment{return s.shop?'vartin':s.room==='barn'?'barn':s.room==='house'?'house':'outdoors';}
export function musicGain(volume:number,ceiling=1){return Math.min(.85,Math.max(0,Math.min(1,Number.isFinite(volume)?volume:0,Number.isFinite(ceiling)?ceiling:1))*1.25);}
export function nearMusicEnd(time:number,duration:number){return Number.isFinite(duration)&&duration>LOOP_FADE*2&&time>=duration-LOOP_FADE-.15;}
export function musicFadeCurve(incoming:boolean,scale=1){return Float32Array.from({length:64},(_,i)=>scale*(incoming?Math.sin(i/63*Math.PI/2):Math.cos(i/63*Math.PI/2)));}
