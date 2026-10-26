import Phaser from 'phaser';
import { waterPoint, type Point } from './action-timing';

type Drop = { start: Point; end: Point; born: number; duration: number; arc: number; color: number };
type Splash = { x: number; y: number; born: number };
export class WorkEffects {
  private graphics: Phaser.GameObjects.Graphics;
  private drops: Drop[] = [];
  private splashes: Splash[] = [];
  private nextDrop = 0;
  constructor(private scene: Phaser.Scene) { this.graphics = scene.add.graphics().setDepth(1800); }
  pour(start: Point, target: Point, now: number) {
    if (now < this.nextDrop) return;
    this.nextDrop = now + 28;
    for (let i = 0; i < 3; i++) this.drops.push({ start: { x: start.x + (i - 1) * 1.2, y: start.y }, end: { x: target.x + Phaser.Math.Between(-12, 12), y: target.y + Phaser.Math.Between(-7, 7) }, born: now, duration: 165 + i * 25, arc: 3 + i, color: i === 1 ? 0xe5fbff : 0x89cddd });
  }
  update(now: number) {
    this.graphics.clear();
    const keep: Drop[] = [];
    for (const drop of this.drops) {
      const t = (now - drop.born) / drop.duration;
      if (t >= 1) { this.splashes.push({ ...drop.end, born: now }); continue; }
      const p = waterPoint(drop.start, drop.end, t, drop.arc);
      const before = waterPoint(drop.start, drop.end, Math.max(0, t - .15), drop.arc);
      this.graphics.lineStyle(t < .25 ? 1.7 : 1.2, drop.color, .95).lineBetween(before.x, before.y, p.x, p.y);
      this.graphics.fillStyle(0xf3ffff, .8).fillRect(Math.round(p.x), Math.round(p.y), 1, 2);
      keep.push(drop);
    }
    this.drops = keep;
    this.splashes = this.splashes.filter(s => now - s.born < 170);
    for (const splash of this.splashes) {
      const t = (now - splash.born) / 170, spread = 2 + t * 5;
      this.graphics.lineStyle(1, 0xc4e8e9, (1 - t) * .75).strokeEllipse(splash.x, splash.y, 3 + t * 7, 1 + t * 3);
      this.graphics.fillStyle(0xe0f6ed, 1 - t).fillRect(splash.x - spread, splash.y - Math.sin(t * Math.PI) * 4, 1, 2).fillRect(splash.x + spread, splash.y - Math.sin(t * Math.PI) * 3, 1, 1);
    }
  }
  wetSoil(target: Point) {
    const sheen = this.scene.add.ellipse(target.x, target.y + 3, 34, 16, 0x8dbab2, .28).setDepth(target.y + 3).setScale(.3);
    this.scene.tweens.add({ targets: sheen, scaleX: 1.15, scaleY: .85, alpha: 0, duration: 700, ease: 'Sine.easeOut', onComplete: () => sheen.destroy() });
  }
  dirt(target: Point) {
    for (let i = 0; i < 14; i++) {
      const color = [0xa07a49, 0x6b4831, 0xd1aa65][i % 3];
      const chunk = this.scene.add.rectangle(target.x, target.y, i % 3 ? 3 : 4, 2, color).setDepth(1750);
      const vx = Phaser.Math.Between(-25, 25), vy = Phaser.Math.Between(-45, -24);
      this.scene.tweens.addCounter({ from: 0, to: 1, duration: 500 + i * 8, onUpdate: tween => { const t = tween.getValue() ?? 0; chunk.setPosition(target.x + vx * t, target.y + vy * t + 44 * t * t).setAlpha(1 - t).setAngle(t * vx * 4); }, onComplete: () => chunk.destroy() });
    }
  }
  harvest(target: Point) {
    for (let i = 0; i < 8; i++) { const spark = this.scene.add.rectangle(target.x + Phaser.Math.Between(-9, 9), target.y, 2, 3, 0xf3d581).setDepth(1750); this.scene.tweens.add({ targets: spark, y: target.y - 30, alpha: 0, duration: 550, delay: i * 15, onComplete: () => spark.destroy() }); }
  }
}
