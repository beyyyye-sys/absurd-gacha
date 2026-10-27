import { ITEMS } from './catalog.js';

export const STORAGE_KEY = 'absurd-gacha-save-v1';
export const CORRUPT_BACKUP_KEY = `${STORAGE_KEY}-corrupt-backup`;
export const ODDS = Object.freeze({ common: 0.5, uncommon: 0.28, rare: 0.15, epic: 0.06, legendary: 0.01 });
export const PITY_LIMIT = 60;
export const HISTORY_LIMIT = 200;
const LEVELS = Object.keys(ODDS);
const ITEM_BY_ID = new Map(ITEMS.map(item => [item.id, item]));
const NORMAL_ITEMS = ITEMS.filter(item => !item.secret);
const POOLS = Object.fromEntries(LEVELS.map(rarity => [rarity, NORMAL_ITEMS.filter(item => item.rarity === rarity)]));
const MAX_COUNT = 1000000000;

export function createInitialState(now = Date.now()) {
  return {
    version: 1,
    totalPulls: 0,
    inventory: {},
    history: [],
    pity: 0,
    settings: { sound: false, reduceMotion: false },
    secrets: [],
    achievements: {},
    tenDraws: 0,
    createdAt: Number.isFinite(now) ? now : Date.now(),
  };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function integer(value, min = 0, max = MAX_COUNT) {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}

function timestamp(value) {
  return Number.isFinite(value) && value >= 0 && value <= 8640000000000000;
}

function validateState(raw) {
  if (!isRecord(raw) || raw.version !== 1) throw new Error('存档版本不受支持。');
  if (!integer(raw.totalPulls) || !integer(raw.pity, 0, PITY_LIMIT - 1) || !timestamp(raw.createdAt)) {
    throw new Error('存档里的抽奖计数或时间无效。');
  }
  if (!isRecord(raw.inventory) || !Array.isArray(raw.history) || !isRecord(raw.settings) || !Array.isArray(raw.secrets)) {
    throw new Error('存档缺少必要的数据。');
  }
  const state = createInitialState(raw.createdAt);
  state.totalPulls = raw.totalPulls;
  state.pity = raw.pity;
  state.settings.sound = raw.settings.sound === true;
  state.settings.reduceMotion = raw.settings.reduceMotion === true;
  state.tenDraws = raw.tenDraws === undefined ? 0 : raw.tenDraws;
  if (!integer(state.tenDraws, 0, Math.floor(state.totalPulls / 10)) || state.pity > state.totalPulls) {
    throw new Error('存档中的保底或十连计数与抽奖次数不一致。');
  }
  let normalCount = 0;
  for (const [id, entry] of Object.entries(raw.inventory)) {
    const item = ITEM_BY_ID.get(id);
    if (!item) throw new Error('存档含有当前版本无法识别的藏品。');
    if (!isRecord(entry) || !integer(entry.count, 1) || !timestamp(entry.firstAt) || !timestamp(entry.lastAt) || entry.lastAt < entry.firstAt) {
      throw new Error('存档中的藏品数据损坏。');
    }
    if (item.secret && entry.count !== 1) throw new Error('每件彩蛋藏品只能领取一次。');
    if (!item.secret) normalCount += entry.count;
    state.inventory[id] = { count: entry.count, firstAt: entry.firstAt, lastAt: entry.lastAt };
  }
  if (normalCount !== state.totalPulls) throw new Error('存档中的藏品数量与抽奖次数不一致。');
  const history = raw.history.slice(0, HISTORY_LIMIT);
  const normalPulls = new Set();
  for (const entry of history) {
    if (!isRecord(entry) || !ITEM_BY_ID.has(entry.id)) continue;
    const item = ITEM_BY_ID.get(entry.id);
    if (!timestamp(entry.at) || !integer(entry.pull, item.secret ? 0 : 1) || entry.pull > state.totalPulls || typeof entry.isNew !== 'boolean' || !state.inventory[entry.id]) {
      throw new Error('存档中的抽奖历史损坏。');
    }
    if (!item.secret) {
      if (normalPulls.has(entry.pull)) throw new Error('存档中的抽奖历史含有重复的抽奖编号。');
      normalPulls.add(entry.pull);
    }
    state.history.push({ id: entry.id, rarity: item.rarity, at: entry.at, isNew: entry.isNew, pull: entry.pull });
  }
  state.secrets = [...new Set(raw.secrets.filter(id => typeof id === 'string' && id.length < 100))].slice(0, 100);
  // Recover older saves whose reward was saved before its easter-egg flag.
  for (const id of Object.keys(state.inventory)) {
    if (ITEM_BY_ID.get(id).secret && !state.secrets.includes(id)) state.secrets.push(id);
  }
  for (const id of state.secrets) {
    if (ITEM_BY_ID.get(id)?.secret && !state.inventory[id]) throw new Error('存档中的彩蛋领取记录缺少对应藏品。');
  }
  if (isRecord(raw.achievements)) {
    for (const [id, at] of Object.entries(raw.achievements)) {
      const achievement = ACHIEVEMENTS.find(entry => entry.id === id);
      if (achievement && timestamp(at) && achievement.progress(state) >= achievement.goal) state.achievements[id] = at;
    }
  }
  // A valid old version-1 save can omit newly introduced achievement fields.
  awardAchievements(state, state.createdAt);
  return state;
}

export function loadState(storage) {
  let raw;
  try {
    storage ??= globalThis.localStorage;
    raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return { state: createInitialState() };
    return { state: validateState(JSON.parse(raw)) };
  } catch (error) {
    if (raw) {
      try {
        storage.setItem(CORRUPT_BACKUP_KEY, raw);
        return { state: createInitialState(), warning: `本地存档损坏，已开始新游戏；原始数据已备份至 ${CORRUPT_BACKUP_KEY}。`, corruptBackupKey: CORRUPT_BACKUP_KEY };
      } catch {
        return { state: createInitialState(), warning: '本地存档损坏且无法备份，已进入临时新游戏。自动保存将暂停以保护原始存档，请导出新进度备份。' };
      }
    }
    return { state: createInitialState(), warning: '未能读取浏览器存储，已进入临时新游戏；请导出进度备份。' };
  }
}

export function saveState(state, storage) {
  try {
    storage ??= globalThis.localStorage;
    if (!storage || typeof storage.setItem !== 'function') throw new Error('Storage unavailable');
    const previous = storage.getItem?.(STORAGE_KEY);
    if (previous) {
      try { validateState(JSON.parse(previous)); } catch {
        // Do not overwrite a corrupt save until its exact raw data is recoverable.
        try { storage.setItem(CORRUPT_BACKUP_KEY, previous); } catch {
          return { ok: false, error: '原存档损坏且备份失败，已暂停自动保存以保护原始数据。请导出当前进度。' };
        }
      }
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: '浏览器无法保存进度，请导出存档备份。' };
  }
}

export function importState(raw) {
  if (typeof raw !== 'string' || raw.length > 2000000) throw new Error('请选择有效的 JSON 存档（小于 2 MB）。');
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('这不是有效的 JSON 存档。'); }
  // Supports both raw state and the human-readable export envelope.
  return validateState(parsed?.game === 'absurd-gacha' ? parsed.state : parsed);
}

