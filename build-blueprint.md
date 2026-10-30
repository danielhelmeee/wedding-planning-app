# Build Blueprint

## Source Files

- `project-brief.md`: identity, user, scope, proof target
- `architecture.md`: stack, components, data model, figures, storage
- `design.md`: Modern Editorial Luxe style, layout, components, mobile, accessibility, Visual recipe

If this blueprint and a source file disagree, the source file wins; `design.md`'s `## Visual recipe` wins on how the page looks.

## Project Identity

- Name: **Wedding Vendor Tracker** (`package.json` name: `wedding-vendor-tracker`)
- Purpose line: "Every vendor, every ringgit, one calm page."
- For: a couple planning a Malay wedding vendor by vendor instead of a full package.

## Build Shape

Browser-local tool. One data type: vendor. Settings (wedding date, total budget, hidden categories) are configuration. The Marriage Procedure guide is static content.

## Version-One Promise

On one page the couple sees three sample vendors and the budget figures, can add, change the stage of, edit and delete vendors, hide or show categories, set the wedding date and budget, read the 3-step marriage procedure guide with official links, and finds everything unchanged after a browser refresh.

## Scope Lock

### Now

- Vendor list: add, edit, change stage, delete
- 12 category on/off toggles (hide, never delete)
- Hero + figures: left in budget, committed, total budget, vendors booked, days remaining
- Wedding date and total budget settings
- Read-only 3-step Marriage Procedure guide with official links
- `localStorage` persistence, empty state, phone width

### Later

- Publish online as a web app (Build & Ship)
- Vendor notes; procedure step tick-off; state-specific forms
- Guest list / RSVP, e-invite, gift / angpow registry, seating chart, checklist timeline, onboarding wizard, attachments
- Accounts, backend, database, multi-device sync

### Never

- Real people's names, phone numbers, IC numbers, account numbers, real balances, real vendor or company names
- Money advice, ratings, recommendations or interest calculations

## Architecture Summary

Vite + React + plain CSS, in this project folder beside `START_HERE.md`. `App` owns `vendors` and `settings` state; `storage.js` is the only file that touches `localStorage`. Components: `StatsBar` (hero), `VendorForm`, `VendorList`, `VendorCard`, `SettingsPanel`, `ProcedureGuide`. Static data in `src/data/`.

## Data / State / Storage Rules

Vendor: `{ id, name, category, stage, estimatedCost, amountPaid }`. Amounts are whole RM numbers.

Settings: `{ weddingDate, totalBudget, hiddenCategories }`.

Categories (id → label, in order): `venue` Venue & Space; `decor` Decorator & Theme; `planner` Wedding Coordinator / Planner; `emcee` Emcee & PA System; `catering` Catering; `attire` Attire (Baju Nikah, Songket, Gown, Suit); `mua` Makeup Artist & Hair; `florist` Florist & Bouquets; `doorgifts` Door Gifts & Favors; `bridal-party` Bridesmaids & Groomsmen; `photo` Photography & Videography; `entertainment` Live Band / DJ / Entertainment.

Stages (step 1 to 6): `prospecting` Prospecting; `quoted` Quoted; `shortlisted` Shortlisted; `deposit` Deposit Paid; `final` Final Balance Paid; `completed` Completed.

Sample vendors (made up, seeded only when `wvt.vendors` is missing):

| name | category | stage | estimatedCost | amountPaid |
|---|---|---|---|---|
| Sample Dewan Seri Kenanga | venue | deposit | 15000 | 5000 |
| Sample Katering Rasa Kampung | catering | quoted | 18000 | 0 |
| Sample Studio Lensa Cahaya | photo | final | 6500 | 6500 |

Sample settings (seeded only when `wvt.settings` is missing): `weddingDate: "2027-06-12"`, `totalBudget: 60000`, `hiddenCategories: []`.

Figures, counting only vendors in enabled categories:

- Committed = sum of `estimatedCost` at stage `deposit`, `final` or `completed` → sample **RM 21,500**
- Left in budget = `totalBudget` − committed → sample **RM 38,500** (hero figure; may go negative, shown as `−RM 1,200`)
- Paid so far = sum of `amountPaid` → sample **RM 11,500**
- Vendors booked = count at `deposit` or later, of all visible → sample **2 of 3**
- Days remaining = whole days from today to `weddingDate` → **226** on 29 Oct 2026; blank if no date; "Wedding day has passed" if negative
- Hero bar: each enabled category's committed amount as a share of `totalBudget` → sample venue 15,000 (25%), photo 6,500 (≈10.8%), rest unused
- Row step bar: stage step of 6 (e.g. Deposit Paid = 4 of 6, "2 left"); Completed = "Completed", muted, full grey bar

