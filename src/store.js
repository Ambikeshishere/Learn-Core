/**
 * Persistence boundary. The rest of the app never calls localStorage directly,
 * so this adapter can be replaced with an API client when a backend is added.
 */

const PREFIX = 'ail.';

export const store = {
  get(key, fallback){
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value){
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key){
    try { localStorage.removeItem(PREFIX + key); return true; }
    catch { return false; }
  }
};

export const KEYS = {
  exam: 'exam',
  attempts: 'att',
  theme: 'theme',
  user: 'user',
  session: 'session',
  events: 'events'
};

/** Build a portable backup. The password hash is deliberately excluded. */
export function buildBackup(user, attempts, events, exam, theme){
  const safeUser = {};
  if(user) Object.keys(user).forEach(k => { if(k !== 'pw' && k !== 'salt') safeUser[k] = user[k]; });
  return {
    format: 'air-ladder-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    exam,
    theme,
    user: safeUser,
    attempts,
    events
  };
}
