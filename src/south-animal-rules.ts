import type{Animal}from'./content.js';import{autonomous}from'./animal-autonomy.js';import{isPet,petMode}from'./pet-rules.js';import{summoned}from'./pet-call-rules.js';
export function southOwnAnimal(a:Animal,ownMode:boolean){return ownMode&&(autonomous(a)||isPet(a)&&petMode(a)==='farm')||a.walking===true||isPet(a)&&(petMode(a)==='follow'||summoned(a));}
