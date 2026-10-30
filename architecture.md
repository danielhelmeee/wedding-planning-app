# Architecture

## Build Shape

Browser-local tool. One data type: **vendor**. The Marriage Procedure guide is static content inside the app, not data.

## Stack Decision

- Vite + React
- Plain CSS (one stylesheet, CSS custom properties for colours and spacing)
- `localStorage` for persistence
- No backend, auth, database, payments or live API

## Structure Overview

One page, three areas:

1. **Top bar**: days until the wedding, total budget, committed, left, vendors booked.
2. **Vendors**: add form + vendor list grouped or filterable by category, each row with stage control, edit and delete.
3. **Side panels / sections**: Settings (wedding date, total budget, category on/off toggles) and the read-only Marriage Procedure guide.

## Component Map

- `App`: owns state (vendors, settings), loads and saves `localStorage`.
- `StatsBar`: shows the five figures, computed from state.
- `VendorForm`: add a vendor; reused for edit.
- `VendorList`: shows vendors whose category is enabled; empty state when none.
- `VendorCard`: one vendor; stage select, edit, delete.
- `SettingsPanel`: wedding date, total budget, 12 category toggles.
- `ProcedureGuide`: static 3-step guide with official links.

## Data / State Model

```js
// Vendor (5 fields + id)
{
  id: "v_1730000000000",          // created by the app
  name: "Sample Dewan Seri Kenanga", // made-up sample name
  category: "venue",              // one of 12 category ids
  stage: "quoted",                // one of 6 stage ids
  estimatedCost: 15000,           // RM, whole number
  amountPaid: 0                   // RM, whole number
}

// Settings
{
  weddingDate: "2027-06-12",      // ISO date, may be empty
  totalBudget: 60000,             // RM
  hiddenCategories: ["entertainment"] // category ids switched off
}
```

Categories (id → label): `venue` Venue & Space; `decor` Decorator & Theme; `planner` Wedding Coordinator / Planner; `emcee` Emcee & PA System; `catering` Catering; `attire` Attire (Baju Nikah, Songket, Gown, Suit); `mua` Makeup Artist & Hair; `florist` Florist & Bouquets; `doorgifts` Door Gifts & Favors; `bridal-party` Bridesmaids & Groomsmen; `photo` Photography & Videography; `entertainment` Live Band / DJ / Entertainment.

Stages (in order): `prospecting` Prospecting; `quoted` Quoted; `shortlisted` Shortlisted; `deposit` Deposit Paid; `final` Final Balance Paid; `completed` Completed.

### Figures (shown only for enabled categories)

- **Days remaining** = whole days from today to `weddingDate` (blank if no date).
- **Total budget** = `settings.totalBudget`.
- **Committed** = sum of `estimatedCost` for vendors at Deposit Paid, Final Balance Paid or Completed.
- **Paid so far** = sum of `amountPaid` (shown on the vendor list summary).
- **Left** = total budget − committed.
- **Vendors booked** = count of vendors at Deposit Paid or later / count of all visible vendors.

Figures only: no advice, ratings, recommendations or interest.

## Storage Logic

- Keys: `wvt.vendors` (array of vendors) and `wvt.settings` (settings object).
- On load: read both keys; if `wvt.vendors` is missing, seed three made-up sample vendors; if `wvt.settings` is missing, seed sample settings (wedding date 2027-06-12, total budget RM 60,000, nothing hidden).
- On every change: write the changed key back.
- Hiding a category only changes `hiddenCategories`; vendors in it stay saved and reappear when switched back on.
- If stored JSON is broken, fall back to defaults instead of crashing.

## User Flow

1. Open app → see sample vendors, top bar figures, settings and guide.
2. Set wedding date and total budget → top bar updates.
3. Add a vendor → it appears in the list; figures update.
4. Change its stage → booked count, committed and left update.
5. Edit or delete it → list and figures update.
6. Switch a category off → its vendors and their figures disappear; switch on → they return.
7. Refresh → everything is as left.
8. Read the procedure guide; links open the official pages in a new tab.

Empty state: when no visible vendors, show a friendly line and point to the add form.

## File Expectations

The app lives in this project folder, beside `START_HERE.md`:

