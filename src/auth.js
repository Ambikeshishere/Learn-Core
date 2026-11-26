/**
 * Demo authentication.
 *
 * SECURITY NOTE: this is a local prototype, not production auth. Passwords are
 * salted and stretched with PBKDF2-SHA256 via Web Crypto, which is far better
 * than a plain hash, but the record still lives in the browser. A real product
 * must move identity to a server (HTTPS, Argon2id/bcrypt, sessions, rate
 * limits, email verification). See README > Security & privacy.
 */

import { store, KEYS } from './store.js';

const ITERATIONS = 120000;
const encoder = new TextEncoder();

function toHex(buffer){
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function randomSalt(){
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}
async function derive(password, salt){
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    key, 256
  );
  return toHex(bits);
}

function readAccount(){ return store.get(KEYS.user, null); }
function readSession(){ return store.get(KEYS.session, false) ? readAccount() : null; }
function emit(user){ window.dispatchEvent(new CustomEvent('ail:auth', { detail: { user } })); }

export function currentUser(){ return readSession(); }
/** The stored account even when logged out — used to avoid overwriting it with a guest. */
export function savedAccount(){ return readAccount(); }
export function initials(name){
  return String(name || 'Guest').trim().split(/\s+/).slice(0, 2)
    .map(part => part.charAt(0).toUpperCase()).join('') || 'G';
}

export async function signup(details){
  if(!details.name || details.name.trim().length < 2) return { ok: false, error: 'Please enter your name (at least 2 characters).' };
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email || '')) return { ok: false, error: 'Please enter a valid email address.' };
  if(!details.pw || details.pw.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
  if(!crypto || !crypto.subtle) return { ok: false, error: 'This browser cannot create a local account. Use a modern browser over HTTPS or localhost.' };
  const salt = randomSalt();
  const hash = await derive(details.pw, salt);
  const user = {
    id: 'u' + Date.now().toString(36),
    name: details.name.trim(),
    email: details.email.trim().toLowerCase(),
    salt, pw: hash,
    exam: details.exam || 'jee',
    grade: details.grade || '12',
    target: String(details.target || '').trim(),
    goal: +details.goal || 10,
    focus: details.focus || [],
    created: Date.now(),
    guest: false
  };
  store.set(KEYS.user, user);
  store.set(KEYS.session, true);
  emit(user);
  return { ok: true, user };
}

export async function login(email, password){
  const account = readAccount();
  if(!account || account.guest) return { ok: false, error: 'No account exists on this device yet. Create one first.' };
  if(account.email !== String(email || '').trim().toLowerCase()) return { ok: false, error: 'Email or password is incorrect.' };
  if(!crypto || !crypto.subtle) return { ok: false, error: 'This browser cannot verify a local account.' };
  const hash = await derive(password || '', account.salt || '');
  if(hash !== account.pw) return { ok: false, error: 'Email or password is incorrect.' };
  store.set(KEYS.session, true);
  emit(account);
  return { ok: true, user: account };
}

export function continueAsGuest(){
  const user = {
    id: 'guest', name: 'Guest', email: '', exam: 'jee', grade: '12',
    target: '', goal: 10, focus: [], created: Date.now(), guest: true
  };
  store.set(KEYS.user, user);
  store.set(KEYS.session, true);
  emit(user);
  return user;
}

export function logout(){
  store.remove(KEYS.session);
  emit(null);
}

export function updateUser(patch){
  const user = readAccount();
  if(!user) return null;
  Object.keys(patch).forEach(k => { user[k] = patch[k]; });
  store.set(KEYS.user, user);
  emit(user);
  return user;
}
