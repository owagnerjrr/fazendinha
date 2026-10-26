import { remaining, type Crop, type Farm, type Tool } from './farm';
type Target = { id: number; x: number; y: number };
export function choosePlot(farm: Farm, fields: Target[], player: { x: number; y: number }, tool: Tool, crop: Crop, focused: number | null, now = Date.now()): number | null {
  const distance = (field: Target) => Math.hypot(player.x - field.x, player.y - field.y);
  const nearby = fields.filter(f => distance(f) < 65).sort((a, b) => distance(a) - distance(b));
  const useful = (f: Target) => {
    const plot = farm.plots[f.id];
    if (!plot) return false;
    if (tool === 'hoe') return !plot.tilled && !plot.crop;
    if (tool === 'seed') return plot.tilled && !plot.crop && farm.seeds[crop] > 0;
    if (tool === 'water') return !!plot.crop && plot.wateredAt === null;
    return !!plot.crop && remaining(plot, now) === 0;
  };
  const last = nearby.find(f => f.id === focused && distance(f) < 60);
  return (last && useful(last) ? last : nearby.find(useful) ?? last ?? nearby[0])?.id ?? null;
}
