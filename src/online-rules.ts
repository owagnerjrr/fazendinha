import {levelOf,progressionProblem} from './progression.js';
export {levelOf} from './progression.js';
import {applyVendorSale} from './vendor-sales.js';
import {plotUsable} from './plots.js';
import { applyLife, LIFE_COMMANDS } from './life-rules.js';
import { upgradeFarm } from './farm.js';
import { act, buySeeds, CROPS, makeFarm, type Crop, type Farm, type Tool } from './farm.js';
export const ECONOMY = { energyMax: 80, energyStepMs: 60000, harvestXp: 20, initialPlots: 24,
  expansions: [{ plots: 12, price: 100, level: 2 }, { plots: 18, price: 250, level: 3 }, { plots: 24, price: 500, level: 4 }],
  toolEnergy: { rod:0, hand: 0, hoe: 0, seed: 0, water: 0 } } as const;
export type OnlineFarm = Farm & { xp: number; energy: number; energyAt: number; unlockedPlots: number };
export type Command = { type: 'work'; plot: number; tool: Tool; crop: Crop } | { type: 'buy'; crop: Crop } | { type: 'sell' } | { type: 'expand' };
export function newOnlineFarm(now: number): OnlineFarm { return { ...makeFarm(now), progressionVersion:1, coins:50, seeds:{carrot:6,lettuce:0,tomato:0,strawberry:0,corn:0,tulip:0,sunflower:0},animals:[],feed:0,supplies:{medicine:0,plantMedicine:0,bedding:0},profileComplete:false, xp: 0, energy: ECONOMY.energyMax, energyAt: now, unlockedPlots: ECONOMY.initialPlots }; }
export function replenish(farm: OnlineFarm, now: number) {
  // Compatibility fields remain in old saves; no action requires or consumes energy.
  farm.energy=ECONOMY.energyMax;farm.energyAt=now;
}
export function applyCommand(farm: OnlineFarm, input: unknown, now: number): { ok: boolean; message: string; harvest?: boolean;caught?:import('./fishing.js').Fish } {
  const c = input as Command & Record<string,any>;
  if (!c || typeof c !== 'object') return { ok: false, message: 'Ação inválida.' };
  upgradeFarm(farm);replenish(farm, now);
  const blocked=progressionProblem(farm,c);if(blocked)return{ok:false,message:blocked};
  if((LIFE_COMMANDS as readonly string[]).includes(c.type)){const result=applyLife(farm,c,now);if(result.ok){if(result.caught)farm.xp+=5;if(String(c.type)==='collect-animal')farm.xp+=8;}return result;}
  if (c.type === 'work') {
    if (!Number.isInteger(c.plot) || c.plot < 0 || !plotUsable(farm,c.plot) || !['hand', 'hoe', 'seed', 'water'].includes(c.tool) || !Object.hasOwn(CROPS, c.crop)) return { ok: false, message: 'Canteiro bloqueado ou ferramenta inválida.' };
    const result = act(farm, c.plot, c.tool, c.crop, now);
    if (result.ok) { if (result.harvest) { const before=levelOf(farm.xp);farm.xp += ECONOMY.harvestXp;if(levelOf(farm.xp)>before)result.message+=` Nível ${levelOf(farm.xp)}! Novidades na venda.`; } }
    return result;
  }
  if (c.type === 'buy') return Object.hasOwn(CROPS, c.crop) && buySeeds(farm, c.crop) ? { ok: true, message: '+5 sementes guardadas!' } : { ok: false, message: 'Saldo insuficiente ou cultura inválida.' };
  if (c.type === 'sell') return applyVendorSale(farm,c);
  if (c.type === 'expand') {
    const next = ECONOMY.expansions.find(e => e.plots > farm.unlockedPlots);
    if (!next) return { ok: false, message: 'Todos os canteiros já estão liberados.' };
    if (levelOf(farm.xp) < next.level || farm.coins < next.price) return { ok: false, message: `Requer nível ${next.level} e ${next.price} moedas.` };
    farm.coins -= next.price; farm.unlockedPlots = next.plots;
    return { ok: true, message: 'Mais 6 canteiros para sua fazenda!' };
  }
  return { ok: false, message: 'Ação desconhecida.' };
}
