/** Keep every browser animation frame. Only bound simulation catch-up after a stall. */
export function useNativeFrames(loop:{callback:(time:number,delta:number)=>void}){const step=loop.callback;loop.callback=(time,delta)=>step(time,Math.min(100,Math.max(0,delta)));}
