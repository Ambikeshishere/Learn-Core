/** Shared application state and small selectors. */

import { EXAMS, buildQuestionBank } from './config.js';
import { store, KEYS } from './store.js';
import { currentUser } from './auth.js';

export const QUESTIONS = buildQuestionBank(window.EXTRA_QUESTIONS);
export const QBY = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

export const state = {
  exam: store.get(KEYS.exam, 'jee'),
  attempts: store.get(KEYS.attempts, []),
  user: currentUser(),
  q: null,
  sel: -1,
  locked: false,
  t0: 0,
  res: null,
  tab: 'desc',
  confirm: false,
  period: 'w',
  range: '30',
  planFocus: [],
  filters: { text: '', diff: '', status: '', subj: '' },
  timer: null
};

if(!EXAMS[state.exam]) state.exam = 'jee';
if(!Array.isArray(state.attempts)) state.attempts = [];
if(state.user && EXAMS[state.user.exam]) state.exam = state.user.exam;
state.planFocus = (state.user && state.user.focus || []).slice();

export function pool(){ return QUESTIONS.filter(q => q.x.indexOf(state.exam) > -1); }
export function forExam(exam){ return state.attempts.filter(a => a.e === exam); }
export function statusOf(id){
  const attempts = forExam(state.exam).filter(a => a.q === id);
  if(attempts.some(a => a.ok === true)) return 's';
  return attempts.length ? 't' : '';
}
export function filteredAttempts(){
  const attempts = forExam(state.exam);
  if(state.range === 'all') return attempts;
  const cutoff = Date.now() - (+state.range || 30) * 864e5;
  return attempts.filter(a => a.ts >= cutoff);
}
export function saveAttempts(){ store.set(KEYS.attempts, state.attempts); }
