# Project Brief

## Project Identity

- Name: **Restu** (renamed from Wedding Vendor Tracker on 29 Oct 2026)
- Course: AI Builder Foundations (one evening: Spec, Build, Check)
- Origin: cut down from the larger "Wedding Operating System" idea to the vendor-and-budget core plus a read-only marriage procedure guide.

## One-Sentence Concept

A one-page browser app where a couple adds their wedding vendors, moves each one through the booking stages, sees the budget figures update live, and follows a simple 3-step marriage procedure guide.

## Target User

A couple planning a Malay wedding who are building it vendor by vendor instead of buying a full wedding package, and who want one calm place to take them through every step without stress.

## User Goal

On one screen, the couple can:

- add a vendor with name, category, estimated cost and amount paid;
- move a vendor through the stages: Prospecting → Quoted → Shortlisted → Deposit Paid → Final Balance Paid → Completed;
- edit or delete a vendor;
- see a top bar with days until the wedding, total budget, amount committed, amount left and vendors booked;
- turn categories on or off (for example, hide "Live Band / DJ") so they disappear from view without losing data;
- read a 3-step Marriage Procedure guide for Muslim couples with links to the official pages.

Categories (all on by default): Venue & Space; Decorator & Theme; Wedding Coordinator / Planner; Emcee & PA System; Catering; Attire (Baju Nikah, Songket, Gown, Suit); Makeup Artist & Hair; Florist & Bouquets; Door Gifts & Favors; Bridesmaids & Groomsmen; Photography & Videography; Live Band / DJ / Entertainment.

Marriage Procedure guide content (from malaysia.gov.my, "Marriage procedures for Muslim couples"):

1. **Pre-marriage course**: mandatory for the bride and groom; some exemptions depend on the couple's status and the state Islamic religious department. Apply: https://www.sppim.gov.my/v2/online/pra-kahwin
2. **Marriage application**: online or at the religious office; each state has its own procedure and forms. The religious office issues the marriage permission letter once all documents are complete; it is valid for 90 days from issue. Document checklist: https://www.sppim.gov.my/v2/online/benar-nikah-online
3. **Solemnisation (Akad Nikah)**: conducted by an authorised marriage registrar based on the permission obtained; afterwards, get the marriage certificate from the registrar or religious office.

Source page: https://www.malaysia.gov.my/en/personas/couples-planning-to-marry/merancang-perkahwinan/marriage-procedures-for-muslim-couples

The guide states no fees or timelines beyond what the source states.

## Build Shape

Browser-local tool

## Shape Confirmation

Confirmed by learner. Clue: the main action is adding vendors and changing their stage, which must still be there after refresh.

## Version-One Success

- Three made-up sample vendors are on screen on first load.
- The couple can add a vendor, change its stage, edit it and delete it.
- Budget figures (committed, paid, left) stay correct after every change.
- After a browser refresh, all vendors and settings are still there (`localStorage`).
- The procedure guide shows the 3 steps and its links open.
- Empty state and mobile layout both look right.

## Now / Later / Never

### Now

- Vendor list: add, edit, change stage, delete.
- Category on/off toggles (hide, never delete).
- Top bar: days remaining, total budget, committed, left, vendors booked.
- Wedding date and total budget settings.
- Read-only 3-step Marriage Procedure guide with official links.
- Save in browser `localStorage`.

### Later

- Publish as a web-based app online (taught in Build & Ship).
- Tick-off progress for procedure steps; state-specific forms.
- Guest list and RSVP, e-invite builder, gift / angpow registry, seating chart.
- Auto-generated checklist timeline, onboarding wizard, attachments.
- Accounts, backend, database, multi-device sync.

### Never

- Real people's names, phone numbers, IC numbers, account numbers, real balances or real vendor/company names in the app.
- Money advice, ratings, recommendations or interest calculations: figures only (sums, counts, what is left).

## Assumptions

- Currency is RM; amounts are whole ringgit.
- "Committed" = sum of estimated cost for vendors at Deposit Paid or later; "Booked" = vendors at Deposit Paid or later.
- "Left" = total budget − committed.
- One couple, one browser, one device.

## Proof Target

Add a vendor, move it to Deposit Paid, see committed and left update, hide its category, refresh the page, and everything is still as left. Procedure guide links open the official pages.

## Trainer / Learner Notes

- Learner wants to publish online someday; deferred until after the build is done.
- The procedure guide is static content only; it does not count as a second data type.

## Phase 2: Full Wedding Planner (learner-approved expansion, 29 Oct 2026)

After the four Work Cards, the learner chose to build the rest of their original "Wedding Operating System" spec, knowingly going past the KDBM Lite one-data-type and 5-field limits. Still browser-only (`localStorage`), made-up sample data only, figures only (no money advice).

Build order, one step at a time, learner tests after each:

1. **Vendor details**: payment due date, contact name, contact phone, quote/contract link (optional fields).
2. **Smart checklist**: tasks timed back from the wedding date; tasks for hidden categories are hidden; tick off; add own task.
3. **Guest list & RSVP**: name, side, status (Invited / Attending / Declined), +1 count, dietary needs, phone; couple records replies themselves.
4. **Seating chart**: tables (Round, Long Banquet, VIP) with seat limits; assign attending guests; seat-limit checks; drag-and-drop.
5. **App shell & onboarding**: sidebar navigation, quick-stats top bar (days remaining, budget used %, unassigned guests, vendors booked %), first-launch wizard (date, budget, categories).
6. **E-invite builder**: couple's names, schedule, venue + map link, dress code; on-screen preview.
7. **Gift & angpow registry**: cash gift log, couple's own QR image shown, wish list with "reserved" marking.

Still Later (needs the app online, Build & Ship): guests RSVPing or reserving gifts themselves, sharing the invite by link, real payments.
