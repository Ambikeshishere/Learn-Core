/** All screen renderers and their local interactions. */

import { EXAMS, ALL_EXAMS, DIFFICULTY, escapeHTML } from './config.js';
import {
  hash32, dayKey, formatIN, formatK, formatT, formatTop, sum,
  estimateRank, computeStreaks, levelInfo, cohortFor, compareTime,
  weakTopics, trendBuckets, badgeDefinitions, rng, gauss, validateBackup
} from './model.js';
import {
  state, QBY, pool, forExam, statusOf, filteredAttempts, saveAttempts
} from './state.js';
import {
  ladderSVG, trendSVG, histSVG, chartSVG, heatSVG, toast, download, typeset
} from './components.js';
import { track, allEvents } from './events.js';
import { store, KEYS, buildBackup } from './store.js';
import { currentUser, updateUser, initials, logout } from './auth.js';
import { openAuth } from './auth-ui.js';

const CHECK = '<svg viewBox="0 0 24 24" width="18" height="18" aria-label="Solved"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FN = ['Aarav','Ananya','Arjun','Diya','Ishaan','Kavya','Rohan','Sneha','Vihaan','Meera','Aditya','Riya','Kabir','Tanvi','Harsh','Naina','Yash','Pooja','Dev','Shreya','Aryan','Nidhi','Karan','Isha','Rahul','Simran','Varun','Prisha','Manav','Aisha'];
const LN = ['S','V','I','N','R','P','G','M','D','J','K','C','B','T','Y'];

let timer = null;
let rerender = () => {};

export function setRerender(fn){ rerender = fn; }
const $ = (selector, root = document) => root.querySelector(selector);

/* ---------- shared selectors ---------- */
function bestOf(id){
  const times = forExam(state.exam).filter(a => a.q === id && a.ok === true).map(a => a.t);
  return times.length ? (Math.min(...times) / 1000).toFixed(1) + 's' : '-';
}
function dailyQuestion(){
  const list = pool();
  return list[hash32(dayKey(Date.now()) + state.exam) % list.length];
}
export function nextId(){
  const list = pool();
  const index = list.indexOf(state.q);
  for(let k = 1; k < list.length; k++){
    const candidate = list[(index + k) % list.length];
    if(statusOf(candidate.id) !== 's') return candidate.id;
  }
  return list[(index + 1) % list.length].id;
}
function badges(){
  return badgeDefinitions(
    forExam(state.exam), pool(), id => statusOf(id) === 's', EXAMS[state.exam].subjects
  );
}
function recommendations(useRange, limit){
  return weakTopics(useRange ? filteredAttempts() : forExam(state.exam), pool(), limit);
}

/* ---------- header ---------- */
export function drawHeader(){
  $('#examseg').innerHTML = ALL_EXAMS.map(k =>
    `<button data-exam="${k}" aria-pressed="${state.exam === k}">${EXAMS[k].name}</button>`
  ).join('');
  const user = currentUser();
  const box = $('#userbox');
  if(user){
    const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    box.innerHTML =
      `<button class="avatar" id="userbtn" aria-label="Account menu" aria-expanded="false">${escapeHTML(initials(user.name))}</button>` +
      `<div class="umenu" id="umenu"><div class="uwho"><b>${escapeHTML(user.name)}</b><small>${escapeHTML(user.guest ? 'Guest · saved on this device' : user.email)}</small></div>` +
      `<a href="#dashboard">Dashboard</a><a href="#analytics">Analytics</a><a href="#profile">Profile & badges</a>` +
      `<button data-u="theme">Switch to ${dark ? 'light' : 'dark'} mode</button>` +
      (user.guest ? '<button data-u="signup">Create an account</button>' : '') +
      `<button class="udanger" data-u="logout">Log out</button></div>`;
    $('#userbtn').addEventListener('click', function(){
      const menu = $('#umenu');
      menu.classList.toggle('open');
      this.setAttribute('aria-expanded', menu.classList.contains('open'));
    });
    box.querySelectorAll('[data-u]').forEach(button => button.addEventListener('click', () => {
      const menu = $('#umenu'); if(menu) menu.classList.remove('open');
      const action = button.dataset.u;
      if(action === 'theme'){
        const next = dark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        store.set(KEYS.theme, next);
        track('theme', { to: next });
        drawHeader();
      } else if(action === 'logout'){
        logout();
        state.user = null;
        toast('Logged out. Your progress stays on this device.');
        rerender();
      } else if(action === 'signup'){
        logout(); state.user = null; openAuth('signup');
      }
    }));
  } else {
    box.innerHTML = '<button class="btn sm" id="signupbtn">Sign up</button>';
    $('#signupbtn').addEventListener('click', () => openAuth('signup'));
  }
  updateChip();
}

export function updateChip(){
  const attempts = forExam(state.exam);
  const estimate = estimateRank(sum(attempts, a => a.m), attempts.length, EXAMS[state.exam].pop);
  $('#chiplab').textContent = EXAMS[state.exam].label;
  $('#chipv').textContent = attempts.length ? formatIN(estimate.air) : '-';
  $('#streakv').textContent = computeStreaks(state.attempts).current + 'd';
  const level = $('#xpv');
  if(level) level.textContent = 'Lv ' + levelInfo(state.attempts).level;
}

