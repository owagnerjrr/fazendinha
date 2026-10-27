import type { Farm } from './farm.js';
export function requiresNewClient(farm:Farm,version:string|null|undefined):boolean {
 return version!=='2' && farm.animals.some(a=>a.kind==='rooster'||a.kind==='chick');
}
export const CLIENT_UPDATE_MESSAGE='Sua fazenda foi atualizada. Feche todas as abas ou o aplicativo e abra a versão mais recente.';
