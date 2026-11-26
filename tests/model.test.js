import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hash32, rng, phi, estimateRank, computeStreaks, levelInfo,
  cohortFor, compareTime, weakTopics, trendBuckets, validateBackup
} from '../src/model.js';
import { normalizeQuestion, buildQuestionBank, SEED_QUESTIONS, EXAM_COPY } from '../src/config.js';
import { buildBackup } from '../src/store.js';

const now = new Date('2026-11-27T12:00:00Z').getTime();
const day = 864e5;

test('hash32 and rng are deterministic', () => {
  assert.equal(hash32('p1'), hash32('p1'));
  assert.notEqual(hash32('p1'), hash32('p2'));
  const a = rng(42), b = rng(42);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
});

test('phi is monotonic and bounded', () => {
  assert.ok(phi(-2) < phi(0));
  assert.ok(phi(0) < phi(2));
  assert.ok(phi(0) > 0.48 && phi(0) < 0.52);
});

test('estimateRank stays inside the candidate pool', () => {
  const low = estimateRank(0, 0, 1200000);
  const high = estimateRank(4 * 27, 27, 1200000);
  assert.ok(low.air >= 1 && low.air <= 1200000);
  assert.ok(high.air >= 1 && high.air <= 1200000);
  assert.ok(high.air < low.air, 'more correct answers should improve the estimate');
});

test('computeStreaks handles today, yesterday and gaps', () => {
  const attempts = [
    { ts: now - 2 * day }, { ts: now - day }, { ts: now }, { ts: now - 9 * day }
  ];
  const result = computeStreaks(attempts, now);
  assert.equal(result.current, 3);
  assert.equal(result.longest, 3);
  assert.equal(computeStreaks([{ ts: now - 2 * day }], now).current, 0);
});

test('levelInfo awards XP for participation and correctness', () => {
  const attempts = [{ ok: true }, { ok: false }, { ok: null }];
  assert.deepEqual(levelInfo(attempts), { xp: 14, level: 1, current: 14, needed: 100 });
});

test('cohortFor is stable and compareTime returns a share', () => {
  const question = SEED_QUESTIONS[0];
  assert.deepEqual(cohortFor(question), cohortFor(question));
  const comparison = compareTime(question, question.m);
  assert.ok(comparison.slower >= 0 && comparison.slower <= 1);
  assert.ok(comparison.cohort.times.length === 800);
});

test('weakTopics ranks low accuracy first', () => {
  const pool = [
    { id: 'a', tp: 'Topic A' }, { id: 'b', tp: 'Topic B' }, { id: 'c', tp: 'Topic C' }
  ];
  const attempts = [
    { q: 'a', ok: false, t: 10000 }, { q: 'a', ok: false, t: 10000 },
    { q: 'b', ok: true, t: 5000 }, { q: 'b', ok: true, t: 5000 },
    { q: 'c', ok: true, t: 5000 }
  ];
  const result = weakTopics(attempts, pool, 2);
  assert.equal(result[0].topic, 'Topic A');
  assert.ok(result[0].accuracy < result[1].accuracy);
  assert.ok(result[0].sampleId);
});

test('trendBuckets counts attempts on the right day', () => {
  const buckets = trendBuckets([{ ts: now }, { ts: now - day }], 7, now);
  assert.equal(buckets.length, 7);
  assert.equal(buckets[6].count, 1);
  assert.equal(buckets[5].count, 1);
  assert.equal(buckets[0].count, 0);
});

test('validateBackup rejects malformed attempts', () => {
  assert.equal(validateBackup(null).ok, false);
  assert.equal(validateBackup({ attempts: [{ q: 'p1' }] }).ok, false);
  const good = validateBackup({ attempts: [{ q: 'p1', e: 'jee', ok: true, t: 100, ts: now }] });
  assert.equal(good.ok, true);
  assert.equal(good.data.attempts.length, 1);
});

test('buildBackup excludes secrets and carries exam and theme', () => {
  const backup = buildBackup({ name: 'A', pw: 'hash', salt: 's' }, [], [], 'neet', 'light');
  assert.equal(backup.exam, 'neet');
  assert.equal(backup.theme, 'light');
  assert.equal(backup.user.pw, undefined);
  assert.equal(backup.user.salt, undefined);
  assert.equal(backup.user.name, 'A');
});

test('validateBackup preserves exam and theme from a backup', () => {
  const result = validateBackup({ attempts: [], exam: 'neet', theme: 'light' });
  assert.equal(result.ok, true);
  assert.equal(result.data.exam, 'neet');
  assert.equal(result.data.theme, 'light');
  assert.equal(validateBackup({ attempts: [], theme: 'neon' }).data.theme, null);
});

test('exam copy is distinct and complete for every exam', () => {
  const keys = ['jee', 'neet', 'boards'];
  keys.forEach(key => {
    const copy = EXAM_COPY[key];
    assert.ok(copy.kicker && copy.daily && copy.focus && copy.stripTitle && copy.note);
    assert.equal(copy.strip.length, 4);
    copy.strip.forEach(item => assert.ok(item.k && item.v));
  });
  assert.notEqual(EXAM_COPY.jee.daily, EXAM_COPY.neet.daily);
  assert.match(EXAM_COPY.jee.kicker, /MATHS/);
  assert.match(EXAM_COPY.neet.kicker, /CLINICAL/);
});

test('normalizeQuestion sanitises external input', () => {
  const ids = new Set(['p1']);
  assert.equal(normalizeQuestion({ id: 'p1', o: [1,2,3,4], a: 0, s: 'Physics', x: ['jee'] }, ids), null);
  const clean = normalizeQuestion({
    id: 'x1', t: '<b>Hi</b>', o: ['a','b','c','d'], a: 1, s: 'Physics', x: ['jee'], q: 'Q?'
  }, ids);
  assert.ok(clean);
  assert.equal(clean.t, '&lt;b&gt;Hi&lt;/b&gt;');
  assert.equal(clean.d, 'M');
  assert.equal(buildQuestionBank([{ id: 'x1', o: [1,2,3,4], a: 0, s: 'Physics', x: ['jee'] }]).length, SEED_QUESTIONS.length + 1);
});