/* ---------- problems list ---------- */
export function renderProblems(){
  const exam = EXAMS[state.exam];
  const list = pool();
  const solved = list.filter(q => statusOf(q.id) === 's').length;
  const daily = dailyQuestion();
  const fraction = list.length ? solved / list.length : 0;
  const byDifficulty = ['E','M','H'].map(d => {
    const group = list.filter(q => q.d === d);
    const done = group.filter(q => statusOf(q.id) === 's').length;
    return `<div><span class="d-${d}">${DIFFICULTY[d]}</span><b>${done}/${group.length}</b></div>`;
  }).join('');
  const streaks = computeStreaks(state.attempts);
  $('#view').innerHTML = '<div class="plist"><div>' +
    `<div class="filters"><input id="fq" type="search" placeholder="Search problems or topics" aria-label="Search" value="${escapeHTML(state.filters.text)}">` +
    `<select id="fd" aria-label="Difficulty"><option value="">Difficulty</option><option value="E">Easy</option><option value="M">Medium</option><option value="H">Hard</option></select>` +
    `<select id="fst" aria-label="Status"><option value="">Status</option><option value="todo">Todo</option><option value="t">Attempted</option><option value="s">Solved</option></select>` +
    `<select id="fsub" aria-label="Subject"><option value="">Subject</option>${exam.subjects.map(s => `<option>${s}</option>`).join('')}</select>` +
    `<button class="btn ghost sm" data-act="random">Surprise me</button></div>` +
    `<div class="card ptable" id="rows"></div><p class="hint" id="rcount"></p></div>` +
    `<aside class="side">` +
      `<div class="card daily"><div class="dt">Daily question · ${new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</div>` +
      `<div class="nm">${escapeHTML(daily.t)}</div><div style="display:flex;gap:10px;align-items:center"><span class="badge d-${daily.d}">${DIFFICULTY[daily.d]}</span><a class="btn sm" href="#q-${daily.id}">${statusOf(daily.id) === 's' ? 'Solve again' : 'Solve'}</a></div></div>` +
      `<div class="card"><h3>Your climb</h3><div class="prog">${ladderSVG(Math.round(fraction * 100), solved + '/' + list.length)}<div class="dstat">${byDifficulty}</div></div></div>` +
      `<div class="card"><h3>Streak</h3><div class="stats"><div class="stat"><small>Current</small><b>${streaks.current}d</b></div><div class="stat"><small>Longest</small><b>${streaks.longest}d</b></div></div><p class="insight">Answer at least one question a day to keep it going.</p></div>` +
    `</aside></div>`;
  $('#fd').value = state.filters.diff;
  $('#fst').value = state.filters.status;
  $('#fsub').value = state.filters.subj;
  drawRows();
}

export function drawRows(){
  const list = pool();
  const filters = state.filters;
  const text = filters.text.trim().toLowerCase();
  let out = '<div class="prow head"><span></span><span>Title</span><span>Topic</span><span style="text-align:right">Success</span><span style="text-align:right">Best</span><span style="text-align:right">Level</span></div>';
  let shown = 0;
  list.forEach((q, i) => {
    const status = statusOf(q.id);
    if(filters.diff && q.d !== filters.diff) return;
    if(filters.subj && q.s !== filters.subj) return;
    if(filters.status === 'todo' && status) return;
    if(filters.status === 't' && status !== 't') return;
    if(filters.status === 's' && status !== 's') return;
    if(text && (q.t + ' ' + q.tp + ' ' + q.s).toLowerCase().indexOf(text) < 0) return;
    shown++;
    out += `<a class="prow" href="#q-${q.id}"><span class="st ${status}">${status === 's' ? CHECK : status === 't' ? '<i></i>' : ''}</span>` +
      `<span class="ptt"><span class="pn">${i + 1}.</span>${q.t}</span><span class="ptp">${q.tp}</span>` +
      `<span class="pac">${(cohortFor(q).acceptance * 100).toFixed(1)}%</span><span class="pbest">${bestOf(q.id)}</span>` +
      `<span class="pdf d-${q.d}">${DIFFICULTY[q.d]}</span></a>`;
  });
  if(!shown) out += '<p class="empty">No problems match these filters.</p>';
  $('#rows').innerHTML = out;
  $('#rcount').textContent = shown + ' of ' + list.length + ' problems shown';
}

/* ---------- problem page ---------- */
export function openQuestion(question){
  state.q = question;
  state.sel = -1;
  state.locked = false;
  state.res = null;
  state.tab = 'desc';
  state.t0 = performance.now();
  track('problem_open', { q: question.id, exam: state.exam });
}

export function renderProblem(){
  $('#view').innerHTML = '<div class="crumb"><a href="#problems">← All problems</a></div><div class="split"><section class="card" id="lpane"></section><section class="card" id="rpane" aria-live="polite"></section></div>';
  drawLeft(); drawRight(); startTimer();
}

export function drawLeft(){
  const q = state.q;
  const number = pool().indexOf(q) + 1;
  const cohort = cohortFor(q);
  const letters = 'ABCD';
  const tabs = [['desc','Description'],['sol','Solution'],['sub','Attempts']].map(t =>
    `<button data-act="tab" data-v="${t[0]}" aria-pressed="${state.tab === t[0]}">${t[1]}</button>`
  ).join('');
  const mine = forExam(state.exam).filter(a => a.q === q.id);
  let body = '';
  if(state.tab === 'desc'){
    body = `<h1 class="ptitle">${number}. ${q.t}</h1><div class="badges"><span class="badge d-${q.d}">${DIFFICULTY[q.d]}</span><span class="tagc">${q.s}</span><span class="tagc">${q.tp}</span></div>` +
      `<p class="qtext">${q.q}</p>` +
      `<div class="kv"><div><small>Marking</small><b>+4 / −1 / 0</b></div><div><small>Median time</small><b>${q.m} s</b></div><div><small>Success rate</small><b>${(cohort.acceptance * 100).toFixed(1)}%</b></div><div><small>Attempts</small><b>${formatK(cohort.attempts)}</b></div></div>` +
      `<p class="insight">A wrong answer costs 1 extra mark, so a guess breaks even at 20% confidence. <span class="sim">Simulated stats</span></p>` + (q.src ? `<p class="insight">Source: ${q.src}</p>` : '');
  } else if(state.tab === 'sol'){
    body = mine.length
      ? `<h3>Answer</h3><div class="code">${letters[q.a]}. ${q.o[q.a]}</div><p class="qtext">${q.e}</p>`
      : '<p class="empty">Check one answer to unlock the worked solution.</p>';
  } else {
    body = mine.length
      ? '<div class="tblwrap"><table><thead><tr><th>Status</th><th>Time</th><th>Marks</th><th>When</th></tr></thead><tbody>' +
        mine.slice().reverse().map(a => {
          const label = a.ok === true ? '<span class="pos">Correct</span>' : a.ok === false ? '<span class="neg">Needs work</span>' : 'Left blank';
          return `<tr><td>${label}</td><td>${(a.t / 1000).toFixed(1)} s</td><td>${a.m > 0 ? '+' : ''}${a.m}</td><td>${new Date(a.ts).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td></tr>`;
        }).join('') + '</tbody></table></div>'
      : '<p class="empty">No submissions yet.</p>';
  }
  $('#lpane').innerHTML = `<div class="ptabs" role="group" aria-label="Problem tabs">${tabs}</div>` + body;
  typeset($('#lpane'));
}

