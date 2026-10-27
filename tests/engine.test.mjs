import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../catalog.js';
import {
  STORAGE_KEY, CORRUPT_BACKUP_KEY, HISTORY_LIMIT, createInitialState, drawItems, getAchievements,
  getStats, loadState, saveState, exportState, importState, unlockSecret,
} from '../engine.js';

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test('catalog has 60+ unique original items and all five rarity pools', () => {
  assert.ok(ITEMS.length >= 60);
  assert.equal(new Set(ITEMS.map(item => item.id)).size, ITEMS.length);
  assert.equal(new Set(ITEMS.map(item => item.name)).size, ITEMS.length);
  for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
    assert.ok(ITEMS.some(item => item.rarity === rarity && !item.secret), `Missing ${rarity} normal pool`);
  }
});

test('a draw is immutable, adds inventory/history and awards first achievement', () => {
  const initial = createInitialState(1000);
  const snapshot = JSON.stringify(initial);
  const { state, results, newAchievements } = drawItems(initial, 1, { rng: () => 0, now: 2000 });
  assert.equal(JSON.stringify(initial), snapshot);
  assert.equal(results.length, 1);
  assert.equal(state.totalPulls, 1);
  assert.equal(state.pity, 1);
  assert.equal(results[0].isNew, true);
  assert.equal(state.inventory[results[0].id].count, 1);
  assert.equal(state.history[0].id, results[0].id);
  assert.ok(newAchievements.some(item => item.id === 'first'));
});

test('duplicates retain first discovery, update count, and award duplicate achievement', () => {
  let { state } = drawItems(createInitialState(1000), 1, { rng: () => 0, now: 2000 });
  const second = drawItems(state, 1, { rng: () => 0, now: 3000 });
  state = second.state;
  const id = second.results[0].id;
  assert.equal(second.results[0].isNew, false);
  assert.deepEqual(state.inventory[id], { count: 2, firstAt: 2000, lastAt: 3000 });
  assert.ok(second.newAchievements.some(item => item.id === 'duplicate'));
});

test('base rarity probability boundaries select each configured rarity', () => {
  for (const [roll, rarity] of [[0, 'common'], [0.49999, 'common'], [0.5, 'uncommon'], [0.78, 'rare'], [0.93, 'epic'], [0.99, 'legendary']]) {
    let calls = 0;
    const result = drawItems(createInitialState(1000), 1, { rng: () => calls++ === 0 ? roll : 0, now: 2000 });
    assert.equal(result.results[0].rarity, rarity, `roll ${roll}`);
  }
});

test('the 60th pull guarantees legendary and resets pity', () => {
  let state = createInitialState(1000);
  for (let i = 0; i < 59; i += 1) state = drawItems(state, 1, { rng: () => 0, now: 2000 + i }).state;
  assert.equal(state.pity, 59);
  const result = drawItems(state, 1, { rng: () => 0, now: 3000 });
  assert.equal(result.results[0].rarity, 'legendary');
  assert.equal(result.results[0].guaranteed, 'pity');
  assert.equal(result.state.pity, 0);
  assert.equal(result.state.totalPulls, 60);
});

test('ten pulls guarantee rare or above without replacing first nine results', () => {
  const result = drawItems(createInitialState(1000), 10, { rng: () => 0, now: 2000 });
  assert.equal(result.results.length, 10);
  assert.ok(result.results.slice(0, 9).every(item => item.rarity === 'common'));
  assert.equal(result.results[9].rarity, 'rare');
  assert.equal(result.results[9].guaranteed, 'ten');
  assert.equal(result.state.tenDraws, 1);
  assert.ok(result.newAchievements.some(item => item.id === 'ten-draw'));
  assert.equal(result.state.history[0].pull, 10);
});

test('history is bounded while inventory and total pulls retain all progress', () => {
  let state = createInitialState(1000);
  for (let i = 0; i < 25; i += 1) state = drawItems(state, 10, { rng: () => 0, now: 2000 + i * 10 }).state;
  assert.equal(state.totalPulls, 250);
  assert.equal(state.history.length, HISTORY_LIMIT);
  assert.equal(Object.values(state.inventory).reduce((total, item) => total + item.count, 0), 250);
});

test('secret rewards cannot come from normal draws and are granted only once', () => {
  const secret = ITEMS.find(item => item.secret);
  assert.ok(secret, 'At least one secret reward is required');
  const initial = createInitialState(1000);
  const first = unlockSecret(initial, secret.id, { now: 2000 });
  assert.equal(first.isNew, true);
  assert.equal(first.state.totalPulls, 0);
  assert.equal(first.state.inventory[secret.id].count, 1);
  assert.equal(first.state.pity, 0);
  assert.equal(initial.secrets.length, 0);
  const repeated = unlockSecret(first.state, secret.id, { now: 3000 });
  assert.equal(repeated.isNew, false);
  assert.equal(repeated.state.inventory[secret.id].count, 1);
  for (let i = 0; i < 100; i += 1) {
    const draw = drawItems(initial, 1, { rng: () => i / 100, now: 2000 });
    assert.ok(!draw.results[0].item.secret);
  }
});

test('save/export/import preserve progress and settings', () => {
  const storage = memoryStorage();
  const { state } = drawItems(createInitialState(1000), 10, { rng: () => 0, now: 2000 });
  state.settings.sound = true;
  assert.deepEqual(saveState(state, storage), { ok: true });
  assert.deepEqual(loadState(storage).state, state);
  assert.deepEqual(importState(exportState(state)), state);
  assert.deepEqual(importState(JSON.stringify(state)), state);
});