- `index.html`, `package.json`, `vite.config.js`
- `src/main.jsx`, `src/App.jsx`, `src/styles.css`
- `src/components/*.jsx` (components above)
- `src/data/categories.js`, `src/data/stages.js`, `src/data/sampleVendors.js`, `src/data/procedureSteps.js`
- `src/storage.js` (load/save helpers, the only place that touches `localStorage`, so a backend can replace it later)

## Constraints

- One data type only (vendors); settings are configuration.
- Made-up sample data only: no real names, phone numbers, IC numbers, account numbers, real vendors or real prices.
- Procedure guide text stays faithful to the malaysia.gov.my source; no invented fees or timelines.
- Works on a phone-width screen.

## Technical Non-Goals

- Guest list, RSVP, e-invite, gift / angpow registry, seating chart
- Onboarding wizard, uploads, attachments, notes
- Login, backend, database, IndexedDB, multi-device sync
- Publishing online (Later, after the build is done)

## Verification Notes

- Add, change stage, edit and delete a vendor; check figures each time.
- Hide and show a category; check its vendors and figures hide and return.
- Refresh after each; data remains.
- Delete all vendors → empty state shows.
- Check at phone width (~375px).
- Click both SPPIM links and the source link.

## Phase 2 Architecture (learner-approved expansion)

- Same stack: Vite + React + plain CSS, no new libraries (drag-and-drop uses native HTML5 drag events).
- Navigation: sidebar with sections (Dashboard, Vendors, Checklist, Guests, Seating, E-invite, Gifts, Settings) using React state + URL hash; no router library.
- `WeddingAppState` = `{ settings, vendors, tasks, guests, tables, invite, gifts }`, each saved under its own key: `wvt.settings`, `wvt.vendors`, `wvt.tasks`, `wvt.guests`, `wvt.tables`, `wvt.invite`, `wvt.gifts`. `storage.js` stays the only file touching `localStorage`.
- Vendor gains optional fields: `dueDate` (ISO date), `contactName`, `contactPhone`, `link` (only `http(s)` links are rendered as links).
- Hidden categories hide their vendors, checklist tasks and budget figures everywhere; data is kept.
- New sample data stays made up (names start with "Sample" or are clearly fictional; no real phone numbers).

### Phase 2 update: sidebar, events and auto-fill (29 Oct 2026)