function resultHTML(){
  const q = state.q, result = state.res, letters = 'ABCD';
  const seconds = (result.t / 1000).toFixed(1);
  const cohort = cohortFor(q);
  if(result.kind === 'ok'){
    const comparison = compareTime(q, result.t / 1000);
    return `<div class="res ok"><div class="sub"><h2>Correct</h2><span class="mk pos">+4 marks</span></div>` +
      `<div class="boxes"><div class="box"><small>Time</small><div class="v">${seconds} s</div><div class="w">Beats ${Math.round(comparison.slower * 100)}% of accepted submissions</div></div>` +
      `<div class="box"><small>Same second</small><div class="v">~${formatIN(comparison.same)}</div><div class="w">of ${formatIN(cohort.correct)} who solved it, at ${Math.floor(result.t / 1000)} s</div></div></div>` +
      `<div class="histbox">${histSVG(q, result.t / 1000)}</div><p class="hint" style="margin:8px 0 0">Dashed line is the median (${q.m} s). <span class="sim">Simulated cohort</span></p>` +
      `<p class="why">${q.e}</p></div>`;
  }
  if(result.kind === 'bad'){
    return `<div class="res bad"><div class="sub"><h2>Needs work</h2><span class="mk neg">−1 mark</span></div>` +
      `<div class="code"><small>Your answer</small>${letters[state.sel]}. ${q.o[state.sel]}</div><div class="code"><small>Expected</small>${letters[q.a]}. ${q.o[q.a]}</div>` +
      `<p class="why">${q.e}</p><p class="why">${Math.round(cohort.acceptance * 100)}% of students get this right, and they take a median of ${q.m} s. You spent ${seconds} s. <span class="sim">Simulated cohort</span></p></div>`;
  }
  return `<div class="res"><div class="sub"><h2>Skipped</h2><span class="mk">0 marks</span></div><div class="code"><small>Expected</small>${letters[q.a]}. ${q.o[q.a]}</div><p class="why">${q.e}</p></div>`;
}

export function drawRight(){
  const q = state.q, letters = 'ABCD';
  const options = q.o.map((option, i) => {
    let cls = 'opt';
    if(state.locked){ if(i === q.a) cls += ' right'; else if(i === state.sel) cls += ' wrong'; }
    return `<li><button class="${cls}" role="radio" aria-checked="${state.sel === i}" data-act="pick" data-i="${i}"${state.locked ? ' disabled' : ''}><span class="bub">${letters[i]}</span><span>${option}</span></button></li>`;
  }).join('');
  const actions = state.locked
    ? `<a class="btn" id="nextbtn" href="#q-${nextId()}">Next question →</a><a class="btn ghost" href="#problems">All questions</a>`
    : `<button class="btn" data-act="lock"${state.sel < 0 ? ' disabled' : ''}>Check answer</button><button class="btn ghost" data-act="skip">Leave blank</button><span class="hint">A–D or 1–4 to choose, Enter to check</span>`;
  $('#rpane').innerHTML = `<div class="ahead"><b>Your answer</b><span class="scheme">+4 / −1</span><span class="timer" id="timer">${state.locked && state.res ? formatT(state.res.t) : '0.0 s'}</span></div>` +
    `<ul class="opts" role="radiogroup" aria-label="Options">${options}</ul><div class="actions">${actions}</div>` + (state.locked ? resultHTML() : '');
  typeset($('#rpane'));
}

function startTimer(){
  clearInterval(timer);
  if(state.locked) return;
  timer = setInterval(() => {
    const element = $('#timer');
    if(!element){ clearInterval(timer); return; }
    element.textContent = formatT(performance.now() - state.t0);
  }, 100);
}

export function pick(index){
  if(state.locked) return;
  state.sel = index;
  drawRight();
}

export function lockAnswer(skip){
  if(state.locked || (!skip && state.sel < 0)) return;
  const before = badges().filter(b => b.earned).map(b => b.name);
  const elapsed = Math.round(performance.now() - state.t0);
  const correct = skip ? null : state.sel === state.q.a;
  const marks = skip ? 0 : correct ? 4 : -1;
  state.attempts.push({ q: state.q.id, e: state.exam, s: state.q.s, c: skip ? -1 : state.sel, ok: correct, t: elapsed, m: marks, ts: Date.now() });
  saveAttempts();
  state.locked = true;
  clearInterval(timer);
  state.res = { kind: skip ? 'skip' : correct ? 'ok' : 'bad', t: elapsed, m: marks };
  drawLeft(); drawRight(); updateChip();
  track('answer', { q: state.q.id, exam: state.exam, result: skip ? 'skip' : correct ? 'correct' : 'wrong', time: elapsed });
  const fresh = badges().filter(b => b.earned && before.indexOf(b.name) < 0);
  if(fresh.length) toast('Badge unlocked: ' + fresh.map(b => b.name).join(', '));
  const next = $('#nextbtn');
  if(next) next.focus();
}

