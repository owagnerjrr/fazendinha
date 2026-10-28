export type SkyBird={born:number;x:number;y:number;speed:number;direction:1|-1;phase:number};
export type WindLeaf={born:number;x:number;y:number;speed:number};
export type WeatherState={birds:SkyBird[];leaves:WindLeaf[];nextBird:number;nextGust:number;gustAt:number;sequence:number};
export const newWeather=():WeatherState=>({birds:[],leaves:[],nextBird:5000,nextGust:9000,gustAt:-10000,sequence:0});
export function advanceWeather(s:WeatherState,time:number,mobile:boolean,reduced:boolean){
 if(reduced){s.birds=[];s.leaves=[];s.nextBird=time+6000;s.nextGust=time+10000;s.gustAt=-10000;return;}
 const birdLimit=mobile?2:4,leafLimit=mobile?5:12;
 s.birds=s.birds.filter(b=>time-b.born<17000).slice(0,birdLimit);s.leaves=s.leaves.filter(l=>time-l.born<4200).slice(0,leafLimit);
 if(time>=s.nextBird){const seq=++s.sequence,dir:1|-1=seq%2?1:-1,count=Math.min(birdLimit-s.birds.length,mobile?1:2);for(let i=0;i<count;i++)s.birds.push({born:time+i*430,x:dir===1?45:1540,y:230+(seq*137+i*43)%650,speed:.11+(seq%3)*.014,direction:dir,phase:seq+i});s.nextBird=time+10000+(seq%4)*1200;}
 if(time>=s.nextGust){s.gustAt=time;s.nextGust=time+17000+(s.sequence%4)*1100;const count=leafLimit-s.leaves.length;for(let i=0;i<count;i++)s.leaves.push({born:time+i*65,x:240+(i*97+s.sequence*31)%900,y:260+(i*53+s.sequence*29)%700,speed:.025+(i%3)*.009});}
}
export function windAmount(s:WeatherState,time:number,reduced:boolean){return reduced?0:.35+Math.max(0,1-(time-s.gustAt)/4500)*.9;}
export function birdPosition(b:SkyBird,time:number){const elapsed=Math.max(0,time-b.born);return{x:b.x+elapsed*b.speed*b.direction,y:b.y+Math.sin(elapsed/1100+b.phase)*19,wing:Math.sin(elapsed/115+b.phase)*5};}
