/** Act on contact: mobile gestures need not produce a compatibility click. */
export function bindPressAction(target:EventTarget,action:()=>void){
 let pointerClick=false;
 target.addEventListener('pointerdown',event=>{const e=event as PointerEvent;if(e.button!==0)return;e.preventDefault();e.stopPropagation();pointerClick=true;action();});
 target.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const e=event as MouseEvent;if(pointerClick&&e.detail!==0){pointerClick=false;return;}pointerClick=false;action();});
}
