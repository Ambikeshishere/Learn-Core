/** Small presentational helpers: charts, SVGs, toasts and file downloads. */

import { escapeHTML } from './config.js';
import { dayKey, formatIN, estimateRank, cohortFor } from './model.js';

export function ladderSVG(pct, label){
  const rungs = 10;
  const filled = Math.max(0, Math.min(rungs, Math.round(pct / 100 * rungs)));
  let out = '<line class="rail" x1="8" y1="4" x2="8" y2="98"/><line class="rail" x1="66" y1="4" x2="66" y2="98"/>';
  for(let i = 0; i < rungs; i++) out += `<rect class="${i < filled ? 'on' : 'off'}" x="10" y="${8 + i * 9}" width="54" height="4" rx="1"/>`;
  out += `<text x="37" y="113" text-anchor="middle">${escapeHTML(label)}</text>`;
  return `<svg class="ladder" viewBox="0 0 74 118" role="img" aria-label="${pct}% of goal">${out}</svg>`;
}

export function toast(message){
  const old = document.querySelector('.toast');
  if(old) old.remove();
  const node = document.createElement('div');
  node.className = 'toast';
  node.setAttribute('role', 'status');
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => { if(node.parentNode) node.remove(); }, 2800);
}

export function download(name, text, type){
  try {
    const blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = name;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch { toast('Download is not available in this browser.'); }
}

export function typeset(element){
  try {
    if(element && window.renderMathInElement) window.renderMathInElement(element, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
      throwOnError: false
    });
  } catch { /* KaTeX is optional; plain text remains readable. */ }
}

/** Answers per day, oldest bucket first. */
export function trendSVG(buckets, days){
  const W = 620, H = 190, pl = 34, pr = 12, pt = 12, pb = 26;
  const max = Math.max(1, ...buckets.map(b => b.count));
  const X = i => pl + (i / (days - 1)) * (W - pl - pr);
  const Y = v => pt + (1 - v / max) * (H - pt - pb);
  const line = buckets.map((b, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(b.count).toFixed(1)).join(' ');
  const area = line + ` L${X(days - 1).toFixed(1)} ${H - pb} L${X(0).toFixed(1)} ${H - pb} Z`;
  let grid = '';
  [0, Math.ceil(max / 2), max].forEach(v => {
    const y = Y(v);
    grid += `<line class="gl" x1="${pl}" x2="${W - pr}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text x="${pl - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end">${v}</text>`;
  });
  const ticks = [0, Math.floor((days - 1) / 2), days - 1].map(i =>
    `<text x="${X(i).toFixed(1)}" y="${H - 7}" text-anchor="${i === 0 ? 'start' : i === days - 1 ? 'end' : 'middle'}">${buckets[i].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</text>`
  ).join('');
  const dots = buckets.map((b, i) => b.count ? `<circle class="dot" cx="${X(i).toFixed(1)}" cy="${Y(b.count).toFixed(1)}" r="3"/>` : '').join('');
  return `<svg class="trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="Answers per day">${grid}<path class="area" d="${area}"/><path class="ln" d="${line}"/>${dots}${ticks}</svg>`;
}

/** Solve-time histogram with the user's time highlighted. */
export function histSVG(question, seconds){
  const cohort = cohortFor(question);
  const bins = 16;
  const maxT = Math.max(cohort.times[776], seconds * 1.05);
  const width = maxT / bins;
  const counts = new Array(bins).fill(0);
  cohort.times.forEach(t => { counts[Math.min(bins - 1, Math.floor(t / width))]++; });
  const maxCount = Math.max(...counts);
  const mine = Math.min(bins - 1, Math.floor(seconds / width));
  let out = '';
  for(let i = 0; i < bins; i++){
    const h = Math.max(2, counts[i] / maxCount * 64);
    out += `<rect class="${i === mine ? 'me' : 'b'}" x="${i * 20 + 1}" y="${(86 - h).toFixed(1)}" width="18" height="${h.toFixed(1)}" rx="2"/>`;
  }
  const labelY = (86 - Math.max(2, counts[mine] / maxCount * 64) - 4).toFixed(1);
  out += `<text x="${mine * 20 + 10}" y="${labelY}" text-anchor="middle">You</text>`;
  const medianX = question.m / width * 20;
  if(medianX > 0 && medianX < 320) out += `<line x1="${medianX.toFixed(1)}" x2="${medianX.toFixed(1)}" y1="14" y2="88"/>`;
  out += `<text x="0" y="104">0 s</text><text x="160" y="104" text-anchor="middle">${Math.round(maxT / 2)} s</text><text x="320" y="104" text-anchor="end">${Math.round(maxT)} s</text>`;
  return `<svg class="hist" viewBox="0 0 320 110" role="img" aria-label="Solve times of other students. Your time is highlighted. Dashed line marks the median.">${out}</svg>`;
}

/** Estimated rank after each answer, on a log scale. */
export function chartSVG(examKey, attempts, population){
  if(!attempts.length) return '<p class="empty">Answer a few questions to start your rank journey.</p>';
  const W = 640, H = 230, pl = 64, pr = 16, pt = 14, pb = 30;
  let net = 0;
  const points = [{ n: 0, air: estimateRank(0, 0, population).air }];
  attempts.forEach((a, i) => {
    net += a.m;
    points.push({ n: i + 1, air: estimateRank(net, i + 1, population).air });
  });
  const N = points.length - 1;
  const lo = Math.log10(100), hi = Math.log10(population);
  const X = n => pl + (n / N) * (W - pl - pr);
  const Y = v => pt + (Math.log10(Math.max(100, v)) - lo) / (hi - lo) * (H - pt - pb);
  let grid = '';
  [100, 1000, 10000, 100000, 1000000].filter(v => v <= population).forEach(v => {
    grid += `<line class="gl" x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text x="${pl - 8}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end">${formatIN(v)}</text>`;
  });
  const line = points.map((p, i) => (i ? 'L' : 'M') + X(p.n).toFixed(1) + ' ' + Y(p.air).toFixed(1)).join(' ');
  const base = H - pb;
  const area = `${line} L${X(N).toFixed(1)} ${base} L${X(0).toFixed(1)} ${base} Z`;
  const last = points[N];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Estimated rank after each submission. Lower is better.">${grid}` +
    `<path class="area" d="${area}"/><path class="ln" d="${line}"/><circle class="dot" cx="${X(N).toFixed(1)}" cy="${Y(last.air).toFixed(1)}" r="5"/>` +
    `<text class="lbl" x="${(X(N) - 10).toFixed(1)}" y="${(Y(last.air) - 10).toFixed(1)}" text-anchor="end">${formatIN(last.air)}</text>` +
    `<text x="${pl}" y="${H - 8}">0</text><text x="${W - pr}" y="${H - 8}" text-anchor="end">${N} submissions</text></svg>`;
}

/** 26-week activity grid. */
export function heatSVG(counts){
  const weeks = 26;
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - ((today.getDay() + 6) % 7) - 7 * (weeks - 1));
  let out = '', total = 0;
  for(let i = 0; i < weeks * 7; i++){
    const d = new Date(start); d.setDate(start.getDate() + i);
    if(d > today) break;
    const count = counts[dayKey(d)] || 0;
    const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
    total += count;
    out += `<rect class="h${level}" x="${Math.floor(i / 7) * 14}" y="${(i % 7) * 14}" width="11" height="11" rx="2"><title>${count} submissions on ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</title></rect>`;
  }
  return { total, svg: `<svg class="heat" viewBox="0 0 ${weeks * 14 - 3} 95" role="img" aria-label="Submission activity over the last 26 weeks">${out}</svg>` };
}