/* ---------- profile ---------- */
export function renderProfile(){
  state.planFocus = ((currentUser() && currentUser().focus) || []).slice();
  const examKey = state.exam, exam = EXAMS[examKey];
  const attempts = forExam(examKey), count = attempts.length;
  const net = sum(attempts, a => a.m);
  const estimate = estimateRank(net, count, exam.pop);
  const list = pool();
  const correct = attempts.filter(a => a.ok === true).length;
  const wrong = attempts.filter(a => a.ok === false).length;
  const accuracy = correct + wrong ? Math.round(correct / (correct + wrong) * 100) + '%' : '-';
  const average = count ? (sum(attempts, a => a.t) / count / 1000).toFixed(1) + ' s' : '-';
  const confidence = count < 5 ? 'Low' : count < 20 ? 'Medium' : 'Good';
  const whatIf = (added, marks) => formatIN(estimateRank(net + marks, count + added, exam.pop).air);
  const user = currentUser();
  const rows = exam.subjects.map(subject => {
    const group = attempts.filter(a => a.s === subject);
    if(!group.length) return `<tr><td>${subject}</td><td>0</td><td>-</td><td>-</td><td>-</td></tr>`;
    const ok = group.filter(a => a.ok === true).length;
    const bad = group.filter(a => a.ok === false).length;
    const marks = sum(group, a => a.m);
    const pace = sum(group, a => a.t / 1000 / (QBY[a.q] || { m: 1 }).m) / group.length;
    return `<tr><td>${subject}</td><td>${group.length}</td><td>${ok + bad ? Math.round(ok / (ok + bad) * 100) + '%' : '-'}</td>` +
      `<td class="${marks > 0 ? 'pos' : marks < 0 ? 'neg' : ''}">${marks > 0 ? '+' : ''}${marks}</td><td>${pace.toFixed(2)}×</td></tr>`;
  }).join('');
  const bars = ['E','M','H'].map(d => {
    const group = list.filter(q => q.d === d);
    const solved = group.filter(q => statusOf(q.id) === 's').length;
    return `<div class="r"><span class="d-${d}">${DIFFICULTY[d]}</span><span class="t"><i style="width:${group.length ? Math.round(solved / group.length * 100) : 0}%;background:var(--${({E:'easy',M:'med',H:'hard'})[d]})"></i></span><span>${solved}/${group.length}</span></div>`;
  }).join('');
  const streaks = computeStreaks(state.attempts);
  const activity = heatSVG(streaks.set);
  $('#view').innerHTML = `<div class="stack"><section class="card airhero"><span class="lab">${exam.label} · ${exam.full}</span>` +
    `<div class="airnum">${count ? '~' + formatIN(estimate.air) : '-'}</div>` +
    `<div>${count ? 'Top ' + formatTop(estimate.top) + '% of about ' + formatIN(exam.pop) + ' candidates (modelled pool)' : 'Answer your first question to get an estimate.'}</div>` +
    `<div class="conf"><span>Confidence: ${confidence} (${count} submitted)</span><span class="meter"><i style="width:${Math.round(Math.min(count / 30, 1) * 100)}%"></i></span></div></section>` +
    `<section class="card"><h3>Your plan</h3><div class="planform">` +
      `<div class="arow" style="max-width:520px">` +
        `<label>Target rank<input id="pl-target" type="text" inputmode="numeric" value="${escapeHTML(user && user.target || '')}" placeholder="e.g. 1000"></label>` +
        `<label>Daily goal<select id="pl-goal">${[5,10,20,30].map(g => `<option value="${g}"${((user && user.goal) || 10) === g ? ' selected' : ''}>${g} questions</option>`).join('')}</select></label>` +
      `</div>` +
      `<div class="afield" style="margin-top:12px"><span>Focus subjects</span><div class="achips">` +
        ['Physics','Chemistry','Maths','Biology'].map(s => `<button type="button" class="achip${state.planFocus.indexOf(s) > -1 ? ' on' : ''}" data-act="focus" data-v="${s}">${s}</button>`).join('') +
      `</div></div>` +
      `<div class="actions"><button class="btn sm" data-act="saveplan">Save plan</button><span class="hint">Used by your dashboard and recommendations.</span></div>` +
    `</div></section>` +
    `<div class="two"><section class="card"><h3>Solved</h3><div class="bars">${bars}</div><p class="insight">Counted per problem in ${exam.name}. A question counts as cleared once you have a correct answer.</p></section>` +
    `<section class="card"><h3>Your numbers</h3><div class="stats">` +
      `<div class="stat"><small>Net marks</small><b class="${net > 0 ? 'pos' : net < 0 ? 'neg' : ''}">${net > 0 ? '+' : ''}${net}</b></div>` +
      `<div class="stat"><small>Submitted</small><b>${count}</b></div><div class="stat"><small>Accuracy</small><b>${accuracy}</b></div>` +
      `<div class="stat"><small>Avg time</small><b>${average}</b></div></div></section></div>` +
    `<section class="card"><h3>Activity</h3>${activity.svg}<div class="hm"><span><b>${activity.total}</b> submissions in 26 weeks</span><span>Current streak <b>${streaks.current}d</b></span><span>Longest <b>${streaks.longest}d</b></span></div></section>` +
    `<section class="card"><h3>Badges</h3><div class="badges-grid">${badges().map(b => `<div class="badge-card${b.earned ? ' got' : ''}"><div class="bi">${b.mark}</div><b>${b.name}</b><small>${b.detail}</small></div>`).join('')}</div><p class="insight">Earned from your answers. Locked badges show what to aim for next.</p></section>` +
    `<div class="two"><section class="card"><h3>What moves your rank</h3><ul class="whatif">` +
      `<li><span>10 more correct</span><b class="pos">~${whatIf(10, 40)}</b></li><li><span>10 more wrong</span><b class="neg">~${whatIf(10, -10)}</b></li>` +
      `<li><span>10 more skipped</span><b>~${whatIf(10, 0)}</b></li></ul>` +
      `<p class="insight">Skipping costs no marks but still dilutes your average, so accuracy and attempt rate both count.</p></section>` +
    `<section class="card"><h3>By subject</h3><div class="tblwrap"><table><thead><tr><th>Subject</th><th>Done</th><th>Acc</th><th>Net</th><th>Pace</th></tr></thead><tbody>${rows}</tbody></table></div><p class="insight">Pace under 1.00× means faster than the typical student who got it right.</p></section></div>` +
    `<section class="card"><h3>Rank journey</h3>${chartSVG(examKey, attempts, exam.pop)}</section>` +
    `<div class="actions">${state.confirm
      ? `<span>Delete all your ${exam.name} submissions on this device?</span><button class="btn danger" data-act="reset-yes">Delete</button><button class="btn ghost" data-act="reset-no">Cancel</button>`
      : '<button class="btn ghost" data-act="reset">Reset my progress</button>'}</div></div>`;
}

