/** A native key event can reach both scenes during a synchronous scene change. */
const consumed=new WeakSet<object>();
export function claimInteractionEvent(event:object){if(consumed.has(event))return false;consumed.add(event);return true;}
