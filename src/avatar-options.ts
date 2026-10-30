// Keep saved numeric palette IDs stable while simplifying the visible choices.
export const SKIN_CHOICES=[{id:0,label:'Claro'},{id:2,label:'Moreno'},{id:3,label:'Castanho'},{id:4,label:'Negro'}];
export const HAIR_CHOICES=[{id:0,label:'Preto'},{id:1,label:'Castanho'},{id:3,label:'Dourado'},{id:4,label:'Violeta'}];
export function paletteOptions(choices:{id:number;label:string}[],selected:number){
 const legacy=choices.some(c=>c.id===selected)?'':`<option value="${selected}" selected hidden>${choices===SKIN_CHOICES?(selected===5?'Negro':'Moreno'):'Castanho'}</option>`;
 return legacy+choices.map(c=>`<option value="${c.id}" ${c.id===selected?'selected':''}>${c.label}</option>`).join('');
}