- **Categories (16):** Venue & Khemah · Pelamin & Decor · Wedding Planner · Emcee & PA System · Catering & Desserts · Attire (Baju Nikah, Songket, Gown, Suit) · Mak Andam / MUA & Hair · Florist & Bouquets · Hantaran & Gubahan · Door Gifts & Bunga Telur · Inai / Henna Artist · Pengapit & Bridal Party · Photography & Videography · Entertainment (Band, DJ, Kompang, Silat) · Wedding Car & Transport · Kad Kahwin / Printed Cards. Each has default events (`src/data/categories.js`). Old ids are kept, so earlier saves still match.
- **Events:** `akad` Akad Nikah, `sanding` Sanding, `reception` Reception (`src/data/events.js`). Settings hold `events: { akad: { on, date }, … }`, replacing `weddingDate` (older saves: `weddingDate` becomes the Akad Nikah date).
- **Vendor fields now:** `id, name, category, events[], stage, estimatedCost, amountPaid, dueDate, contactName, phone, email, instagram, facebook, tiktok, website, link, notes`. Older saves are upgraded on load (`contactPhone` → `phone`; missing `events` → the category's defaults).
- **Visibility:** a vendor counts when its category is on and at least one of its events is on. A vendor serving several events counts once in the budget; the per-event figures on Home count it in each event (stated on screen).
- **Countdown:** days to the next dated event that is on.
- **Routes (URL hash):** `#/home`, `#/procedure`, `#/settings`, `#/vendors/<category>`, `#/vendors/<category>/<event>`.
- **Auto-fill (`src/autofill.js`):** browser-only. It reads the link address (Instagram/Facebook/TikTok handle + suggested name, wa.me / api.whatsapp.com phone, linktr.ee, any website + name from the domain) and pasted contact text (phone, email, @handle, links). It fills empty fields only and never fetches the vendor's site; fetching needs a server (Build & Ship).

### Phase 2 step 2: Smart checklist (29 Oct 2026)

- `src/data/checklistTemplate.js`: suggested tasks with `event` (`akad` / `sanding` / `reception` / `first` = earliest dated event that is on), `days` before it (negative = after), optional `category`, optional `auto` (`booked`, `budget`, `dates`), a `group` and an optional `note`. Marriage-procedure tasks quote only the official source; their timing is labelled as a suggestion.
- `src/checklist.js`: `buildChecklist(settings, vendors, checklist)` works out due dates, hides tasks for hidden categories or switched-off events, and auto-ticks: "Book …" when a vendor in that category is at Deposit Paid or later, the budget task when a budget is set, and the dates task when every event that is on has a date. `groupChecklist` sorts open tasks into Overdue / Next 30 days / month / No date yet, then Done.
- Saved under `wvt.checklist` = `{ done: [suggested task ids ticked by hand], custom: [{ id, title, dueDate, category, done }] }`.
- Route `#/checklist`; sidebar "Plan" section (open-task count); Home shows "Next tasks" (the first 4 open tasks) with "x of y done".
- Checklist routes: `#/checklist` (All) and `#/checklist/<general|category>`. Categories carry a `short` label for tabs.

### Phase 2: Calendar (29 Oct 2026)

- Route `#/calendar`; sidebar: Home · Marriage Procedure · Checklist · Calendar · Vendors… · Settings.
- `src/dates.js`: local "YYYY-MM-DD" helpers (Monday-start weeks, month grid, labels).
- `src/calendar.js`: `calendarItems(settings, visibleVendors, tasks)` → Map of date → items (event days that are on, vendor payments due before Final Balance Paid, checklist tasks with a date), ordered event → payment → task. `itemsBetween` feeds Home's "This week".
- Rescheduling: `wvt.checklist.dates` maps a suggested task id to a moved date ("Use suggested date" removes it). Own tasks change their `dueDate`. The shared `TaskRow` (Checklist and Calendar) has "Change date".
- View state (month/week/day, selected date) is not saved; it starts on today.
- `AddTaskForm` (shared by Checklist and Calendar) takes `defaultDate`, `defaultCategory` and `inline`.

### Phase 2 step 3: Guest list & RSVP (29 Oct 2026)

- Guest: `{ id, name, side (bride|groom|both), group, phone, events[], status (pending|attending|declined), plusOnes, dietary, notes }`, saved under `wvt.guests` (6 made-up samples on first load). Options and samples are in `src/data/guestOptions.js`.
- `src/guests.js`: `headcount` (1 + plusOnes), `visibleGuests` (hides guests invited only to events that are off), `guestSummary`, `eventHeadcounts` (attending people per event), (bulk import lives in `src/guestImport.js`).
- The couple records replies themselves. Guests replying online needs the app online (Build & Ship).
- Route `#/guests`; sidebar item after Calendar, with a guest count; quick stats show "Guests attending: N people · M awaiting reply"; Home Events rows add "N guests attending"; the checklist "Draft the guest list" ticks itself once any guest is added.
- `src/contact.js`: `whatsappHref`, shared by vendors and guests.
- `src/guestImport.js`: `parseTable` (CSV or tab-separated, with quotes), heading matching in English and Malay (Name/Nama, Phone/Telefon, Side/Pihak, Group/Kumpulan, Plus ones/Tambahan, Reply/Hadir, Events/Majlis, Dietary/Pemakanan, Notes/Catatan), value reading (Lelaki/Perempuan, Ya/Tidak, Kenduri/Resepsi…), and a plain-list fallback. `TEMPLATE_CSV` is offered for download. .xlsx is not read: it would need a library (SheetJS, about 400 KB), against the no-new-library rule, so the app explains how to save as CSV or paste the cells.

### Phase 2 step 4: Seating chart (29 Oct 2026)

- Saved under `wvt.seating` = `{ tables: [{ id, event, name, shape (round|long|vip), seats, x, y }], assign: { [event]: { [guestId]: tableId } } }`. Each event has its own floor plan.
- `src/seating.js`: table sizes and seat positions from shape + seats, `findSpot` (first free spot that does not overlap another table), `seatingFor` (tables, guests per table, seats used, unassigned guests, totals; it ignores assignments to deleted tables or guests no longer attending), `unassignedTotal` (only events that have tables).
- Floor plan: SVG in a fixed 1000 × 680 space with a Pelamin marker at the top. Tables move by pointer drag (mouse and touch) or arrow keys when selected. Guests are seated by HTML drag-and-drop or by tapping a guest and then a table. A party (guest + their extra people) is refused if it does not fit the free seats. Deleting a table frees its guests.
- Route `#/seating/<event>` (defaults to Sanding); sidebar item after Guests. Quick stats add "Unassigned guests" once a plan exists. The checklist task "Finish the seating plan" (7 Jun 2027 in the sample) ticks itself when everyone attending an event that has tables is seated.

### Phase 2: E-invite builder (29 Oct 2026)

- Saved under `wvt.invite` (merged over `SAMPLE_INVITE`, so new fields always have a value): `language (ms|en), theme, showBismillah, title, opening, closing, hosts, bride, groom, events: { [event]: { show, start, end, venue, address } }, dressCode, rsvpBy, contacts: [{ name, phone }]`. Event dates come from Settings.
- `src/invite.js`: four themes, standard wording per language (the couple's own text overrides it), Malay/English date and time formatting (e.g. "Sabtu, 12 Jun 2027", "2.00 petang"), Google Maps and Waze search links from venue + address, `inviteEvents`, and `whatsappMessage` (plain text with WhatsApp *bold*).
- Routes `#/invite` (editor + live preview) and `#/invite/preview` (the card alone, without the app around it). Sidebar item after Seating.
- Sharing: "Copy WhatsApp message" (clipboard), "Print or save as PDF" (print styles print only the card; one A4 page), "Full preview". A shareable web link needs the app online (Build & Ship).
- Checklist: "Prepare the e-invite" (90 days before the first event) ticks itself once both names are filled in (not the "Sample …" placeholders) and an event shown on the invite has a venue.

### E-invite studio (29 Oct 2026)

- The studio stays in this app. The guest invitation (`InviteView`) is self-contained and reads one saved invite, so going online later means deploying it as a public page (e.g. `/i/<slug>`) plus a small database for RSVPs, wishes and gift reservations (Build & Ship).
- `src/inviteThemes.js`: 8 themes (colours, name/heading fonts, decor id) and 5 animations; `themeVars` sets the `--inv-*` CSS properties. `InviteDecor.jsx` draws each theme's artwork in SVG/CSS. `InviteView.jsx`: cover + animation (phase closed → opening → open) + `InviteCard` (variant `panel`). `InviteCard` variant `card` is the printable version.
- `invite.animation` added (default `envelope`). Older saved invites keep their theme id (the 4 earlier ids still exist).
- Not yet built (chosen for later): own backgrounds and photos (IndexedDB), YouTube background music, and RSVP / wishes / gift sections on the invite. (All since built; own backgrounds later removed.)

### E-invite studio v2 (29 Oct 2026)

- `src/inviteThemes.js`: 6 themes, each with fonts, particles and 3 palettes (`heroBg/heroInk, bg/bgAlt, ink/muted, accent/onAccent, line, glass, art.petals/leaves/deep, foil`). `themeFor(theme, palette)` maps v1 ids (sage, rose, navy, watercolour) to new looks; `animationFor` maps `doors` → `gates`. Invite gains `palette`, `tagline`, `doa`, `signOff`, and `events[e].programme: [{ time, item }]`.
- `src/components/invite/`: `Art.jsx` (SVG primitives + filters), `artUtils.js` (`rng`, `paperGrain`, `isDark`), `ThemeArt.jsx` (HeroArt, SectionArt, BandArt, Divider, SealFace), `Opening.jsx` (seal peel via requestAnimationFrame + reveal styles), `Motion.jsx` (canvas Particles, Reveal on scroll, line Icons). `src/invite.css` holds the invitation's styles (imported by `InviteView.jsx`).
- `src/invite.js`: `initialsOf`, `icsHref` (Save the date .ics as a data link), `firstStart` (countdown target), new wording per language.
- Verified with headless Chrome by stepping the peel's animation clock by hand (10 frames), timed captures of each reveal, and screenshots of all 18 looks.
- Performance: `Art` (ThemeArt.jsx) bakes filtered SVG into a PNG object URL via canvas `toBlob` after render (hidden SVG kept for re-baking when its markup changes; `bake={false}` for seal, dividers, Midnight sky). `Particles` pre-renders one sprite per colour and only draws sprites per frame (time-based movement). `Countdown` is a separate component with a numeric target.

### E-invite studio: own images (29 Oct 2026)

- `src/media.js`: images in IndexedDB (`wvt-media` / `images`), resized in the browser (cover and page backgrounds up to 1800px, gallery photos 1400px; PNG kept as PNG, others JPEG 0.86). `saveImage`, `deleteImage`, `imageURL` (cached object URLs) and the `useImage(id)` hook. Replacing or removing an image deletes the old one.
- `invite.media = { cover, coverArt, coverShade, page, pageOpacity, gallery[] }` (ids only; up to 12 photos). `loadInvite` fills in missing fields.
- Guest view: cover photo (object-fit cover, slow settle-in) with a theme-coloured shade at `coverShade`% and the theme artwork on top when `coverArt`; page background under every section after the cover, faded with a colour wash so only `pageOpacity`% shows; a Gallery section (scroll-snap swipe, 4:5 rounded photos, active dot).
- Studio: "Your images" section (InviteMedia.jsx): cover / page slots with upload, replace, remove and a slider; gallery grid with move earlier / later and remove.
- Images stay on this device until the invitation goes online (Build & Ship).
- **Change (learner request):** own cover / page backgrounds removed (they could look messy). `invite.media = { gallery[] }` only; `loadInvite` deletes any cover / page images saved earlier from IndexedDB. Gallery photos are square (1:1).
- Invitation menu: tapping the open sheet's button again slides it back down (`closing` prop on Sheet); tapping another button switches the sheet; the open button shows an active state.

### E-invite: background music (29 Oct 2026)

- Learner chose a **YouTube link** (over an uploaded audio file) knowing the limits: needs internet; YouTube's embed rules do not allow a hidden player, so the player is visible in a "Lagu" sheet; some phones block sound until the guest taps the player itself.
- `src/youtube.js`: `parseYouTube` (watch, youtu.be, shorts, embed, live, music.youtube.com; start from `t` / `start`, e.g. 1m30s), `thumbnailOf`, `useYouTubePlayer(hostRef, video)` (loads the IFrame API once; loop via playlist; `play()` must run inside a tap).
- `invite.music = { url }`. The seal tap calls `play()` (Opening `onTap`) so the song starts as the invitation opens. The music sheet is always mounted (the player keeps playing when it slides down); the menu gains a 4th button "Lagu"; a floating disc button (bottom right, above the menu) plays / pauses and spins while playing.
- Verified with trusted clicks in headless Chrome: the seal tap starts playback; the disc pauses and resumes.
- **Music fix (learner reported "Lagu tidak dapat dimuatkan" on wifi):** the old message blamed the connection for every failure. `useYouTubePlayer` now keeps YouTube's error code; `youTubeProblem` maps 101/150 → not embeddable (owner turned off playing on other sites, or private / removed), 100 → unavailable, 2 → bad link, 5 → cannot play, API load failure → offline, others (e.g. 153) → player problem. The player passes `origin` and `widget_referrer`. The studio loads the song in a small check player (`MusicCheck`) and shows "This video can play on your invitation" or the reason, before guests see it.

### E-invite RSVP, wishes and gift (29 Oct 2026)

- New `wvt.invite` fields, normalised in `loadInvite`: `rsvp: { show, phone }`, `wishes: { show, list: [{ name, message }] }`, `gift: { show, bank, holder, account, qr, note }` (`qr` is an image id in IndexedDB `wvt-media`). Sample details are made up (`Sample Bank`, `0000 0000 0000`).
- RSVP needs no server: `rsvpHref` in `invite.js` builds a `wa.me` link to `rsvpPhone(invite)` (the RSVP number, else the first contact with a usable number) with the reply as text. The couple records replies on the Guests page.
- Wishes: guests' new wishes live in component state only (shown on their own screen). Collecting them for everyone, and replies straight into the guest list, need the app online (Build & Ship).

### RSVP linked to the Guests list (29 Oct 2026)

- Guest gains `attendingEvents[]` (events they said they're coming to; empty = all invited) and `repliedAt` (ISO). `goingTo(g, event)` in `guests.js` (attending, invited, and picked if they picked) drives per-event headcounts and seating's `attendingAt`.
- `src/rsvp.js`: `phoneKey` (digits, leading 0 → 60, at least 10 digits), `phoneMatches`, `nameMatch`, `replyChanges` (status, plusOnes = people − 1, attendingEvents, events ∪ picked, phone if missing, note appended to notes, repliedAt), `guestFromReply`, `receiveReply` (exactly one phone match → applied, state `linked`; else `review`).
- Replies saved under `wvt.replies` (newest first): `{ id, at, name, phone, coming, people, events, note, guestId, state: linked|review|added|manual|dismissed }`. App's `addReply` is passed to `InviteView` (`onReply`) in the studio preview and full preview; `replyActions` (link / add / dismiss / clear) go to the Guests page (`GuestReplies.jsx`).
- Online later (Build & Ship): the invitation posts replies to a database instead of calling `onReply`; the Guests page pulls new replies and runs the same `receiveReply`. Needs hosting, a database and sign-in for the couple (guests can only submit, never read).

### Phase 2 step 7: Gift & angpow registry (29 Oct 2026)

- Saved under `wvt.gifts` = `{ log: [{ id, from, guestId, amount, method (cash|transfer|qr|present), event, date, note, thanked }], wishlist: [{ id, name, price, link, note, reservedBy, reservedPhone, guestId, reservedAt, received }] }`; made-up samples in `src/data/giftOptions.js`.
- `src/gifts.js`: `giftSummary` (totals and counts only), `itemState` (open / reserved / received), `giftsByGuest`, `reserveItem` (first reservation wins; phone matched with `rsvp.js`), `giftsCSV`.
- `invite.registry = { show }`; `InviteView` gets `wishlist` and `onReserve` (App's `reserveGift`). Once online, reservations go to the database like RSVP replies.
- Route `#/gifts[/wishlist]`, sidebar item after E-invite.

- (Hadiah menu) `Gift` and `Registry` render inside the "gift" sheet; which items this guest reserved is kept in `InviteView` (`reservedByMe`) so it survives the sheet closing. The music layer has no menu button: the disc toggles playback, or opens the layer when `music.error` is set. Note for Build & Ship: YouTube's API terms ask for a visible player, so revisit how the player is shown before publishing.

### Onboarding wizard (29 Oct 2026)

- `wvt.setup` = `{ done, start: sample|kept|cleared, at }` (`loadSetup` / `saveSetup`). No saved setup → the wizard opens on load.
- `SetupWizard.jsx`: welcome, then names → events → budget → categories → sample data (the last step only while samples remain). Finishing calls App's `finishSetup`, which writes settings, the couple's names into the invite, and (if chosen) `withoutSamples` from `src/setup.js`.
- `withoutSamples` drops vendors, guests, gift-log entries and wish-list items whose id contains `_sample_`, replies linked to sample guests, and clears invite fields still equal to `SAMPLE_INVITE` (names, hosts, venues, times, programme, dress code, reply-by, contacts, wishes, bank details). Theme, palette, opening, photos, music and the QR are kept. `sampleCounts` drives the sidebar label.

### Restu Home (29 Oct 2026)

- `src/home.js`: `attentionItems` (counts from tasks, vendors' payment dates, guests, replies, gifts, unseated), `inviteReadiness` (names, dates, venues, a contact; music and photos optional), `firstSteps` (only non-sample entries count). `HomePage.jsx` composes Hero, Attention, FirstSteps, StatsBar and six cards; it takes `vendors`, `invite`, `gifts`, `replies`, `unseated`, `setup`, `categories`, `onHideSteps`, `onRunSetup`.
- `wvt.setup.hideSteps` remembers a hidden First steps card.

### Menu (30 Oct 2026)

- `CATEGORIES` reordered to booking order (`categoryColors` hands out colours in this order); optional `menu` label for the sidebar.
- `wvt.ui` = `{ vendorsOpen }` (`loadUi` / `saveUi`). App passes the sidebar a `status` map (`booked` | `started`) from `categoryStats`.

### Checklist, Calendar, Marriage Procedure rework (30 Oct 2026)

- `wvt.procedure` = `{ course: { bride, groom, brideDate, groomDate }, application: { status, submitted, letterIssued }, akad: { status, registrar, certificate }, documents: [{ id, label, done }] }` (statuses todo | doing | done). `src/procedure.js`: `stepStatus`, `letterWindow` (issue date + 90 days vs the Akad Nikah date), `procedureAuto` for checklist ticks (`auto: 'procedure-course' | 'procedure-docs' | 'procedure-apply' | 'procedure-certificate'`). `buildChecklist` takes `procedure`.
- Checklist route tab: `all | vendors | procedure | yours | <category id> | task-<id>`.
- Calendar views: month, week, day, year. Grids show open items only; `TaskRow` gains `highlight` and `inChecklist`.

- (Procedure, second pass) `wvt.procedure.application` = `{ docs, sent, sentOn, letter, letterIssued }`, `akad` = `{ registrar, registrarDone, held, certificate }`; `loadProcedure` migrates the first version (status / submitted). `procedure.js` adds `COURSE_STATUSES`, `docsGathered`, `nextAction`.
- (Course details) `wvt.procedure.course` adds `brideTime`, `groomTime`, `brideLocation`, `groomLocation` (optional).

### Audit of remaining pages (30 Oct 2026)

- `storage.js`: `exportBackup()` (every `wvt.*` key as `{ app: 'Restu', version, savedAt, data }`), `backupParts()` (validates), `importBackup()` (replaces all `wvt.*` keys). IndexedDB images are not part of the backup.
- `InvitePage.jsx`: `InviteTabs` + `tab` state; sections grouped details / design / wording / media / guests; readiness from `home.js` `inviteReadiness`.
- `CategoryPage` takes `tasks` for its checklist line. `GuestsPage` adds group filter, sort, wider search and `downloadGuests` (CSV).

### Holistic UX pass (30 Oct 2026)

- `Toast.jsx` + App's `undoable(text, undo)`: deletes are immediate; Undo re-inserts at the old index (`insertAt`) or restores the seating snapshot. `GiftsPage` gets `onDeleted`. `QuickStats.jsx` removed; `Sidebar` takes `countdown`.
- `PhoneTabs.jsx` (≤900px). `DayPage.jsx` at `#/day[/<event>]` (default: next upcoming event); uses `eventHeadcounts`, `goingTo`, `seatingFor`, `mapLinks`, `timeRange`, vendors at BOOKED stages. Print: `.print-too` pages stay visible in print; `.no-print` hides controls.

### Budget per category and compare quotes (30 Oct 2026)

- `settings.categoryBudgets = { [categoryId]: RM }` (normalised in `loadSettings`; only known categories, positive amounts). `src/budget.js`: `budgetRows` (planned, committed via `committed()`, paid, lowest unbooked quote, left), `budgetTotals`.
- `BudgetPage.jsx` at `#/budget`; `CategoryPage` takes `planned` and renders `CompareQuotes.jsx` when two or more vendors are shown and Compare is picked.

### antislop audit 001 fixes (30 Oct 2026)

- Focus rings use one token, `--focus-ring` (burgundy by default; champagne inside `.sidebar`, `.mobile-bar`, `.phone-tabs`, `.page-head`, `.home-hero`). Control borders use `--control-border`. Both live in the last block of `styles.css`, which overrides the earlier layers.
- `InviteView` renders the couple's names as `h1` only on the full guest page; in the studio preview (`contained`) they are a `p`, so the E-invite page keeps one `h1`.
- `invite/Motion.jsx` `Particles`: drift 4s, fade 1.5s, then the animation frame loop stops and the canvas is cleared.
- Visible row labels: `.row-select-label` (vendor Stage, guest Reply in `.guest-reply-field`) and `.budget-planned-label` (visually hidden from 761px, shown on phones).

### Mauve Atelier (31 Oct 2026)

- `src/motion.js` `smooth(update, kind)`: runs a state change inside `document.startViewTransition` with `flushSync`, and sets `data-vt="page"` or `"list"` on `<html>` while it runs. Used by `useHashRoute` (page changes) and App's add / delete / undo / stage-change / task-tick handlers. Typing and date edits stay instant. With "reduce motion" on, or in browsers without view transitions, the change is instant.
- CSS: with `data-vt="page"`, `.page-enter` gets `view-transition-name: page`. With `data-vt="list"`, list rows get `view-transition-name: match-element` and class `row`. The Mauve Atelier block at the end of `styles.css` overrides every earlier layer. The token names are kept (`--burgundy` now holds the primary mauve, `--gold` the brass accent).
- `smooth(update, kind, dir)`: the kinds are 'page', 'list' and 'swap'. `dir` sets `data-dir` for the calendar slide. A call made while another update is being applied runs directly, which is safe for handlers that call other smooth handlers. `useHashRoute` maps in-page tabs to 'list' (category, checklist, gifts) or 'swap' (seating, day). App no longer keys those pages by tab.
- `ProcedureGuide`: `Reveal` (height and fade, inert when closed), `useJustDone` (counts completions while the page is open), `StepNumber` and `StepBadge`.