Storage: keys `wvt.vendors` and `wvt.settings`; read on load, write on every change; broken JSON falls back to sample data instead of crashing. Hiding a category only edits `hiddenCategories`.

Figures only: no advice, ratings, recommendations or interest.

## Design Direction Summary

Borrow from the learner's "Modern Editorial Luxe" brief: linen canvas `#FAF8F5`, white surfaces for hero and vendor list only, charcoal `#1C1E21` and ash `#6E7178` text, champagne gold `#C5A059` for fills and `#8C6D2F` for gold text, emerald / ochre / terracotta stage marks, Cormorant Garamond headings and figures, Plus Jakarta Sans with tabular numbers for the rest, 1px hairlines, 16px corners, serene whitespace.

Do not copy any magazine or SaaS brand, logo, layout or photography; no real vendors or couples. Hairline borders only, no border + shadow together, no pills, no emoji, no gradients. Full rules in `design.md`.

## Implementation Rules

- Plain CSS in `src/styles.css` with the tokens from `design.md` as CSS custom properties.
- Google Fonts `<link>` in `index.html` (Cormorant Garamond 500/600, Plus Jakarta Sans 400/500/600, `display=swap`) with system fallbacks.
- No new npm libraries beyond what Vite's React template installs.
- Money formatted with a single helper: `RM 12,500`.
- Figures computed in one place (a small `src/figures.js` or inside `App`) from state, never typed in.
- Procedure guide text comes from `src/data/procedureSteps.js`, faithful to the source in `project-brief.md`.
- External links: `target="_blank" rel="noopener noreferrer"`.

## File and Folder Expectations

```text
(project folder, beside START_HERE.md)
index.html
package.json
vite.config.js
src/main.jsx
src/App.jsx
src/styles.css
src/storage.js
src/figures.js
src/components/StatsBar.jsx
src/components/VendorForm.jsx
src/components/VendorList.jsx
src/components/VendorCard.jsx
src/components/SettingsPanel.jsx
src/components/ProcedureGuide.jsx
src/data/categories.js
src/data/stages.js
src/data/sampleVendors.js
src/data/procedureSteps.js
```

Planning files, `prompts/`, `templates/` and `work-cards/` are never deleted or overwritten.

## Work Card Plan

1. **01 Project skeleton**: Vite + React app in this folder; header "Wedding Vendor Tracker" with its purpose line.
2. **02 First visible version**: full layout per the Visual recipe with the three sample vendors, hero figures, settings and procedure guide on screen; nothing interactive yet.
3. **03 Core behaviour**: add, change stage, edit, delete vendors; category toggles; date and budget inputs; all figures update; in memory only.
4. **04 Save or polish**: `localStorage` save and refresh proof, empty state, phone width, final design check.

## Review Mirror

Optional tonight: `prompts/07-review-mirror.md`, not a work card.

## Proof Ladder

The app running on localhost, improved your way. No GitHub or Vercel.

## 60-Second Explanation Template

"I built **Wedding Vendor Tracker** for a couple planning a Malay wedding vendor by vendor. They add each vendor, move it from Prospecting to Completed, and the page shows how much of the budget is committed and how much is left. They can hide categories they don't need, and there's a 3-step marriage procedure guide with the official links. It's a React app that saves in the browser, so it's still there after a refresh. Next I'd like to [one Later item]."

## Guardrails for the Coding Agent

- Read `build-status.md`, `build-blueprint.md`, and the current work card before editing.
- Implement only the current work card.
- Do not jump ahead.
- Stop after verification.
- Update `build-status.md` after each work card.
- Do not add backend/auth/database/API unless the blueprint explicitly allows it (it does not).
- Do not add secrets or keys to code.
- Do not invent claims, testimonials, logos, or real numbers.
- Apply the browser-local tool guardrails: one data type, add / update / delete, `localStorage`, refresh proof, empty state, mobile.
- No action the brief does not have (no pay, book, share, send or apply buttons); "Add vendor" is the one primary action and the hero figure is the most prominent thing.
- Money brief: work out and show figures only (sums, counts, what is left); never advise, rate or recommend, and never work out interest.
- If a legacy file uses `Build Mode`, treat it as `Build Shape` without stopping.
- Never run a scaffolder with `--overwrite` or choose "Remove existing files".
