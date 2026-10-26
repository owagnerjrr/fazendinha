import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ActionClock, ACTIONS, actionFrame, isPouring, waterPoint } from '../src/action-timing';
import { act, makeFarm } from '../src/farm';

test('digging changes soil exactly once at impact, not at selection or recovery', () => {
  const farm = makeFarm(), clock = new ActionClock('hoe', 1000);
  let commits = 0;
  const commit = () => { commits++; act(farm, 0, 'hoe', 'carrot'); };
  clock.commitIfDue(1389, commit); assert.equal(farm.plots[0].tilled, false);
  clock.commitIfDue(1390, commit); assert.equal(farm.plots[0].tilled, true);
  for (const time of [1391, 1500, 1840]) clock.commitIfDue(time, commit);
  clock.commitIfDue(2000, commit, true); assert.equal(commits, 1);
});
test('watering is committed during the pour and forced completion cannot repeat it', () => {
  const farm = makeFarm(); act(farm, 0, 'hoe', 'carrot'); act(farm, 0, 'seed', 'carrot');
  const clock = new ActionClock('water', 500);
  const commit = () => act(farm, 0, 'water', 'carrot', 990);
  clock.commitIfDue(989, commit); assert.equal(farm.plots[0].wateredAt, null);
  clock.commitIfDue(990, commit); assert.equal(farm.plots[0].wateredAt, 990);
  clock.commitIfDue(1200, () => { throw Error('duplicate'); }, true);
  assert.ok(isPouring(ACTIONS.water.impact));
});
test('leaving the page before impact completes an authorized seed action once', () => {
  const farm = makeFarm(); act(farm, 0, 'hoe', 'carrot'); const clock = new ActionClock('seed', 0);
  const commit = () => act(farm, 0, 'seed', 'carrot');
  clock.commitIfDue(100, commit, true); clock.commitIfDue(1000, commit); clock.commitIfDue(1000, commit, true);
  assert.equal(farm.seeds.carrot, 7); assert.equal(farm.plots[0].crop, 'carrot');
});
test('watering poses hold the tilted can for the whole water emission window', () => {
  for (let t = 350; t < 1100; t += 25) { assert.ok(isPouring(t)); assert.equal(actionFrame('water', t), 2); }
  assert.equal(isPouring(349), false); assert.equal(isPouring(1100), false);
  assert.equal(actionFrame('water', 1200), 3);
});
test('water trajectories originate at the nozzle, end on the plot and stay finite', () => {
  const start = { x: 100, y: 120 }, end = { x: 70, y: 135 };
  assert.deepEqual(waterPoint(start, end, 0), start);
  const last = waterPoint(start, end, 1); assert.ok(Math.abs(last.x - end.x) < 1e-9 && Math.abs(last.y - end.y) < 1e-9);
  for (let i = 0; i <= 100; i++) { const p = waterPoint(start, end, i / 100); assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y)); assert.ok(p.x >= 70 && p.x <= 100); }
  assert.deepEqual(waterPoint(start, end, -2), start);
});
