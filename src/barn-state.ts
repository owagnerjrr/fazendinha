import type{Farm}from'./farm';import{guestWalking}from'./guest-animal-care';
export function barnSignature(f:Pick<Farm,'animals'>,now=Date.now()){return JSON.stringify(f.animals.map(a=>[a.id,a.kind,a.life?.deadAt,a.life?.riding,a.life?.pregnancy?.due,a.housing,a.walking,a.pen,a.petMode,guestWalking(a,now)?a.guestWalk!.code:null]));}
