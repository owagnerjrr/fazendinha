import{alive}from'./animal-life-model';
import{animalNeeds}from'./animal-needs.js';import type{Animal}from'./content.js';import{vitalAt}from'./living-animals.js';
export function animalAlert(a:Animal,now:number){if(!alive(a))return'FALECEU';if((a.life?.criticalMs??0)>0)return'RISCO · TRATAR';const n=animalNeeds(a,now);if(n.sick)return 'DOENTE';const alerts=[...(n.food<=30?['FOME']:[]),...(n.water<=30?['SEDE']:[]),...(n.clean<=30?['LIMPEZA']:[]),...(vitalAt(a,now)?.resting?['DESCANSO']:[])];return alerts.length?alerts[Math.floor(now/3000)%alerts.length]:'';}
