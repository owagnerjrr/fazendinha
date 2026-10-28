import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, buySeeds, CROPS, makeFarm, remaining, restoreFarm, sellAll, type Crop } from '../src/farm';

test('complete agricultural cycle, quest reward and duplicate harvest prevention', () => {
  const f = makeFarm(), start = 1000;
  assert.equal(act(f, 0, 'seed', 'carrot', start).ok, false);
  assert.equal(act(f, 0, 'hoe', 'carrot', start).ok, true);
  assert.equal(act(f, 0, 'seed', 'carrot', start).ok, true);
  assert.equal(f.seeds.carrot, 7);
  assert.equal(act(f, 0, 'hand', 'carrot', start + 1e6).ok, false, 'unwatered crop never matures');
  assert.equal(act(f, 0, 'water', 'carrot', start).ok, true);
  assert.equal(act(f, 0, 'hand', 'carrot', start + 44_999).ok, false);
  assert.equal(act(f, 0, 'hand', 'carrot', start + 45_000).harvest, true);
  assert.equal(f.inventory.carrot, 3); assert.equal(f.coins, 325);
  assert.equal(act(f, 0, 'hand', 'carrot', start + 45_000).ok, false);
  assert.equal(f.inventory.carrot, 3);
  assert.equal(sellAll(f), 36); assert.equal(f.coins, 361);
  assert.equal(sellAll(f), 0); assert.equal(f.coins, 361);
});
test('quest is granted exactly once across multiple harvests', () => {
  const f = makeFarm();
  for (const id of [0, 1]) { act(f, id, 'hoe', 'carrot', 0); act(f, id, 'seed', 'carrot', 0); act(f, id, 'water', 'carrot', 0); act(f, id, 'hand', 'carrot', 45000); }
  assert.equal(f.coins, 325); assert.equal(f.harvests, 2); assert.equal(f.inventory.carrot, 6);
});
for (const c of Object.keys(CROPS) as Crop[]) test(`${c}: exact maturity boundary and correct yield`, () => {
  const f = makeFarm(); act(f, 2, 'hoe', c, 100); act(f, 2, 'seed', c, 100); act(f, 2, 'water', c, 100);
  assert.equal(act(f, 2, 'hand', c, CROPS[c].seconds * 1000 + 99).ok, false);
  assert.equal(act(f, 2, 'hand', c, CROPS[c].seconds * 1000 + 100).ok, true);
  assert.equal(f.inventory[c], 3);
});
test('occupied plots cannot be tilled or seeded again and watering does not reset timer', () => {
  const f = makeFarm(); act(f, 0, 'hoe', 'carrot', 0); act(f, 0, 'seed', 'carrot', 0); act(f, 0, 'water', 'carrot', 0);
  assert.equal(act(f, 0, 'hoe', 'tomato', 50).ok, false); assert.equal(act(f, 0, 'seed', 'tomato', 50).ok, false);
  assert.equal(act(f, 0, 'water', 'carrot', 500).ok, true); assert.equal(f.plots[0].wateredAt, 0); assert.equal(f.seeds.tomato, 8);
});
test('no seeds, invalid plots and dry watering are safe', () => {
  const f = makeFarm(); f.seeds.carrot = 0;
  act(f, 0, 'hoe', 'carrot'); assert.equal(act(f, 0, 'seed', 'carrot').ok, false);
  assert.equal(act(f, 100, 'hand', 'carrot').ok, false); assert.equal(act(f, 0, 'water', 'carrot').ok, true);
});
test('repeated hoe and watering never change crops, timers or rewards', () => {
  const f = makeFarm();
  act(f, 0, 'hoe', 'carrot', 10);
  const prepared = structuredClone(f);
  assert.equal(act(f, 0, 'hoe', 'carrot', 20).ok, true);
  assert.deepEqual(f, prepared);
  act(f, 0, 'seed', 'carrot', 30); act(f, 0, 'water', 'carrot', 40);
  const planted = structuredClone(f);
  assert.equal(act(f, 0, 'hoe', 'carrot', 50).ok, false);
  assert.equal(act(f, 0, 'water', 'carrot', 60).ok, true);
  assert.deepEqual(f, planted);
});
test('purchasing respects balance and rejects invalid quantities', () => {
  const f = makeFarm(); assert.equal(buySeeds(f, 'carrot'), true); assert.equal(f.coins, 210); assert.equal(f.seeds.carrot, 13);
  for (const amount of [-1, 0, .5, NaN, Infinity, 101]) assert.equal(buySeeds(f, 'carrot', amount), false);
  f.coins = 0; assert.equal(buySeeds(f, 'lettuce'), false); assert.equal(f.seeds.lettuce, 8); assert.equal(f.coins, 0);
});
test('save roundtrip preserves growth offline and does not mature before watering', () => {
  const f = makeFarm(); act(f, 0, 'hoe', 'tomato', 100); act(f, 0, 'seed', 'tomato', 100); act(f, 0, 'water', 'tomato', 100);
  const restored = restoreFarm(JSON.stringify(f)); assert.deepEqual(restored, f);
  assert.equal(remaining(restored.plots[0], 1e6), 0);
  assert.equal(remaining(restored.plots[1], 1e6), null);
  assert.equal(remaining(restored.plots[0], 0), CROPS.tomato.seconds * 1000, 'clock rollback does not accelerate growth');
});
test('malformed, incomplete and unsupported saves safely recover', () => {
  const fresh=(raw:string|null)=>{const before=Date.now(),f=restoreFarm(raw),after=Date.now();assert.ok(f.calendar!.startedAt>=before&&f.calendar!.startedAt<=after);assert.deepEqual(f,makeFarm(f.calendar!.startedAt));};
  for (const raw of [null, 'broken', '{}', 'null', '{"version":2}', '[]']) fresh(raw);
  for (const corrupt of [ (f: ReturnType<typeof makeFarm>) => { f.coins = -3; }, (f: ReturnType<typeof makeFarm>) => { f.plots[0].id = 9; }, (f: ReturnType<typeof makeFarm>) => { f.plots[0].crop = 'tomato'; }, (f: ReturnType<typeof makeFarm>) => { f.seeds.carrot = -1; } ]) { const f = makeFarm(); corrupt(f); fresh(JSON.stringify(f)); }
});
