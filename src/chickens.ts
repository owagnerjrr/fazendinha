import Phaser from 'phaser';

type Hen = { sprite: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Ellipse; x: number; y: number; tx: number; ty: number; until: number; phase: 'walk' | 'peck' | 'idle'; right: boolean; offset: number };

export class ChickenFlock {
  private hens: Hen[] = [];
  private random = new Phaser.Math.RandomDataGenerator(['wj-chickens-v3']);
  constructor(private scene: Phaser.Scene) {
    for (let i = 0; i < 4; i++) {
      const x = 388 + i * 28, y = 804 + i % 2 * 43;
      const shadow = scene.add.ellipse(x, y - 1, 28, 10, 0x263729, .28).setDepth(3);
      const sprite = scene.add.sprite(x, y, 'chickens-v3', 0).setOrigin(.5, 38 / 40).setScale(1.05).setDepth(y);
      scene.physics.add.existing(sprite);const body=sprite.body as Phaser.Physics.Arcade.Body;body.setSize(24,10).setOffset(8,28).setImmovable(true);
      this.hens.push({ sprite, shadow, x, y, tx: x, ty: y, until: i * 390 + 500, phase: i % 2 ? 'peck' : 'idle', right: i % 2 === 0, offset: i * 180 });
    }
  }
  sprites(){return this.hens.map(h=>h.sprite);}
  update(time: number, delta: number) {
    const dt = Math.min(delta, 80) / 1000;
    for (const hen of this.hens) {
      if (time > hen.until) {
        if (hen.phase === 'walk') { hen.phase = 'peck'; hen.until = time + this.random.between(1300, 2600); }
        else { hen.phase = 'walk'; hen.tx = this.random.between(374, 478); hen.ty = this.random.between(804, 872); hen.right = hen.tx >= hen.x; hen.until = time + this.random.between(1500, 3500); }
      }
      if (hen.phase === 'walk') {
        const dx = hen.tx - hen.x, dy = hen.ty - hen.y, distance = Math.hypot(dx, dy);
        if (distance > 2) { hen.x += dx / distance * dt * 17; hen.y += dy / distance * dt * 17; }
        else { hen.phase = 'idle'; hen.until = time + 600; }
      }
      // Small separation keeps the four silhouettes readable as they wander.
      for (const other of this.hens) {
        if (other === hen) continue;
        const dx = hen.x - other.x, dy = hen.y - other.y, distance = Math.hypot(dx, dy);
        if (distance > .1 && distance < 25) { const push = (25 - distance) * dt * 2; hen.x += dx / distance * push; hen.y += dy / distance * push; }
      }
      hen.x = Phaser.Math.Clamp(hen.x, 374, 478); hen.y = Phaser.Math.Clamp(hen.y, 802, 873);
      const walkFrame = Math.floor((time + hen.offset) / 160) % 4;
      const peckFrame = Math.floor((time + hen.offset) / 230) % 4;
      const row = hen.phase === 'peck' ? hen.right ? 2 : 3 : hen.right ? 0 : 1;
      hen.sprite.setFrame(row * 4 + (hen.phase === 'walk' ? walkFrame : hen.phase === 'peck' ? peckFrame : 0));
      hen.sprite.setPosition(hen.x, hen.y).setDepth(hen.y);
      hen.shadow.setPosition(hen.x + 1, hen.y - 1);
    }
  }
}
