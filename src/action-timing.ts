import type { Tool } from './farm';

export type Direction = 'down' | 'left' | 'right' | 'up';
export const DIRECTION_ROW: Record<Direction, number> = { down: 0, left: 1, right: 2, up: 3 };
export const ACTIONS = {
 fertilizer:{duration:1100,impact:420},medicine:{duration:1100,impact:420},
  rod: {duration:800,impact:400},
  hoe: { duration: 840, impact: 390 },
  water: { duration: 1450, impact: 490 },
  seed: { duration: 540, impact: 240 },
  hand: { duration: 480, impact: 210 },
} as const;
export function actionFrame(tool: Tool, elapsed: number) {
  if (tool === 'water') return elapsed < 180 ? 0 : elapsed < 330 ? 1 : elapsed < 1150 ? 2 : 3;
  const progress = elapsed / ACTIONS[tool].duration;
  return progress < .15 ? 0 : progress < .46 ? 1 : progress < .76 ? 2 : 3;
}
export function isPouring(elapsed: number) { return elapsed >= 350 && elapsed < 1100; }
export type Point = { x: number; y: number };
/** Short ballistic arc: projected water jet, from sprinkler rose to the soil. */
export function waterPoint(start: Point, end: Point, progress: number, arc = 4): Point {
  const t = Math.max(0, Math.min(1, progress));
  return { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t * t - Math.sin(t * Math.PI) * arc };
}
/** At-most-once commit, even on repeated frames or a visibility/pagehide flush. */
export class ActionClock {
  committed = false;
  constructor(readonly tool: Tool, readonly started: number) {}
  elapsed(now: number) { return Math.max(0, now - this.started); }
  commitIfDue(now: number, commit: () => void, force = false) {
    if (this.committed || (!force && this.elapsed(now) < ACTIONS[this.tool].impact)) return false;
    this.committed = true;
    commit();
    return true;
  }
  finished(now: number) { return this.elapsed(now) >= ACTIONS[this.tool].duration; }
}
