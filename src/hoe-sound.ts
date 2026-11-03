/** Original short earth/wood/steel impact, generated once per variant. */
export function hoeImpactPCM(sampleRate:number,variant=0){
 const duration=.38,data=new Float32Array(Math.ceil(sampleRate*duration));let seed=(371+variant*101)>>>0,brown=0,phase=0,peak=0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
 for(let i=0;i<data.length;i++){const t=i/sampleRate,noise=random();brown=.76*brown+.24*noise;phase+=2*Math.PI*(68+105*Math.exp(-t/.025)+variant*3)/sampleRate;const attack=Math.min(1,t/.0025),tail=Math.min(1,(duration-t)/.012),earth=(brown*1.8+noise*.14)*Math.exp(-t/.105),thump=Math.sin(phase)*.30*Math.exp(-t/.055),steel=Math.sin(t*2*Math.PI*(710+variant*29))*.055*Math.exp(-t/.028),scrape=noise*.12*Math.exp(-Math.pow((t-.09)/.05,2));const v=(earth+thump+steel+scrape)*attack*tail;data[i]=v;peak=Math.max(peak,Math.abs(v));}
 const gain=.8/Math.max(.001,peak);for(let i=0;i<data.length;i++)data[i]*=gain;return data;
}