export function exportState(state) {
  return JSON.stringify({ game: 'absurd-gacha', exportedAt: new Date().toISOString(), state }, null, 2);
}

function randomUnit(rng) {
  const number = rng();
  if (typeof number !== 'number' || !Number.isFinite(number) || number < 0 || number >= 1) {
    throw new RangeError('随机数必须在 0（含）到 1（不含）之间。');
  }
  return number;
}

function pickRarity(rng, minimum = 'common') {
  const allowed = LEVELS.slice(LEVELS.indexOf(minimum));
  const total = allowed.reduce((sum, rarity) => sum + Math.round(ODDS[rarity] * 100), 0);
  let value = randomUnit(rng) * total;
  for (const rarity of allowed) {
    value -= Math.round(ODDS[rarity] * 100);
    if (value < 0) return rarity;
  }
  return allowed.at(-1);
}

function copyState(state) {
  return {
    ...state,
    inventory: Object.fromEntries(Object.entries(state.inventory).map(([id, entry]) => [id, { ...entry }])),
    history: state.history.map(entry => ({ ...entry })),
    settings: { ...state.settings },
    secrets: [...state.secrets],
    achievements: { ...state.achievements },
  };
}

function receiveItem(state, item, at, countPull = true) {
  const previous = state.inventory[item.id];
  const isNew = !previous;
  if (countPull) state.totalPulls += 1;
  state.inventory[item.id] = { count: (previous?.count || 0) + 1, firstAt: previous?.firstAt ?? at, lastAt: Math.max(previous?.lastAt ?? at, at) };
  const entry = { id: item.id, rarity: item.rarity, at, isNew, pull: state.totalPulls };
  state.history.unshift(entry);
  state.history.length = Math.min(state.history.length, HISTORY_LIMIT);
  return { ...entry, item };
}

export function drawItems(inputState, count = 1, { rng = Math.random, now = Date.now() } = {}) {
  if (count !== 1 && count !== 10) throw new RangeError('每次只能扭 1 次或 10 次。');
  if (!timestamp(now)) throw new TypeError('抽奖时间无效。');
  if (inputState.totalPulls > MAX_COUNT - count) throw new RangeError('抽奖次数已达到本机记录上限。');
  const state = copyState(inputState);
  const results = [];
  let hasRare = false;
  for (let i = 0; i < count; i += 1) {
    const guaranteedLegendary = state.pity >= PITY_LIMIT - 1;
    const guaranteedRare = count === 10 && i === 9 && !hasRare;
    const rarity = guaranteedLegendary ? 'legendary' : pickRarity(rng, guaranteedRare ? 'rare' : 'common');
    const pool = POOLS[rarity];
    if (!pool?.length) throw new Error(`缺少 ${rarity} 等级的藏品。`);
    const item = pool[Math.floor(randomUnit(rng) * pool.length)];
    state.pity = rarity === 'legendary' ? 0 : state.pity + 1;
    const result = receiveItem(state, item, now + i);
    result.guaranteed = guaranteedLegendary ? 'pity' : guaranteedRare ? 'ten' : null;
    results.push(result);
    if (LEVELS.indexOf(rarity) >= LEVELS.indexOf('rare')) hasRare = true;
  }
  if (count === 10) state.tenDraws = (state.tenDraws || 0) + 1;
  const newAchievements = awardAchievements(state, now);
  return { state, results, newAchievements };
}

