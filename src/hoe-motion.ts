export const HOE_PHASES=[0,55,110,170,230,280,330,390,455,540,650,760] as const;
export const HOE_FRAMES=HOE_PHASES.length;
export function hoeFrame(elapsed:number){let frame=0;while(frame+1<HOE_FRAMES&&elapsed>=HOE_PHASES[frame+1])frame++;return frame;}
