import{audioSource,type MediaRef}from'./studio-assets-client';
import{effectsAudio}from'./sound';
import type{Farm}from'./farm';
import{MUSIC_TRACKS,MUSIC_FADE,LOOP_FADE,musicGain,nearMusicEnd,musicFadeCurve,type MusicEnvironment}from'./music-policy';
type Track={key:string;src:string;name:string};
type Slot={element:HTMLAudioElement;node:MediaElementAudioSourceNode;gain:GainNode;key:string;serial:number;playing?:Promise<void>};
/** Two reusable streaming players: bounded memory, one score, brief crossfades only. */
export class FarmMusic{
 private ctx?:AudioContext;private master?:GainNode;private analyser?:AnalyserNode;
 private slots:Slot[]=[];private current?:Slot;private pending?:Slot;private retired?:Slot;
 private targetGain=-1;private activated=false;private desired='';private until=0;private retryAt=0;private starts=0;private loops=0;private error='';
 private timer?:ReturnType<typeof setInterval>;volume=.25;muted=false;
 constructor(private farm:()=>Farm,private now:()=>number,private environment:()=>MusicEnvironment=()=> 'outdoors'){
  try{const p=JSON.parse(localStorage.getItem('wj-music-v1')??'null');if(p){this.volume=Math.max(0,Math.min(1,Number(p.volume)||0));this.muted=p.muted===true;}}catch{}
  const start=()=>{this.activated=true;void this.play();};document.addEventListener('pointerdown',start,{passive:true});document.addEventListener('keydown',start);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.silence();else if(this.activated)void this.play();});
 }
 private track():Track{const f=this.farm(),s=f.studio,scene=s?.owned.find(e=>e.id===s.position.scene&&e.definition.kind==='scene'),ref=scene?.definition.data.music as MediaRef|undefined,src=audioSource(ref);if(ref&&src)return{key:'studio:'+ref.asset+':'+ref.version,src,name:scene!.definition.name};const id=this.environment(),t=MUSIC_TRACKS[id];return{key:id,src:t.src,name:t.name};}
 private ready(){if(this.ctx)return;const c=this.ctx=new AudioContext({latencyHint:'playback'}),master=this.master=c.createGain(),compressor=c.createDynamicsCompressor(),analyser=this.analyser=c.createAnalyser();master.gain.value=0;compressor.threshold.value=-8;compressor.knee.value=8;compressor.ratio.value=2;compressor.attack.value=.015;compressor.release.value=.25;analyser.fftSize=256;master.connect(compressor).connect(analyser).connect(c.destination);
  for(let i=0;i<2;i++){const element=new Audio();element.preload='none';element.crossOrigin='anonymous';element.loop=false;const node=c.createMediaElementSource(element),gain=c.createGain();gain.gain.value=0;node.connect(gain).connect(master);this.slots.push({element,node,gain,key:'',serial:0});}
  // Both persistent media elements are touched by the first gesture for mobile playback.
  const spare=this.slots[1];spare.key='__prime';spare.element.src='data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA';void spare.element.play().then(()=>{if(spare.key==='__prime')this.clear(spare);}).catch(()=>{if(spare.key==='__prime')this.clear(spare);});
  this.timer=setInterval(()=>this.tick(),120);
 }
 async play(){if(!this.activated||this.muted||this.volume<=0||document.hidden)return;try{this.ready();void this.ctx!.resume().catch(()=>{});this.output(musicGain(this.volume,Number(this.farm().studio?.rules?.musicCeiling??1)),.1);this.tick();}catch{this.error='Toque novamente para iniciar a música.';}}
 private clear(s:Slot){s.serial++;s.element.pause();s.gain.gain.cancelScheduledValues(0);s.gain.gain.value=0;s.element.removeAttribute('src');s.element.load();s.key='';s.playing=undefined;}
 private begin(track:Track,loop=false){const c=this.ctx!,slot=this.slots.find(s=>s!==this.current&&s!==this.retired);if(!slot)return;this.clear(slot);slot.key=track.key;const serial=slot.serial;this.pending=slot;slot.element.src=track.src;slot.element.preload='auto';const start=slot.element.play();slot.playing=start;
  void start.then(()=>{slot.playing=undefined;if(slot.serial!==serial||this.pending!==slot)return;if(this.muted||document.hidden||this.volume<=0||this.track().key!==track.key){this.pending=undefined;this.clear(slot);return;}
   const old=this.current,t=c.currentTime,fade=loop?LOOP_FADE:MUSIC_FADE;slot.gain.gain.setValueAtTime(0,t);slot.gain.gain.setValueCurveAtTime(musicFadeCurve(true),t,fade);if(old){const level=old.gain.gain.value;old.gain.gain.cancelScheduledValues(0);old.gain.gain.setValueCurveAtTime(musicFadeCurve(false,level),t,fade);this.retired=old;}
   this.current=slot;this.pending=undefined;this.until=t+fade;this.starts++;if(loop)this.loops++;this.error='';
  }).catch(()=>{if(slot.serial!==serial)return;slot.playing=undefined;if(this.pending===slot)this.pending=undefined;this.clear(slot);this.retryAt=performance.now()+5000;this.error='A trilha não carregou. Verifique a conexão e toque para tentar novamente.';});
 }
 tick(){const c=this.ctx;if(!c||document.hidden||this.muted||!this.volume)return;const track=this.track();this.desired=track.key;this.output(musicGain(this.volume,Number(this.farm().studio?.rules?.musicCeiling??1)));
  if(this.retired&&c.currentTime>=this.until){this.clear(this.retired);this.retired=undefined;}
  if(this.pending&&this.pending.key!==track.key){this.clear(this.pending);this.pending=undefined;}
  if(this.retired||this.pending||performance.now()<this.retryAt)return;
  if(!this.current||this.current.key!==track.key){this.begin(track);return;}
  const active=this.current;if(active.element.paused&&!active.playing){active.gain.gain.cancelScheduledValues(0);active.gain.gain.setTargetAtTime(1,c.currentTime,.15);active.playing=active.element.play();void active.playing.then(()=>{active.playing=undefined;}).catch(()=>{active.playing=undefined;this.retryAt=performance.now()+5000;});}
  if(!active.playing&&nearMusicEnd(active.element.currentTime,active.element.duration))this.begin(track,true);
 }
 private output(level:number,tau=.12){if(!this.ctx||!this.master||Math.abs(level-this.targetGain)<.0001)return;this.targetGain=level;this.master.gain.setTargetAtTime(level,this.ctx.currentTime,tau);}
 private silence(){if(!this.ctx)return;this.output(0,.035);setTimeout(()=>{if(!this.muted&&this.volume>0&&!document.hidden)return;if(this.pending){this.clear(this.pending);this.pending=undefined;}if(this.retired){this.clear(this.retired);this.retired=undefined;}for(const s of this.slots)s.element.pause();void this.ctx?.suspend();},180);}
 set(volume:number,muted:boolean){this.volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):0;this.muted=muted;this.refreshButton();try{localStorage.setItem('wj-music-v1',JSON.stringify({volume:this.volume,muted}));}catch{}if(muted||!this.volume)this.silence();else void this.play();}
 status(){const c=this.current,values=new Float32Array(256);this.analyser?.getFloatTimeDomainData(values);return{state:this.ctx?.state??'waiting',voices:this.slots.filter(s=>!s.element.paused).length,bar:0,volume:this.volume,muted:this.muted,contexts:this.ctx?1:0,track:c?.key??'',desired:this.desired,time:c?.element.currentTime??0,duration:c?.element.duration??0,starts:this.starts,loops:this.loops,pending:this.pending?.key??'',transition:!!this.retired,error:this.error,rms:Math.sqrt(values.reduce((n,v)=>n+v*v,0)/values.length),peak:values.reduce((n,v)=>Math.max(n,Math.abs(v)),0)};}
 toggle(){this.set(this.volume,!this.muted);}
 private refreshButton(){const b=document.getElementById('music-toggle');if(b){b.textContent=this.muted?'♫ ×':'♫';b.setAttribute('aria-pressed',String(!this.muted));b.title=this.muted?'Ligar música':'Desligar música';}}
 panel(open:(title:string,html:string)=>void){open('Som do vale',`<p>Trilhas por ambiente: fazenda e sul, casa, celeiro e venda do Vartin. Volume equilibrado entre as faixas, com transições suaves.</p><label>Volume da música <input id="music-volume" type="range" min="0" max="100" value="${Math.round(this.volume*100)}"/><output id="music-level">${Math.round(this.volume*100)}%</output></label><label><input id="music-muted" type="checkbox" ${this.muted?'checked':''}/> Silenciar música</label><label>Volume dos efeitos <input id="effects-volume" type="range" min="0" max="100" value="${Math.round(effectsAudio.volume*100)}"/></label><p>A música começa após um toque ou tecla. Música e efeitos têm controles separados, salvos neste aparelho.</p>`);const volume=document.getElementById('music-volume') as HTMLInputElement,mute=document.getElementById('music-muted') as HTMLInputElement;const update=()=>{this.set(Number(volume.value)/100,mute.checked);document.getElementById('music-level')!.textContent=volume.value+'%';};(document.getElementById('effects-volume') as HTMLInputElement).oninput=e=>effectsAudio.set(Number((e.target as HTMLInputElement).value)/100);volume.oninput=update;mute.onchange=update;}
}