/* ---------- dashboard ---------- */
export function renderDashboard(){
  const exam = EXAMS[state.exam];
  const attempts = forExam(state.exam);
  const level = levelInfo(state.attempts);
  const streaks = computeStreaks(state.attempts);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const user = currentUser();
  const name = user && !user.guest ? String(user.name).trim().split(/\s+/)[0] : 'there';
  const today = dayKey(Date.now());
  const todayCount = attempts.filter(a => dayKey(a.ts) === today).length;
  const goal = (user && user.goal) || 10;
  const percent = Math.min(100, Math.round(todayCount / goal * 100));
  const daily = dailyQuestion();
  const weak = recommendations(false, 3);
  const recent = attempts.slice(-5).reverse();
  const correct = attempts.filter(a => a.ok === true).length;
  const wrong = attempts.filter(a => a.ok === false).length;
  const accuracy = correct + wrong ? Math.round(correct / (correct + wrong) * 100) : 0;
  const estimate = estimateRank(sum(attempts, a => a.m), attempts.length, exam.pop);
  const target = user && user.target ? 'AIR ' + formatIN(+user.target) : 'Set a target in Profile';
  const left = Math.max(0, goal - todayCount);
  const focus = user && user.focus && user.focus.length ? user.focus.join(' · ') : exam.subjects.join(' · ');

  $('#view').innerHTML = `<section class="hero"><div class="hero-main">` +
    `<div class="hi">Field note · ${escapeHTML(exam.full)}</div><h1>${greeting}, ${escapeHTML(name)}.</h1>` +
    `<p>${escapeHTML(target)} &nbsp;·&nbsp; ${left ? left + ' questions to hit today’s goal' : 'Daily goal complete — nice work'}</p>` +
    `<div class="herogrid">` +
      `<div class="hstat"><small>Level</small><b>${level.level}</b><span>${level.current} / ${level.needed} XP</span></div>` +
      `<div class="hstat"><small>Streak</small><b>${streaks.current}d</b><span>Longest ${streaks.longest}d</span></div>` +
      `<div class="hstat"><small>Est. rank</small><b>${attempts.length ? '~' + formatIN(estimate.air) : '-'}</b><span>${attempts.length ? 'Top ' + formatTop(estimate.top) + '%' : 'Answer to begin'}</span></div>` +
    `</div></div><div class="hero-mark" aria-hidden="true"></div></section>` +
    `<div class="dgrid"><div class="dstack">` +
      `<section class="card"><h3>Today’s goal</h3><div class="goalrow">${ladderSVG(percent, percent + '%')}` +
        `<div class="goalmeta"><b>${todayCount} / ${goal} solved today</b><small>${escapeHTML(focus)}</small><small style="margin-top:6px">Keep a streak going: one answer a day counts.</small></div></div></section>` +
      `<section class="card"><h3>Today’s question</h3><div class="dtask"><div><span class="pill d-${daily.d}">${DIFFICULTY[daily.d]}</span><div class="nm">${escapeHTML(daily.t)}</div>` +
        `<p class="hint" style="margin:0">${escapeHTML(daily.tp)} · ${escapeHTML(daily.s)} · median ${daily.m} s</p></div>` +
        `<a class="btn" href="#q-${daily.id}">${statusOf(daily.id) === 's' ? 'Solve again' : 'Solve now'} →</a></div></section>` +
      `<section class="card"><h3>Focus next</h3>` +
        (weak.length ? weak.map((w, i) => `<div class="focusitem"><span class="ix">${i + 1}</span><div class="grow"><b>${escapeHTML(w.topic)}</b>` +
          `<small>${Math.round(w.accuracy * 100)}% accuracy · ${w.total} attempts · ${w.pace.toFixed(2)}× pace</small></div><a href="#q-${w.sampleId}">Review →</a></div>`).join('')
          : '<p class="empty" style="padding:14px 0">Answer a few questions to get personal recommendations.</p>') +
      `</section></div><div class="dstack">` +
      `<section class="card"><h3>Your numbers</h3><div class="stats">` +
        `<div class="stat"><small>Accuracy</small><b>${correct + wrong ? accuracy + '%' : '-'}</b></div><div class="stat"><small>Submitted</small><b>${attempts.length}</b></div>` +
        `<div class="stat"><small>Net marks</small><b>${sum(attempts, a => a.m)}</b></div><div class="stat"><small>XP earned</small><b>${level.xp}</b></div></div>` +
        `<p class="insight">${escapeHTML(exam.name)} only. Switch exams in the header to see that journey.</p></section>` +
      `<section class="card"><h3>Recent activity</h3>` +
        (recent.length ? '<ul class="minilist">' + recent.map(a => {
          const q = QBY[a.q] || {};
          const label = a.ok === true ? '<span class="pill ok">Correct</span>' : a.ok === false ? '<span class="pill bad">Wrong</span>' : '<span class="pill">Skipped</span>';
          return `<li><span class="ix">${a.m > 0 ? '+' : a.m < 0 ? '−' : '0'}</span><span class="grow">${escapeHTML(q.t || a.q)}</span>${label}<time>${(a.t / 1000).toFixed(0)}s</time></li>`;
        }).join('') + '</ul>' : '<p class="empty" style="padding:14px 0">No submissions yet. Your last five answers will show here.</p>') +
      `</section>` +
      `<section class="card"><h3>Keep going</h3><p class="insight" style="margin:0">Small, steady sessions beat last-night cramming. Your daily goal is ${goal} questions — about ${goal * 2} minutes a day.</p>` +
        `<div class="actions"><a class="btn ghost sm" href="#analytics">See my analytics</a></div></section>` +
    `</div></div>`;
  track('view', { name: 'dashboard' });
}

