import { act, buySeeds, CROPS, makeFarm, sellAll, type Crop, type Farm, type Tool } from './farm.js';
export const ECONOMY = { energyMax: 80, energyStepMs: 60000, harvestXp: 10, initialPlots: 12,
  expansions: [{ plots: 18, price: 200, level: 2 }, { plots: 24, price: 500, level: 3 }],
  toolEnergy: { hand: 1, hoe: 2, seed: 1, water: 1 } } as const;
export type OnlineFarm = Farm & { xp: number; energy: number; energyAt: number; unlockedPlots: number };
export type Command = { type: 'work'; plot: number; tool: Tool; crop: Crop } | { type: 'buy'; crop: Crop } | { type: 'sell' } | { type: 'expand' };
export const levelOf = (xp: number) => 1 + Math.floor(Math.sqrt(xp / 40));
export function newOnlineFarm(now: number): OnlineFarm { return { ...makeFarm(), xp: 0, energy: ECONOMY.energyMax, energyAt: now, unlockedPlots: ECONOMY.initialPlots }; }
export function replenish(farm: OnlineFarm, now: number) {
  const units = Math.floor(Math.max(0, now - farm.energyAt) / ECONOMY.energyStepMs);
  farm.energy = Math.min(ECONOMY.energyMax, farm.energy + units);
  farm.energyAt = farm.energy === ECONOMY.energyMax ? now : farm.energyAt + units * ECONOMY.energyStepMs;
}
export function applyCommand(farm: OnlineFarm, input: unknown, now: number): { ok: boolean; message: string; harvest?: boolean } {
  const c = input as Command;
  if (!c || typeof c !== 'object') return { ok: false, message: 'Ação inválida.' };
  replenish(farm, now);
  if (c.type === 'work') {
    if (!Number.isInteger(c.plot) || c.plot < 0 || c.plot >= farm.unlockedPlots || !['hand', 'hoe', 'seed', 'water'].includes(c.tool) || !Object.hasOwn(CROPS, c.crop)) return { ok: false, message: 'Canteiro bloqueado ou ferramenta inválida.' };
    const cost = ECONOMY.toolEnergy[c.tool];
    if (farm.energy < cost) return { ok: false, message: 'Descanse um pouco: recupera 1 energia por minuto.' };
    const result = act(farm, c.plot, c.tool, c.crop, now);
    if (result.ok) { farm.energy -= cost; if (result.harvest) farm.xp += ECONOMY.harvestXp; }
    return result;
  }
  if (c.type === 'buy') return Object.hasOwn(CROPS, c.crop) && buySeeds(farm, c.crop) ? { ok: true, message: '+5 sementes guardadas!' } : { ok: false, message: 'Saldo insuficiente ou cultura inválida.' };
  if (c.type === 'sell') { const total = sellAll(farm); return { ok: total > 0, message: total ? `Colheita vendida: +${total} moedas.` : 'Seu celeiro está vazio.' }; }
  if (c.type === 'expand') {
    const next = ECONOMY.expansions.find(e => e.plots > farm.unlockedPlots);
    if (!next) return { ok: false, message: 'Todos os canteiros já estão liberados.' };
    if (levelOf(farm.xp) < next.level || farm.coins < next.price) return { ok: false, message: `Requer nível ${next.level} e ${next.price} moedas.` };
    farm.coins -= next.price; farm.unlockedPlots = next.plots;
    return { ok: true, message: 'Mais 6 canteiros para sua fazenda!' };
  }
  return { ok: false, message: 'Ação desconhecida.' };
}
