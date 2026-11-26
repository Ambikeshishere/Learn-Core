/**
 * Pure domain logic. No DOM, no storage, no side effects.
 * Every function here is unit-testable with `npm test`.
 */

/** FNV-1a: stable, fast hashing used only for deterministic demo data. */
export function hash32(str){
  let h = 2166136261;
  for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Seeded PRNG so simulated cohorts look the same on every reload. */
export function rng(seed){
  let a = seed;
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function gauss(random){
  let u = 0; while(!u) u = random();
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Standard normal CDF approximation (Abramowitz-Stegun). */
export function phi(z){
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function sum(arr, fn){
  let total = 0;
  for(let i = 0; i < arr.length; i++) total += fn(arr[i]);
  return total;
}

export function dayKey(ts){
  const d = new Date(ts);
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

export const formatIN = n => Math.round(n).toLocaleString('en-IN');
export const formatK  = n => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
export const formatT  = ms => (ms / 1000).toFixed(1) + ' s';
export const formatTop = t => t < 1 ? t.toFixed(2) : t.toFixed(1);

/**
 * Rank model: shrink the average marks per question toward a prior, then map
 * that score to a percentile on a normal curve. This is a modelled estimate,
 * never an official prediction — the UI says so explicitly.
 */
export function estimateRank(net, n, population){
  const score = (net + 10 * 0.8) / (n + 10);
  const z = (score - 0.9) / 0.8;
  const top = 1 - phi(z);
  return { air: Math.max(1, Math.round(top * population)), top: top * 100, score };
}

/** Current and longest streak from a list of attempts. */
export function computeStreaks(attempts, now = Date.now()){
  const set = {};
  attempts.forEach(a => { const k = dayKey(a.ts); set[k] = (set[k] || 0) + 1; });
  let current = 0;
  const cursor = new Date(now); cursor.setHours(12, 0, 0, 0);
  if(!set[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while(set[dayKey(cursor)]){ current++; cursor.setDate(cursor.getDate() - 1); }
  const days = Object.keys(set).map(k => {
    const p = k.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2], 12).getTime();
  }).sort((a, b) => a - b);
  let longest = 0, run = 0, prev = null;
  days.forEach(t => {
    run = (prev !== null && Math.round((t - prev) / 864e5) === 1) ? run + 1 : 1;
    if(run > longest) longest = run;
    prev = t;
  });
  return { current, longest, set };
}

/** XP is awarded for participation as well as correctness. */
export function levelInfo(attempts){
  const xp = sum(attempts, a => a.ok === true ? 10 : a.ok === false ? 3 : 1);
  return { xp, level: Math.floor(xp / 100) + 1, current: xp % 100, needed: 100 };
}

/** Deterministic simulated cohort for one question. */
export function cohortFor(question){
  const random = rng(hash32(question.id));
  const base = { E: 0.70, M: 0.46, H: 0.26 }[question.d];
  const acceptance = base + 0.17 * random();
  const attempts = Math.round(7000 + random() * 9000);
  const times = [];
  for(let i = 0; i < 800; i++) times.push(Math.max(4, question.m * Math.exp(0.42 * gauss(random))));
  times.sort((a, b) => a - b);
  return { acceptance, attempts, correct: Math.round(attempts * acceptance), times };
}

export function compareTime(question, seconds){
  const cohort = cohortFor(question);
  let slower = 0, same = 0;
  for(let i = 0; i < cohort.times.length; i++){
    if(cohort.times[i] > seconds) slower++;
    if(Math.floor(cohort.times[i]) === Math.floor(seconds)) same++;
  }
  return {
    slower: slower / cohort.times.length,
    same: same / cohort.times.length * cohort.correct,
    cohort
  };
}

/** Badge catalogue. `isSolved(id)` is injected so this stays pure. */
export function badgeDefinitions(attempts, pool, isSolved, subjects){
  const correct = attempts.filter(a => a.ok === true).length;
  const wrong = attempts.filter(a => a.ok === false).length;
  const streaks = computeStreaks(attempts);
  const accuracy = correct + wrong ? correct / (correct + wrong) : 0;
  const quick = attempts.filter(a => {
    const q = pool.find(item => item.id === a.q);
    return a.ok === true && q && a.t / 1000 < q.m;
  }).length;
  const cleanSweep = subjects.some(s => {
    const list = pool.filter(q => q.s === s);
    return list.length > 0 && list.every(q => isSolved(q.id));
  });
  return [
    { name: 'First step',   detail: 'Your first correct answer',            earned: correct >= 1,                                  mark: '01' },
    { name: 'On a roll',    detail: '3-day streak',                         earned: streaks.longest >= 3,                          mark: '03' },
    { name: 'Unbreakable',  detail: '7-day streak',                         earned: streaks.longest >= 7,                          mark: '07' },
    { name: 'Twenty strong',detail: '20 answers',                           earned: attempts.length >= 20,                         mark: '20' },
    { name: 'Century',      detail: '100 answers',                          earned: attempts.length >= 100,                        mark: '100' },
    { name: 'Sharpshooter', detail: '80% accuracy over 20+ answers',        earned: correct + wrong >= 20 && accuracy >= 0.8,      mark: '80' },
    { name: 'Quick mind',   detail: '10 correct answers under median time', earned: quick >= 10,                                  mark: '10' },
    { name: 'Clean sweep',  detail: 'Clear every question in one subject',  earned: cleanSweep,                                    mark: 'ALL' }
  ];
}

/**
 * Weak topics ranked by accuracy, then by how often they are attempted.
 * `scope` may be a pre-filtered attempt list (e.g. last 30 days).
 */
export function weakTopics(scope, pool, limit = 3){
  const byTopic = new Map();
  scope.forEach(a => {
    const q = pool.find(item => item.id === a.q);
    if(!q) return;
    const entry = byTopic.get(q.tp) || { topic: q.tp, total: 0, correct: 0, pace: 0 };
    entry.total++;
    if(a.ok === true) entry.correct++;
    entry.pace += a.t / 1000 / q.m;
    byTopic.set(q.tp, entry);
  });
  const ranked = Array.from(byTopic.values()).map(v => ({
    ...v, accuracy: v.correct / v.total, pace: v.pace / v.total
  })).sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
  return ranked.slice(0, limit).map(v => ({
    ...v,
    sampleId: (pool.find(q => q.tp === v.topic && !v.solved) || pool.find(q => q.tp === v.topic) || {}).id
  })).filter(v => v.sampleId);
}

/** Daily attempt counts for a chart, oldest bucket first. */
export function trendBuckets(attempts, days, now = Date.now()){
  const today = new Date(now); today.setHours(12, 0, 0, 0);
  const buckets = [];
  for(let i = days - 1; i >= 0; i--){
    const d = new Date(today); d.setDate(d.getDate() - i);
    buckets.push({ key: dayKey(d), date: d, count: 0 });
  }
  attempts.forEach(a => {
    const key = dayKey(a.ts);
    const bucket = buckets.find(b => b.key === key);
    if(bucket) bucket.count++;
  });
  return buckets;
}

/** Validate an imported backup before it is allowed to overwrite local data. */
export function validateBackup(payload){
  if(!payload || typeof payload !== 'object') return { ok: false, error: 'Not a JSON object.' };
  if(!Array.isArray(payload.attempts)) return { ok: false, error: 'Missing attempts array.' };
  const validAttempts = payload.attempts.filter(a =>
    a && typeof a.q === 'string' && typeof a.e === 'string' &&
    typeof a.t === 'number' && typeof a.ts === 'number' && [true, false, null].includes(a.ok)
  );
  if(validAttempts.length !== payload.attempts.length) return { ok: false, error: 'Some attempts are malformed.' };
  return {
    ok: true,
    data: {
      user: payload.user && typeof payload.user === 'object' ? payload.user : null,
      attempts: validAttempts,
      events: Array.isArray(payload.events) ? payload.events : [],
      exam: typeof payload.exam === 'string' ? payload.exam : null,
      theme: payload.theme === 'light' || payload.theme === 'dark' ? payload.theme : null
    }
  };
}