/* ---------- analytics ---------- */
export function exportAttemptsCSV(){
  const rows = [['question','exam','subject','topic','choice','result','time_s','marks','timestamp']];
  forExam(state.exam).forEach(a => {
    const q = QBY[a.q] || {};
    rows.push([q.t || a.q, a.e, a.s, q.tp || '', a.c < 0 ? 'skipped' : 'ABCD'[a.c], a.ok === true ? 'correct' : a.ok === false ? 'wrong' : 'skipped', (a.t / 1000).toFixed(1), a.m, new Date(a.ts).toISOString()]);
  });
  const csv = rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  download('air-ladder-attempts-' + state.exam + '.csv', csv, 'text/csv;charset=utf-8');
  track('export', { type: 'csv', exam: state.exam });
  toast('Attempts exported as CSV.');
}

export function exportDataJSON(){
  const payload = buildBackup(currentUser(), state.attempts, allEvents());
  download('air-ladder-data.json', JSON.stringify(payload, null, 2), 'application/json');
  track('export', { type: 'json' });
  toast('Full data exported as JSON.');
}

export function importDataJSON(text){
  let parsed;
  try { parsed = JSON.parse(text); }
  catch { toast('That file is not valid JSON.'); return; }
  const result = validateBackup(parsed);
  if(!result.ok){ toast('Import failed: ' + result.error); return; }
  state.attempts = result.data.attempts;
  saveAttempts();
  store.set(KEYS.events, result.data.events);
  if(result.data.user){
    const safe = { ...result.data.user };
    delete safe.pw; delete safe.salt;
    updateUser(safe);
  }
  toast('Backup restored. ' + state.attempts.length + ' attempts imported.');
  drawHeader(); rerender();
}

