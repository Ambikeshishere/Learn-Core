# Changelog

## 0.2.0 — Investor-grade prototype foundation

- Refactored the single-file app into ES modules with a pure, unit-tested domain layer.
- Added a persistence boundary so localStorage can be replaced by a future API client.
- Upgraded demo accounts to salted PBKDF2-SHA256 via Web Crypto; password hashes are excluded from exports.
- Added validated JSON backup restore alongside CSV/JSON export.
- Rebuilt the visual system as a deliberate blend: 50% Physics Wallah, 30% LeetCode, 10% LinkedIn, 10% Vercel.
- Added a zero-dependency local server, npm scripts, 10 unit tests and a product-grade README.
- Added a skip link, focus styles and reduced-motion support.

## 0.1.0 — First working prototype

- Dashboard, problems, solve view, analytics, board and profile screens.
- Local accounts, streaks, XP, badges, modelled rank and simulated cohorts.
- Paper-and-ink study-ledger visual identity.
