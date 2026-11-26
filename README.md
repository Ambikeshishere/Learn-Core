# AIR Ladder

**A practice notebook that tells a student what to study next — and shows the rank they are climbing toward.**

> Prototype status: functional local-first web app. No backend, no real student data, no official rank prediction. Built to prove the product experience and the data model before infrastructure spend.

---

## 1. The problem

Indian exam prep has two extremes:

- **Content platforms** give thousands of questions but no honest feedback loop. Students see "questions solved" and streaks, not *which misconception is costing them marks*.
- **Rank predictors** sell a number with no explanation and no study plan attached.

A 16–18 year old preparing for JEE, NEET or Class 12 boards does not need another leaderboard. They need a quiet, trustworthy answer to three questions:

1. *Where do I actually stand?*
2. *What should I practise next?*
3. *Is what I am doing working?*

## 2. The product

AIR Ladder turns every answer into three things:

| Signal | How it is computed | What the student sees |
| --- | --- | --- |
| **Estimated rank** | Shrink average marks toward a prior, map to a normal percentile over the exam's candidate pool | A modelled AIR with an explicit confidence meter |
| **Focus next** | Rank topics by accuracy, then by attempt frequency and pace | Three topics with a direct "Review →" link |
| **Progress** | XP, streaks, solved-by-difficulty, 26-week activity | A ladder rung, not a vanity donut |

Additional surfaces:

- **Dashboard** — daily goal, daily question, focus list, recent activity
- **Problems** — searchable/filterable table with status icons and difficulty pills
- **Solve view** — split description/answer layout, worked solution, attempt history, simulated speed cohort
- **Analytics** — accuracy, pace, net marks, subject/difficulty/topic breakdown, CSV + JSON export
- **Board** — weekly/monthly simulated cohort for motivation, clearly labelled as demo data
- **Profile** — editable target and daily goal, badges, rank journey chart, local reset

## 3. Design direction

The interface is a deliberate blend, not a generic dashboard:

| Influence | Share | What it contributes |
| --- | --- | --- |
| **Physics Wallah** | 50% | Warm orange energy, bold teacher-led cards, streak/daily-goal motivation, encouraging microcopy |
| **LeetCode** | 30% | Problem table, difficulty pills, status icons, split solve view, tabs and filters |
| **LinkedIn** | 10% | Profile avatar, skill-style badges, activity feed, trust signals |
| **Vercel** | 10% | Sharp borders, monochrome precision, tight grid, zero decorative chrome |

No gradients, no neon, no game-console panels. Colour is used as a marker, never as decoration.

## 4. Architecture

```
index.html                 Entry point; loads questions.js then src/main.js as a module
styles/main.css            Design system and all component styles
src/
  config.js                Exam config, seed question bank, input sanitisation
  model.js                 Pure domain logic (rank, streaks, badges, cohorts, validation)
  store.js                 Persistence boundary (localStorage adapter, API-swappable)
  auth.js                  Demo identity with salted PBKDF2 via Web Crypto
  auth-ui.js               Signup / login overlay
  events.js                Local product-event log
  state.js                 Shared state and selectors
  components.js            SVGs, toasts, downloads, typesetting
  views.js                 Screen renderers and local interactions
  main.js                  Bootstrap, routing, global event wiring
tests/model.test.js        Unit tests for pure logic
tools/serve.js             Zero-dependency static server
tools/import_questions.py  Optional JEEBench question importer
```

**Key boundary:** `model.js` has no DOM, no storage and no side effects. Every rule that matters can be tested in Node. `store.js` is the only module that touches `localStorage`, so a future API client can replace it without touching screens.

## 5. Security and privacy

- Passwords are salted and stretched with **PBKDF2-SHA256, 120,000 iterations** via Web Crypto. The password hash and salt are excluded from JSON exports.
- **This is still a prototype.** Identity lives in the browser. A production deployment must move accounts to a server with Argon2id/bcrypt, HTTPS-only sessions, rate limits, email verification and a proper password reset flow.
- All attempts and events stay on the device. Nothing is sent to an analytics server.
- External question text is escaped before rendering. Imported backups are schema-validated before they overwrite local data.
- Rank, cohorts and boards are **modelled/simulated** and labelled as such in the UI. They are not official predictions.

## 6. Run locally

```bash
npm run dev      # http://localhost:4173
npm test         # 10 unit tests
```

No build step, no dependencies, no API keys. A modern browser over `localhost` or HTTPS is required for Web Crypto.

First visit starts as a guest so the prototype is immediately explorable. Create a real local account from the avatar menu at any time.

## 7. Data model

```js
Attempt = {
  q: string,        // question id
  e: 'jee'|'neet'|'boards',
  s: string,        // subject
  c: number,        // chosen option, -1 for skipped
  ok: true|false|null,
  t: number,        // milliseconds
  m: number,        // +4 / -1 / 0
  ts: number        // epoch ms
}
```

Backups are portable JSON (`format: air-ladder-backup`, `version: 1`) and can be restored from **Analytics → Restore JSON**.

## 8. Roadmap

| Phase | Goal | Exit criterion |
| --- | --- | --- |
| **0 — Prototype** (this repo) | Prove the feedback loop and UI | Student can sign up, answer, see rank/focus, export data |
| **1 — Content** | 5,000+ vetted questions with solutions | Licensed, tagged by topic/difficulty/exam, reviewed by teachers |
| **2 — Identity & sync** | Server accounts, cross-device progress | Auth on backend, rate limits, verified email, backup restore |
| **3 — Adaptive engine** | Replace heuristic focus with a knowledge-tracing model | Offline evaluation against real attempt logs |
| **4 — Cohorts with consent** | Real peer benchmarks | Opt-in, anonymised, aggregated, no public individual profiles |
| **5 — Classroom** | Teacher dashboards and assignments | 10 pilot classrooms, retention and outcome data |

## 9. Monetisation hypotheses (to validate, not assume)

- **Freemium student plan** — unlimited practice free; deeper analytics and personalised plans paid.
- **Institutional licensing** — classroom dashboards for coaching centres and schools.
- **Content partnerships** — revenue share with vetted publishers and educators.

Do not price until phase 3 produces retention and outcome evidence.

## 10. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Rank estimate misleads | Always show confidence, sample size and "modelled estimate" label |
| Simulated data mistaken for real | Persistent "Simulated cohort" badges and footer disclosure |
| Content licensing | Keep source attribution; legal review before public/paid use of imported questions |
| Local-only data loss | Prominent JSON export and restore |
| Weak retention | Daily question, small daily goal, streak, focus list — all designed for 5-minute sessions |

## 11. Licence and attribution

- Application code: MIT.
- Seed questions: written for this prototype.
- Optional importer reads [JEEBench](https://github.com/dair-iitd/jeebench) (MIT licence, IIT Delhi DAIR group). The problems originate from JEE Advanced papers; verify republication rights before using them publicly or commercially. Imported questions retain a `src` field for credit.

---

Built as a product prototype, not a demo screen. Every number in the UI is explainable, every rule is testable, and every piece of student data is exportable.