export function renderAnalytics(){
  const attempts = filteredAttempts();
  const exam = EXAMS[state.exam];
  const correct = attempts.filter(a => a.ok === true).length;
  const wrong = attempts.filter(a => a.ok === false).length;
  const accuracy = correct + wrong ? Math.round(correct / (correct + wrong) * 100) : 0;
  const average = attempts.length ? (sum(attempts, a => a.t) / attempts.length / 1000).toFixed(1) + ' s' : '-';
  const net = sum(attempts, a => a.m);
  const days = state.range === 'all' ? 30 : +state.range;
  const bar = (label, value, color) => `<div class="r"><span>${label}</span><span class="t"><i style="width:${value}%;background:${color}"></i></span><span class="v">${value}%</span></div>`;
  const subjects = exam.subjects.map(subject => {
    const group = attempts.filter(a => a.s === subject);
    const ok = group.filter(a => a.ok === true).length;
    const bad = group.filter(a => a.ok === false).length;
    return bar(subject + (group.length ? ` <span style="color:var(--ink-2)">(${group.length})</span>` : ''), ok + bad ? Math.round(ok / (ok + bad) * 100) : 0, 'var(--accent)');
  }).join('');
  const difficulties = ['E','M','H'].map(d => {
    const group = attempts.filter(a => { const q = QBY[a.q]; return q && q.d === d; });
    const ok = group.filter(a => a.ok === true).length;
    const bad = group.filter(a => a.ok === false).length;
    return bar(DIFFICULTY[d] + ` <span style="color:var(--ink-2)">(${group.length})</span>`, ok + bad ? Math.round(ok / (ok + bad) * 100) : 0, `var(--${({E:'easy',M:'med',H:'hard'})[d]})`);
  }).join('');
  const topicMap = new Map();
  attempts.forEach(a => {
    const q = QBY[a.q]; if(!q) return;
    const entry = topicMap.get(q.tp) || { tp: q.tp, n: 0, o: 0, t: 0 };
    entry.n++; if(a.ok === true) entry.o++; entry.t += a.t / 1000 / q.m;
    topicMap.set(q.tp, entry);
  });
  const topics = Array.from(topicMap.values()).map(v => ({ ...v, acc: Math.round(v.o / v.n * 100), pace: (v.t / v.n).toFixed(2) }))
    .sort((a, b) => a.acc - b.acc || b.n - a.n).slice(0, 8);
  const topicRows = topics.length ? topics.map(v => {
    const candidate = pool().find(q => q.tp === v.tp);
    return `<tr><td>${candidate ? `<a href="#q-${candidate.id}">${escapeHTML(v.tp)}</a>` : escapeHTML(v.tp)}</td><td class="n">${v.n}</td><td class="n">${v.acc}%</td><td class="n">${v.pace}×</td></tr>`;
  }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--ink-2);padding:20px">No attempts in this period yet.</td></tr>';
  const weak = recommendations(true, 3);
  const focus = weak.length ? weak.map((w, i) => `<div class="focusitem"><span class="ix">${i + 1}</span><div class="grow"><b>${escapeHTML(w.topic)}</b><small>${Math.round(w.accuracy * 100)}% accuracy · ${w.total} attempts · ${w.pace.toFixed(2)}× pace</small></div><a href="#q-${w.sampleId}">Practise →</a></div>`).join('')
    : '<p class="empty" style="padding:14px 0">Nothing flagged yet — answer more questions to unlock recommendations.</p>';
  const events = allEvents();
  const counts = {};
  events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
  const topEvents = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5)
    .map(k => `<li><span class="grow">${escapeHTML(k)}</span><b>${counts[k]}</b></li>`).join('') || '<li><span class="grow">No events yet</span></li>';

  $('#view').innerHTML = `<div class="anhead"><div><h2>Analytics</h2><p>${escapeHTML(exam.full)} · ${escapeHTML(state.range === 'all' ? 'all time' : 'last ' + state.range + ' days')} · ${attempts.length} attempts</p></div>` +
    `<div class="seg" role="group" aria-label="Time range">${[['7','7d'],['30','30d'],['all','All']].map(r => `<button data-act="range" data-v="${r[0]}" aria-pressed="${state.range === r[0]}">${r[1]}</button>`).join('')}</div></div>` +
    `<div class="kpis">` +
      `<div class="kpi"><small>Accuracy</small><b>${correct + wrong ? accuracy + '%' : '-'}</b><span>${correct} correct / ${wrong} wrong</span></div>` +
      `<div class="kpi"><small>Avg time</small><b>${average}</b><span>per attempt</span></div>` +
      `<div class="kpi"><small>Net marks</small><b class="${net > 0 ? 'pos' : net < 0 ? 'neg' : ''}">${net > 0 ? '+' : ''}${net}</b><span>+4 / −1 / 0</span></div>` +
      `<div class="kpi"><small>Est. rank</small><b>${attempts.length ? '~' + formatIN(estimateRank(net, attempts.length, exam.pop).air) : '-'}</b><span>modelled estimate</span></div>` +
    `</div><div class="angrid">` +
      `<section class="card"><h3>Answers over time</h3>${trendSVG(trendBuckets(attempts, days), days)}<p class="datnote">Each dot is a day with at least one answer.</p></section>` +
      `<section class="card"><h3>Where you lose marks</h3>${focus}<p class="datnote">Ranked by accuracy, then by how often you attempt the topic.</p></section>` +
      `<section class="card"><h3>By subject</h3><div class="barlist">${subjects}</div></section>` +
      `<section class="card"><h3>By difficulty</h3><div class="barlist">${difficulties}</div></section>` +
      `<section class="card" style="grid-column:1/-1"><h3>Topic breakdown</h3><div class="tblwrap"><table class="tbl"><thead><tr><th>Topic</th><th style="text-align:right">Attempts</th><th style="text-align:right">Accuracy</th><th style="text-align:right">Pace</th></tr></thead><tbody>${topicRows}</tbody></table></div><p class="datnote">Pace under 1.00× means faster than the typical student who got it right.</p></section>` +
      `<section class="card"><h3>How you use the app</h3><ul class="minilist">${topEvents}</ul><p class="datnote">${events.length} local events recorded. Nothing is sent anywhere.</p></section>` +
      `<section class="card"><h3>Your data</h3><p class="insight" style="margin:0 0 4px">Download your attempts and activity to study them in a spreadsheet, or keep a full backup.</p>` +
        `<div class="exportrow"><button class="btn sm" data-act="csv">Download CSV</button><button class="btn ghost sm" data-act="json">Download JSON</button>` +
        `<label class="btn ghost sm" for="importfile" style="cursor:pointer">Restore JSON</label><input id="importfile" type="file" accept="application/json" hidden></div>` +
        `<p class="datnote">Stored in this browser only. Clearing site data removes it.</p></section>` +
    `</div>`;
  track('view', { name: 'analytics', range: state.range });
}

/* ---------- simulated board ---------- */
function weekStart(date){
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return copy;
}
function periodFor(kind, offset){
  const now = new Date();
  if(kind === 'w'){
    const start = weekStart(now); start.setDate(start.getDate() - 7 * offset);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    return { s: start, e: end };
  }
  return { s: new Date(now.getFullYear(), now.getMonth() - offset, 1), e: new Date(now.getFullYear(), now.getMonth() - offset + 1, 1) };
}
function simulatedCohort(exam, kind, period, factor){
  const random = rng(hash32(exam + kind + period.s.toISOString().slice(0, 10)));
  const base = kind === 'w' ? 70 : 260;
  const cap = kind === 'w' ? 900 : 3400;
  const list = [];
  for(let i = 0; i < 600; i++){
    const marks = Math.min(cap, Math.max(0, Math.round(base * Math.exp(0.9 * gauss(random)) * factor)));
    list.push({ name: FN[Math.floor(random() * FN.length)] + ' ' + LN[Math.floor(random() * LN.length)] + '.', marks, acc: Math.round(55 + random() * 40), avg: Math.round(20 + random() * 50) });
  }
  list.sort((a, b) => b.marks - a.marks || (a.name < b.name ? -1 : 1));
  return list;
}
function leaderRow(rank, name, marks, accuracy, cls){
  return `<div class="row${cls ? ' ' + cls : ''}"><span class="rk">${rank}</span><span class="nmc">${name}</span><span class="mk">${marks}</span><span class="ac">${accuracy}</span></div>`;
}

