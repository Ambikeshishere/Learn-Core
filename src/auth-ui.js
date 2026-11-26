/** Signup / login overlay. Logic lives in auth.js; this file only renders and wires. */

import { EXAMS } from './config.js';
import { escapeHTML } from './config.js';
import { signup, login, continueAsGuest } from './auth.js';

const root = () => document.getElementById('authroot');

export function openAuth(mode = 'signup'){
  const host = root();
  if(!host) return;
  host.innerHTML = `
    <div class="authovl" role="dialog" aria-modal="true" aria-labelledby="atitle">
      <div class="authcard">
        <aside class="authside">
          <div class="abrand">AIR Ladder</div>
          <div class="acopy">
            <div class="akicker">A notebook that knows your rank</div>
            <h1>Every answer moves you up a rung.</h1>
            <p>Practice, see where you stand, and get a study plan that changes as you improve. Built for the long climb, not the daily scoreboard.</p>
          </div>
          <ul class="afeats">
            <li><span class="ai">01</span><span><b>One clear next step</b><small>Weak topics turn into a short, editable plan.</small></span></li>
            <li><span class="ai">02</span><span><b>Honest progress</b><small>Accuracy, pace and streaks — not vanity points.</small></span></li>
            <li><span class="ai">03</span><span><b>Your data stays yours</b><small>Export or erase everything at any time.</small></span></li>
          </ul>
          <div class="afoot">Prototype build · local-first · no tracking servers</div>
        </aside>
        <div class="authform">
          <div class="atabs" role="group" aria-label="Account action">
            <button type="button" data-mode="signup" aria-pressed="${mode === 'signup'}">Create account</button>
            <button type="button" data-mode="login" aria-pressed="${mode === 'login'}">Log in</button>
          </div>
          <h2 id="atitle">${mode === 'signup' ? 'Start your ladder' : 'Welcome back'}</h2>
          <p class="asub">${mode === 'signup' ? 'Two minutes to set up. No payment, no spam.' : 'Continue on this device.'}</p>
          <form id="authform" novalidate>
            ${mode === 'signup' ? `
              <label>Your name<input name="name" autocomplete="name" placeholder="e.g. Ananya Sharma" required></label>
              <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
            ` : `
              <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
            `}
            <label>Password <small>${mode === 'signup' ? '(6+ characters)' : ''}</small>
              <input name="pw" type="password" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" required>
            </label>
            ${mode === 'signup' ? `
              <div class="arow">
                <label>Exam
                  <select name="exam">${Object.keys(EXAMS).map(k => `<option value="${k}">${escapeHTML(EXAMS[k].full)}</option>`).join('')}</select>
                </label>
                <label>Class
                  <select name="grade"><option>11</option><option selected>12</option><option>Dropper</option></select>
                </label>
              </div>
              <label>Target <small>(optional)</small><input name="target" placeholder="e.g. IIT Bombay, AIIMS Delhi"></label>
              <div class="afield"><span>Subjects to focus on</span>
                <div class="achips" id="focuschips">
                  ${['Physics','Chemistry','Maths','Biology'].map(s => `<button type="button" class="achip" data-focus="${s}">${s}</button>`).join('')}
                </div>
              </div>
            ` : ''}
            <div class="aerr" id="aerr" role="alert"></div>
            <button class="btn abtn" type="submit" id="asubmit">${mode === 'signup' ? 'Create my account' : 'Log in'}</button>
          </form>
          <p class="aswitch">${mode === 'signup'
            ? 'Already have an account? <button type="button" data-mode="login">Log in</button>'
            : 'New here? <button type="button" data-mode="signup">Create an account</button>'}</p>
          <button class="aguest" type="button" id="aguest">Continue without an account →</button>
        </div>
      </div>
    </div>`;
  document.body.classList.add('authopen');

  const form = document.getElementById('authform');
  const err = document.getElementById('aerr');
  const submit = document.getElementById('asubmit');
  const focus = new Set();

  host.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => openAuth(btn.dataset.mode)));
  host.querySelectorAll('[data-focus]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.focus;
    if(focus.has(key)){ focus.delete(key); btn.classList.remove('on'); }
    else { focus.add(key); btn.classList.add('on'); }
  }));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    err.textContent = '';
    submit.disabled = true;
    submit.textContent = 'One moment…';
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const result = mode === 'signup'
        ? await signup({ ...data, focus: Array.from(focus) })
        : await login(data.email, data.pw);
      if(!result.ok){ err.textContent = result.error; return; }
      closeAuth();
    } catch(e){
      err.textContent = 'Something went wrong. Please try again.';
    } finally {
      submit.disabled = false;
      submit.textContent = mode === 'signup' ? 'Create my account' : 'Log in';
    }
  });

  document.getElementById('aguest').addEventListener('click', () => {
    continueAsGuest();
    closeAuth();
  });

  const first = form.querySelector('input');
  if(first) first.focus();
}

export function closeAuth(){
  const host = root();
  if(host) host.innerHTML = '';
  document.body.classList.remove('authopen');
}
