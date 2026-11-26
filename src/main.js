/** Bootstrap and global event wiring for the AIR Ladder prototype. */

import { EXAMS } from './config.js';
import { store, KEYS } from './store.js';
import { currentUser, continueAsGuest, updateUser } from './auth.js';
import { track } from './events.js';
import { toast, typeset } from './components.js';
import { state, pool, statusOf } from './state.js';
import {
  setRerender, drawHeader, updateChip, route, drawRows, drawLeft,
  renderAnalytics, renderContest, renderProfile, pick, lockAnswer,
  nextId, importDataJSON, exportAttemptsCSV, exportDataJSON
} from './views.js';

const $ = selector => document.querySelector(selector);

setRerender(() => { drawHeader(); route(); });

/* Exam switcher */
$('#examseg').addEventListener('click', event => {
  const button = event.target.closest('button[data-exam]');
  if(!button) return;
  state.exam = button.dataset.exam;
  store.set(KEYS.exam, state.exam);
  state.confirm = false;
  state.filters.subj = '';
  const user = currentUser();
  if(user && !user.guest) updateUser({ exam: state.exam });
  track('exam_switch', { to: state.exam });
  drawHeader(); route();
});

/* Delegated actions inside the main view */
$('#view').addEventListener('click', event => {
  const button = event.target.closest('[data-act]');
  if(!button) return;
  const action = button.dataset.act;
  if(action === 'pick') pick(+button.dataset.i);
  else if(action === 'lock') lockAnswer(false);
  else if(action === 'skip') lockAnswer(true);
  else if(action === 'tab'){ state.tab = button.dataset.v; drawLeft(); }
  else if(action === 'random'){
    const questions = pool();
    const unsolved = questions.filter(q => statusOf(q.id) !== 's');
    const choices = unsolved.length ? unsolved : questions;
    location.hash = 'q-' + choices[Math.floor(Math.random() * choices.length)].id;
  }
  else if(action === 'period'){ state.period = button.dataset.v; renderContest(); }
  else if(action === 'range'){ state.range = button.dataset.v; renderAnalytics(); }
  else if(action === 'focus'){
    const subject = button.dataset.v;
    const index = state.planFocus.indexOf(subject);
    if(index > -1) state.planFocus.splice(index, 1);
    else state.planFocus.push(subject);
    button.classList.toggle('on', index < 0);
  }
  else if(action === 'saveplan'){
    if(!currentUser()){ toast('Create an account to save a plan.'); return; }
    const goal = +$('#pl-goal').value;
    updateUser({ target: $('#pl-target').value.trim(), goal, focus: state.planFocus.slice() });
    track('plan_update', { goal, focus: state.planFocus.length });
    toast('Plan saved.');
  }
  else if(action === 'csv') exportAttemptsCSV();
  else if(action === 'json') exportDataJSON();
  else if(action === 'reset'){ state.confirm = true; renderProfile(); }
  else if(action === 'reset-no'){ state.confirm = false; renderProfile(); }
  else if(action === 'reset-yes'){
    state.attempts = state.attempts.filter(a => a.e !== state.exam);
    store.set(KEYS.attempts, state.attempts);
    state.confirm = false;
    updateChip(); renderProfile();
  }
});

/* Filters and backup restore */
$('#view').addEventListener('input', event => {
  if(event.target.id === 'fq'){ state.filters.text = event.target.value; drawRows(); }
});
$('#view').addEventListener('change', event => {
  const id = event.target.id;
  if(id === 'fd') state.filters.diff = event.target.value;
  else if(id === 'fst') state.filters.status = event.target.value;
  else if(id === 'fsub') state.filters.subj = event.target.value;
  else if(id === 'importfile'){
    const file = event.target.files && event.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = () => importDataJSON(String(reader.result));
      reader.readAsText(file);
    }
    return;
  } else return;
  drawRows();
});

/* Keyboard shortcuts on a question */
document.addEventListener('keydown', event => {
  if(location.hash.slice(1).indexOf('q-') !== 0 || event.metaKey || event.ctrlKey || event.altKey || !state.q) return;
  const key = event.key.toLowerCase();
  let index = -1;
  if(key.length === 1){ index = 'abcd'.indexOf(key); if(index < 0) index = '1234'.indexOf(key); }
  if(index > -1 && !state.locked){ pick(index); return; }
  if(event.key === 'Enter' && event.target.tagName !== 'BUTTON' && event.target.tagName !== 'A'){
    if(state.locked) location.hash = 'q-' + nextId(); else lockAnswer(false);
  }
});

/* Auth changes */
window.addEventListener('ail:auth', event => {
  const user = event.detail.user || null;
  state.user = user;
  if(user && EXAMS[user.exam]) state.exam = user.exam;
  state.planFocus = (user && user.focus || []).slice();
  drawHeader(); route();
});

window.addEventListener('hashchange', route);
window.addEventListener('load', () => typeset($('#view')));

/* First visit starts as a guest so the prototype is immediately explorable.
   A real account can be created at any time from the avatar menu. */
if(!currentUser()) continueAsGuest();
drawHeader(); route();