test('blocked storage, corrupt JSON and invalid imports fail safely', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, '{oops');
  const result = loadState(storage);
  assert.equal(result.state.totalPulls, 0);
  assert.ok(result.warning);
  assert.equal(storage.getItem(STORAGE_KEY), '{oops');
  assert.equal(storage.getItem(CORRUPT_BACKUP_KEY), '{oops');
  assert.equal(saveState(result.state, { setItem() { throw new Error('quota'); } }).ok, false);
  assert.equal(loadState({ getItem() { throw new Error('blocked'); } }).state.totalPulls, 0);
  for (const raw of ['null', '{}', '[]', 'bad', JSON.stringify({ ...createInitialState(), totalPulls: -1 }), JSON.stringify({ ...createInitialState(), pity: 60 })]) {
    assert.throws(() => importState(raw));
  }
});

test('a corrupt original remains recoverable after a new game is saved', () => {
  const storage = memoryStorage();
  const corrupt = '{"version":1,"totalPulls":"broken"}';
  storage.setItem(STORAGE_KEY, corrupt);
  const loaded = loadState(storage);
  assert.equal(loaded.corruptBackupKey, CORRUPT_BACKUP_KEY);
  const { state } = drawItems(loaded.state, 1, { rng: () => 0, now: 2000 });
  assert.equal(saveState(state, storage).ok, true);
  assert.equal(storage.getItem(CORRUPT_BACKUP_KEY), corrupt);
  assert.equal(loadState(storage).state.totalPulls, 1);
});

test('failed corrupt-save backup prevents overwriting the original', () => {
  let main = '{broken';
  const storage = {
    getItem: key => key === STORAGE_KEY ? main : null,
    setItem(key, value) {
      if (key === CORRUPT_BACKUP_KEY) throw new Error('quota');
      if (key === STORAGE_KEY) main = value;
    },
  };
  const loaded = loadState(storage);
  assert.match(loaded.warning, /暂停/);
  const result = saveState(createInitialState(1000), storage);
  assert.equal(result.ok, false);
  assert.match(result.error, /保护原始数据/);
  assert.equal(main, '{broken');
});

test('imports reject mismatched collection, pity, batch and secret data', () => {
  const fresh = createInitialState(1000);
  const drawn = drawItems(fresh, 1, { rng: () => 0, now: 2000 }).state;
  const secret = ITEMS.find(item => item.secret);
  const badStates = [
    { ...drawn, totalPulls: 2 },
    { ...drawn, pity: 2 },
    { ...drawn, tenDraws: 1 },
    { ...fresh, secrets: [secret.id] },
    { ...fresh, inventory: { [secret.id]: { count: 2, firstAt: 1000, lastAt: 1000 } }, secrets: [secret.id] },
    { ...drawn, history: [drawn.history[0], drawn.history[0]] },
  ];
  for (const state of badStates) assert.throws(() => importState(JSON.stringify(state)));
});

test('imports accept bounded/empty history, clock changes, and legacy missing optional fields', () => {
  const { state } = drawItems(createInitialState(1000), 10, { rng: () => 0, now: 2000 });
  state.history = state.history.slice(0, 3);
  state.history[0].at = 500;
  delete state.tenDraws;
  delete state.settings.reduceMotion;
  const imported = importState(JSON.stringify(state));
  assert.equal(imported.totalPulls, 10);
  assert.equal(imported.history.length, 3);
  assert.equal(imported.history[0].at, 500);
  assert.equal(imported.tenDraws, 0);
  assert.equal(imported.settings.reduceMotion, false);
  imported.history = [];
  assert.equal(importState(exportState(imported)).history.length, 0);
});

test('secret rewards do not trigger normal-pool rarity achievements', () => {
  let state = createInitialState(1000);
  for (const item of ITEMS.filter(entry => entry.secret)) {
    const result = unlockSecret(state, item.id, { now: 2000 });
    state = result.state;
    assert.ok(!result.newAchievements.some(entry => entry.id === 'epic' || entry.id === 'legendary'));
  }
  assert.equal(getStats(state).byRarity.epic, 0);
  assert.equal(getStats(state).byRarity.legendary, 0);
  assert.equal(getStats(state).normalOwned, 0);
  assert.equal(getStats(state).unique, ITEMS.filter(item => item.secret).length);
  state.achievements.legendary = 1000;
  const imported = importState(exportState(state));
  assert.equal(getAchievements(imported).find(item => item.id === 'legendary').unlocked, false);
});

test('legacy secret inventory repairs its missing claim flag without duplicating rewards', () => {
  const secret = ITEMS.find(item => item.secret);
  const { state } = unlockSecret(createInitialState(1000), secret.id, { now: 2000 });
  state.secrets = [];
  const imported = importState(exportState(state));
  assert.ok(imported.secrets.includes(secret.id));
  assert.equal(unlockSecret(imported, secret.id).isNew, false);
});

test('invalid counts and invalid RNG do not change input state', () => {
  const state = createInitialState(1000);
  for (const count of [-1, 0, 2, 100]) assert.throws(() => drawItems(state, count));
  for (const value of [-0.1, 1, NaN, Infinity, '0']) assert.throws(() => drawItems(state, 1, { rng: () => value }));
  assert.equal(state.totalPulls, 0);
});

test('all achievement progress values and collection totals are coherent', () => {
  const state = createInitialState(1000);
  assert.equal(getAchievements(state).length, 12);
  assert.ok(getAchievements(state).every(item => !item.unlocked && item.current === 0 && item.goal > 0));
  assert.equal(getStats(state).total, ITEMS.length);
  assert.equal(getStats(state).normalTotal, ITEMS.filter(item => !item.secret).length);
  assert.equal(getStats(state).untilLegendary, 60);
});
