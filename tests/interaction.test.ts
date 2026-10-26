import { test } from 'node:test';
import assert from 'node:assert/strict';
import { choosePlot } from '../src/interaction';
import { makeFarm } from '../src/farm';
const fields = [{ id: 0, x: 0, y: 0 }, { id: 1, x: 40, y: 0 }];
test('watering chooses the dry crop beside the player instead of a closer empty plot after reload', () => {
  const f = makeFarm(); f.plots[0] = { id: 0, tilled: true, crop: 'carrot', wateredAt: null };
  assert.equal(choosePlot(f, fields, { x: 42, y: 10 }, 'water', 'carrot', null), 0);
});
test('successive tools keep the clicked plot when useful and do not mutate the farm', () => {
  const f = makeFarm(); f.plots[0].tilled = true; const before = JSON.stringify(f);
  assert.equal(choosePlot(f, fields, { x: 42, y: 10 }, 'seed', 'carrot', 0), 0);
  assert.equal(JSON.stringify(f), before);
  assert.equal(choosePlot(f, fields, { x: 500, y: 500 }, 'hoe', 'carrot', null), null);
});