export function unlockSecret(inputState, id, { now = Date.now() } = {}) {
  if (typeof id !== 'string' || id.length > 100 || !timestamp(now)) throw new TypeError('彩蛋参数无效。');
  const state = copyState(inputState);
  if (state.secrets.includes(id)) return { state, item: null, result: null, isNew: false, newAchievements: [] };
  state.secrets.push(id);
  const item = ITEM_BY_ID.get(id);
  const result = item?.secret ? receiveItem(state, item, now, false) : null;
  const newAchievements = awardAchievements(state, now);
  return { state, item: result ? item : null, result, isNew: true, newAchievements };
}

export function getStats(state) {
  const owned = Object.keys(state.inventory).filter(id => ITEM_BY_ID.has(id));
  const normalIds = owned.filter(id => !ITEM_BY_ID.get(id).secret);
  const normalOwned = normalIds.length;
  // These counts drive normal-pool achievements; easter-egg rewards are separate.
  const byRarity = Object.fromEntries(LEVELS.map(rarity => [rarity, normalIds.filter(id => ITEM_BY_ID.get(id).rarity === rarity).length]));
  return {
    totalPulls: state.totalPulls,
    unique: owned.length,
    normalOwned,
    total: ITEMS.length,
    normalTotal: NORMAL_ITEMS.length,
    duplicates: Object.values(state.inventory).reduce((sum, entry) => sum + Math.max(0, entry.count - 1), 0),
    completion: NORMAL_ITEMS.length ? Math.round(normalOwned / NORMAL_ITEMS.length * 100) : 0,
    byRarity,
    untilLegendary: PITY_LIMIT - state.pity,
    secrets: state.secrets.length,
    achievements: Object.keys(state.achievements).length,
  };
}

export const ACHIEVEMENTS = Object.freeze([
  { id: 'first', icon: '🫳', name: '手欠的开始', description: '完成第一次扭蛋', goal: 1, progress: state => state.totalPulls },
  { id: 'ten', icon: '🎟️', name: '小试牛刀', description: '累计扭蛋 10 次', goal: 10, progress: state => state.totalPulls },
  { id: 'fifty', icon: '🌀', name: '扭矩工程师', description: '累计扭蛋 50 次', goal: 50, progress: state => state.totalPulls },
  { id: 'hundred', icon: '🦾', name: '拉杆退休计划', description: '累计扭蛋 100 次', goal: 100, progress: state => state.totalPulls },
  { id: 'duplicate', icon: '👯', name: '又是你啊', description: '抽到一个重复藏品', goal: 1, progress: state => getStats(state).duplicates },
  { id: 'unique-ten', icon: '📦', name: '破烂初具规模', description: '收集 10 种普通池藏品', goal: 10, progress: state => getStats(state).normalOwned },
  { id: 'unique-thirty', icon: '🏛️', name: '离谱博物馆', description: '收集 30 种普通池藏品', goal: 30, progress: state => getStats(state).normalOwned },
  { id: 'complete', icon: '👑', name: '宇宙级收破烂', description: '收齐全部普通池藏品', goal: NORMAL_ITEMS.length, progress: state => getStats(state).normalOwned },
  { id: 'epic', icon: '🔮', name: '紫气乱来', description: '获得一件史诗藏品', goal: 1, progress: state => getStats(state).byRarity.epic },
  { id: 'legendary', icon: '☀️', name: '金色传说？真有！', description: '获得一件传说藏品', goal: 1, progress: state => getStats(state).byRarity.legendary },
  { id: 'secrets', icon: '👽', name: '这也能被你发现', description: '触发 3 个不同彩蛋', goal: 3, progress: state => state.secrets.length },
  { id: 'ten-draw', icon: '🎰', name: '成年人全都要', description: '完成一次十连扭蛋', goal: 1, progress: state => state.tenDraws || 0 },
]);

function awardAchievements(state, at) {
  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!(achievement.id in state.achievements) && achievement.progress(state) >= achievement.goal) {
      state.achievements[achievement.id] = at;
      newlyUnlocked.push({ ...achievement, unlocked: true, unlockedAt: at, current: achievement.goal });
    }
  }
  return newlyUnlocked;
}

export function getAchievements(state) {
  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    current: Math.min(achievement.goal, achievement.progress(state)),
    unlocked: achievement.id in state.achievements,
    unlockedAt: state.achievements[achievement.id] ?? null,
  }));
}
