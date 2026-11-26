/** Local product-event log. Swap this module for a real analytics client later. */

import { store, KEYS } from './store.js';

const MAX_EVENTS = 2000;

export function track(type, props = {}){
  const events = store.get(KEYS.events, []);
  events.push({ type, props, ts: Date.now() });
  store.set(KEYS.events, events.slice(-MAX_EVENTS));
}

export function allEvents(){ return store.get(KEYS.events, []); }
export function clearEvents(){ store.set(KEYS.events, []); }