export function renderContest(){
  const kind = state.period, examKey = state.exam, now = Date.now();
  const period = periodFor(kind, 0);
  const factor = Math.max(0.12, (now - period.s.getTime()) / (period.e.getTime() - period.s.getTime()));
  const simulated = simulatedCohort(examKey, kind, period, factor);
  const top = simulated[0];
  const mine = forExam(examKey).filter(a => a.ts >= period.s.getTime() && a.ts < period.e.getTime());
  const net = sum(mine, a => a.m);
  const correct = mine.filter(a => a.ok === true).length;
  const wrong = mine.filter(a => a.ok === false).length;
  const myAccuracy = (correct + wrong ? Math.round(correct / (correct + wrong) * 100) + '%' : '-') + (mine.length ? ' · ' + Math.round(sum(mine, a => a.t) / mine.length / 1000) + 's' : '');
  const remaining = period.e.getTime() - now;
  const days = Math.floor(remaining / 864e5), hours = Math.floor(remaining % 864e5 / 36e5);
  const number = Math.floor((period.s.getTime() - new Date(2026, 0, 5).getTime()) / 604800000) + 1;
  const title = kind === 'w' ? 'Week ' + number + ' board' : 'This month’s board';
  const label = kind === 'w'
    ? period.s.toLocaleDateString('en-IN',{day:'numeric',month:'short'}) + ' – ' + new Date(period.e.getTime() - 1).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
    : period.s.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
  let rows = leaderRow('Rank','Student','Marks','Acc · Avg','head');
  let rank = 0;
  const simulatedRow = (student, place) => leaderRow(place, student.name, student.marks, student.acc + '% · ' + student.avg + 's');
  if(mine.length){
    rank = simulated.filter(s => s.marks > net).length + 1;
    if(rank <= 10){
      for(let i = 0; i < 10; i++){
        if(i === rank - 1) rows += leaderRow(rank, 'You', net, myAccuracy, 'you');
        rows += simulatedRow(simulated[i], i < rank - 1 ? i + 1 : i + 2);
      }
    } else {
      for(let i = 0; i < 10; i++) rows += simulatedRow(simulated[i], i + 1);
      rows += '<div class="row gap">⋯</div>';
      rows += simulatedRow(simulated[rank - 2], rank - 1) + leaderRow(rank, 'You', net, myAccuracy, 'you');
      if(simulated[rank - 1]) rows += simulatedRow(simulated[rank - 1], rank + 1);
    }
  } else {
    for(let i = 0; i < 10; i++) rows += simulatedRow(simulated[i], i + 1);
  }
  const span = kind === 'w' ? 'week' : 'month';
  const status = mine.length
    ? `<p class="insight">You are <b>#${rank}</b> of 601 active students this ${span} with <b>${net}</b> net marks.</p>`
    : `<p class="insight">Answer a question this ${span} to appear on the board.</p>`;
  const history = (periodKind, count) => {
    let out = '';
    for(let i = 1; i <= count; i++){
      const p = periodFor(periodKind, i);
      const leader = simulatedCohort(examKey, periodKind, p, 1)[0];
      const label = periodKind === 'w' ? p.s.toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : p.s.toLocaleDateString('en-IN',{month:'short',year:'numeric'});
      out += `<li><span>${label} · ${leader.name}</span><b>${leader.marks}</b></li>`;
    }
    return out;
  };
  $('#view').innerHTML = `<div class="toolbar"><div class="seg" role="group" aria-label="Period"><button data-act="period" data-v="w" aria-pressed="${kind === 'w'}">Weekly</button><button data-act="period" data-v="m" aria-pressed="${kind === 'm'}">Monthly</button></div>` +
    `<div class="period"><b>${title}</b> · ${label} · ends in ${days ? days + 'd ' : ''}${hours}h · ${EXAMS[examKey].name}</div></div>` +
    `<section class="spot"><div><div class="crown">${kind === 'w' ? 'Top of the week' : 'Top of the month'}</div><div class="nm">${top.name}</div></div><div class="sc">${top.marks} <small>marks</small></div></section>` +
    `<section class="card lb">${rows}</section>${status}<p class="hint"><span class="sim">Simulated cohort</span> Names and scores are generated for this prototype.</p>` +
    `<div class="hist2"><section class="card"><h3>Previous weekly toppers</h3><ul class="past">${history('w', 4)}</ul></section><section class="card"><h3>Previous monthly toppers</h3><ul class="past">${history('m', 3)}</ul></section></div>`;
}

/* ---------- routing ---------- */
export function currentRoute(){ return location.hash.slice(1); }
export function setActiveTab(hash){
  document.querySelectorAll('.tabs a').forEach(link => {
    if(link.dataset.r === hash) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
export function route(){
  let hash = currentRoute();
  clearInterval(timer);
  if(hash.indexOf('q-') === 0){
    const question = QBY[hash.slice(2)];
    if(question && question.x.indexOf(state.exam) > -1){
      openQuestion(question); setActiveTab('problems'); renderProblem(); window.scrollTo(0, 0); return;
    }
    hash = 'problems';
    if(location.hash !== '#problems'){ location.hash = 'problems'; return; }
  }
  if(['dashboard','problems','analytics','contest','profile'].indexOf(hash) < 0) hash = 'dashboard';
  setActiveTab(hash);
  if(hash === 'dashboard') renderDashboard();
  else if(hash === 'problems') renderProblems();
  else if(hash === 'analytics') renderAnalytics();
  else if(hash === 'contest') renderContest();
  else renderProfile();
}
