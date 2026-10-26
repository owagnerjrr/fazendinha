export const CROPS = {
  carrot: { name: 'Cenoura', icon: '🥕', seconds: 45, seedPrice: 8, sellPrice: 12, yield: 3 },
  lettuce: { name: 'Alface', icon: '🥬', seconds: 90, seedPrice: 12, sellPrice: 18, yield: 3 },
  tomato: { name: 'Tomate', icon: '🍅', seconds: 150, seedPrice: 18, sellPrice: 26, yield: 3 },
} as const;
export type Crop = keyof typeof CROPS;
export type Tool = 'hand' | 'hoe' | 'seed' | 'water';
export type Plot = { id: number; tilled: boolean; crop: Crop | null; wateredAt: number | null };
export type Farm = { version: 1; coins: number; seeds: Record<Crop, number>; inventory: Record<Crop, number>; plots: Plot[]; harvests: number; questClaimed: boolean; player: { x: number; y: number } };
const crops = Object.keys(CROPS) as Crop[];
export const SAVE_KEY = 'wj-fazendinha-v1';
export const makeFarm = (): Farm => ({ version: 1, coins: 250, seeds: { carrot: 8, lettuce: 8, tomato: 8 }, inventory: { carrot: 0, lettuce: 0, tomato: 0 }, plots: Array.from({ length: 24 }, (_, id) => ({ id, tilled: false, crop: null, wateredAt: null })), harvests: 0, questClaimed: false, player: { x: 710, y: 650 } });
export function remaining(plot: Plot, now = Date.now()) {
  if (!plot.crop || plot.wateredAt === null) return null;
  return Math.max(0, CROPS[plot.crop].seconds * 1000 - Math.max(0, now - plot.wateredAt));
}
export function act(farm: Farm, id: number, tool: Tool, crop: Crop, now = Date.now()): { ok: boolean; message: string; harvest?: boolean } {
  const plot = farm.plots.find(p => p.id === id);
  if (!plot) return { ok: false, message: 'Este canteiro não existe.' };
  if (tool === 'hoe') {
    if (plot.crop) return { ok: false, message: 'Já tem uma plantação aqui. Vamos cuidar dela!' };
    if (plot.tilled) return { ok: false, message: 'Terra preparada! Escolha Plantar.' };
    plot.tilled = true;
    return { ok: true, message: 'Terra fofinha. Hora de plantar uma semente!' };
  }
  if (tool === 'seed') {
    if (plot.crop) return { ok: false, message: 'Este canteiro já está ocupado.' };
    if (!plot.tilled) return { ok: false, message: 'Prepare a terra com a enxada primeiro.' };
    if (farm.seeds[crop] < 1) return { ok: false, message: 'Sementes acabaram. Visite a venda ao norte.' };
    farm.seeds[crop]--;
    plot.crop = crop;
    return { ok: true, message: `${CROPS[crop].name} plantada! Agora use o regador.` };
  }
  if (tool === 'water') {
    if (!plot.crop) return { ok: false, message: 'Plante uma semente antes de regar.' };
    if (plot.wateredAt !== null) return { ok: false, message: 'Já está regada. A natureza cuida do resto.' };
    plot.wateredAt = now;
    return { ok: true, message: `Regadinha! Pronta em ${CROPS[plot.crop].seconds} segundos.` };
  }
  if (!plot.crop) return { ok: false, message: plot.tilled ? 'Terra pronta. Escolha Plantar.' : 'Escolha a enxada para preparar este canteiro.' };
  if (plot.wateredAt === null) return { ok: false, message: 'Sua plantinha está com sede. Use o regador.' };
  const wait = remaining(plot, now)!;
  if (wait > 0) return { ok: false, message: `Quase lá: faltam ${Math.ceil(wait / 1000)} segundos.` };
  const harvested = plot.crop;
  farm.inventory[harvested] += CROPS[harvested].yield;
  farm.harvests++;
  plot.crop = null;
  plot.wateredAt = null;
  let reward = '';
  if (!farm.questClaimed) { farm.questClaimed = true; farm.coins += 75; reward = ' Missão cumprida: +75 moedas!'; }
  return { ok: true, harvest: true, message: `+${CROPS[harvested].yield} ${CROPS[harvested].name.toLowerCase()} no celeiro!${reward}` };
}
export function buySeeds(farm: Farm, crop: Crop, amount = 5) {
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 100) return false;
  const price = CROPS[crop].seedPrice * amount;
  if (farm.coins < price) return false;
  farm.coins -= price; farm.seeds[crop] += amount; return true;
}
export function sellAll(farm: Farm) {
  let total = 0;
  for (const crop of crops) { total += farm.inventory[crop] * CROPS[crop].sellPrice; farm.inventory[crop] = 0; }
  farm.coins += total; return total;
}
export function restoreFarm(raw: string | null): Farm {
  if (!raw) return makeFarm();
  try {
    const data = JSON.parse(raw) as Farm;
    const count = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n <= 1e9;
    if (data.version !== 1 || !count(data.coins) || !count(data.harvests) || typeof data.questClaimed !== 'boolean' || !data.player || !Number.isFinite(data.player.x) || !Number.isFinite(data.player.y)) return makeFarm();
    if (!crops.every(c => count(data.seeds?.[c]) && count(data.inventory?.[c]))) return makeFarm();
    if (!Array.isArray(data.plots) || data.plots.length !== 24 || !data.plots.every((p, id) => p.id === id && typeof p.tilled === 'boolean' && (p.crop === null || crops.includes(p.crop)) && (p.wateredAt === null || (Number.isFinite(p.wateredAt) && p.wateredAt >= 0)) && (p.crop !== null || p.wateredAt === null) && (!p.crop || p.tilled))) return makeFarm();
    data.player.x = Math.max(100, Math.min(1480, data.player.x)); data.player.y = Math.max(180, Math.min(1040, data.player.y));
    return data;
  } catch { return makeFarm(); }
}
