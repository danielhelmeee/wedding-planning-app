# Design Direction

## Design Inspiration URL

Learner's own description: "Modern Editorial Luxe": a high-fashion editorial magazine meets a sleek SaaS tool. Warm, premium, elegant, serene.

Learner's one thing: **serene**.

## What We Borrow

- The learner's palette: linen canvas, milk-white surfaces, charcoal text, warm ash muted text, champagne gold accent, emerald / ochre / terracotta stage colours.
- Editorial serif headings paired with a sharp sans for data.
- 1px hairline borders and 16px rounded corners.
- Generous whitespace and calm, slow motion.

## What We Do Not Copy

- No magazine or SaaS brand names, logos, mastheads, photos or layouts copied from any real product.
- No real vendor names, real prices or real couples.
- No stock wedding photography or decorative clip-art.

## Visual Mood

Serene, warm and quietly premium. The page should feel like a calm planner's notebook, not a busy dashboard: lots of air, few colours at once, gold used sparingly so it means something.

## Layout Rules

- Page max width 1200px, centred, 32px side padding (16px on phone).
- Order: Header → Hero (full-width band) → two columns below on screens wider than 900px:
  - Left (about 62%): Vendor list, with the add form at the top of the list surface.
  - Right (about 38%): Settings, then Marriage Procedure guide. These sit directly on the page background, separated by a hairline and a serif section title. No card around them.
- On 900px or narrower: one column in the order Hero → Vendors → Settings → Procedure guide.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px. Sections separated by 48px.

## Color / Contrast Rules

Tokens (CSS custom properties):

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#FAF8F5` | page background (warm linen, already gold-tinted) |
| `--surface` | `#FFFFFF` | the two raised areas: hero and vendor list |
| `--text` | `#1C1E21` | primary text (15.8:1 on canvas) |
| `--muted` | `#6E7178` | secondary text (4.6:1 on canvas) |
| `--gold` | `#C5A059` | bars, marks, focus rings, hairline accents only, never text |
| `--gold-text` | `#8C6D2F` | gold text and the hero figure (4.6:1 on canvas, 4.8:1 on white) |
| `--line` | `rgba(28, 30, 33, 0.08)` | hairline borders and row dividers |
| `--emerald` | `#4A7C59` | Final Balance Paid / Completed mark (4.6:1, may be text) |
| `--ochre` | `#D99B26` | Deposit Paid mark (fill only) |
| `--ochre-text` | `#8A6114` | ochre text if needed |
| `--terracotta` | `#A37B73` | Prospecting / Quoted / Shortlisted mark (fill only) |
| `--terracotta-text` | `#8A5F57` | terracotta text if needed (5.1:1) |

Five-colour row/category palette for the hero bar and row marks (fills, each at least 3:1 against white): `#8C6D2F` gold-deep, `#4A7C59` emerald, `#A0522D` sienna, `#5B6B8C` dusk blue, `#8A5F57` rosewood. Categories cycle through these in category order.

- `--gold`, `--ochre` and `--terracotta` are never used for text.
- Stage meaning is always shown by the stage name as text, never by colour alone.

## Typography Feel

- Headings, section titles, hero figure, days countdown: `'Cormorant Garamond', Georgia, serif`, weights 500 and 600.
- Everything else (body, numbers, forms, buttons): `'Plus Jakarta Sans', system-ui, sans-serif`, weights 400, 500, 600.
- Load both from Google Fonts with `display=swap`; the fallbacks keep the page readable offline.
- All figures use `font-variant-numeric: tabular-nums`.
- Sizes: hero figure 56px (44px on phone); H1 32px; section titles 24px; body 15px; small/meta 13px. Line-height 1.5 for body.
- Money formatted as `RM 12,500` (whole ringgit, comma thousands).

## Component Style

- **Header:** app name "Wedding Vendor Tracker" in serif 32px, a one-line purpose under it in muted text ("Every vendor, every ringgit, one calm page."), and `Sample data` in small muted text. A small inline SVG ring icon or no icon.
- **Hero (surface):** label "Left in budget", the figure in `--gold-text` serif 56px, a line under it "RM 21,500 committed of RM 60,000 · 2 of 3 vendors booked · 226 days to go" (sample data on 29 Oct 2026). Below: one stacked bar showing each enabled category's committed amount as a share of total budget, one colour per category, with the unused part in `--line`. Under the bar, a legend: small square mark, category name, amount.
- **Vendor list (surface):** one list, not a box per vendor. Add form at the top, then rows split by hairlines.
  - Row: small round mark in the category colour, vendor name in bold, category in muted text under it, estimated cost on the right. Under that: a thin progress bar for stage position (for example step 4 of 6) with the text `Deposit Paid · 4 of 6` and `RM 5,000 paid` beside it.
  - Stage control: a native `<select>` styled with hairline border; beside it, a small coloured mark (terracotta / ochre / emerald) plus the stage name in text.
  - Completed row: muted text, says `Completed` in place of steps left, full grey bar.
  - Edit: text button "Edit" opens the same form inline in that row. Delete: text button "Delete" in `--muted`, turning `--terracotta-text` on hover, with a native confirm.
- **Buttons:** primary "Add vendor" is solid `--text` charcoal with white text, 10px radius; secondary buttons are text-only with underline on hover. Gold is used for focus rings and the primary button's hover underline, not as a fill behind text.
- **Inputs:** white, 1px `--line` border, 10px radius, 40px tall, label above in 13px muted.
- **Settings (on canvas):** wedding date and total budget inputs, then 12 category toggles as native checkboxes with labels in a two-column grid. Unchecked label reads muted with "(hidden)".
- **Procedure guide (on canvas):** serif title "Marriage procedure (Muslim couples)", three numbered steps with the step number in serif gold-text, step title in bold, two to three plain lines of text, and the official link as underlined text "Open on SPPIM" (opens a new tab). Source line in small muted text linking to malaysia.gov.my.
- No shadows on rows. The hero and the list surfaces use the hairline border only, no shadow (never a border and a shadow on the same thing).

## Mobile Rules

- At 900px or narrower, one column; at 600px or narrower, side padding 16px.
- Hero figure 44px; legend wraps to two columns.
- Add form fields stack one per line, full width; "Add vendor" full width.
- Vendor row: name and cost stay on one line; the stage select and Edit / Delete drop to a line below, full width, tap targets at least 44px tall.
- Category toggles become one column.

## Accessibility Basics

- All text meets AA (4.5:1) on its background; fills used as marks meet 3:1.
- Every input has a visible `<label>`.
- Visible focus ring: 2px `--gold` outline with 2px offset on every control.
- Stage is shown in text as well as colour.
- External links have `target="_blank" rel="noopener noreferrer"` and say where they go.
- Respect `prefers-reduced-motion`: bars appear without animation.
- Semantic HTML: `header`, `main`, `section` with headings, `ul` for the vendor list, `ol` for procedure steps.

## Anti-Slop Rules

- No fake logos.
- No fake testimonials.
- No fake stats unless clearly marked sample (header says `Sample data`; sample vendors carry made-up names like "Sample Dewan Seri Kenanga").
- No "lorem ipsum" in final proof.
- No emoji anywhere on the page, no box around every section, no pill around plain text (stage colours are small marks, not pill badges).
- One clear primary action: "Add vendor". The hero figure is the most prominent thing on the page.
- Readable on phone width (375px).
- No gradients, no glassmorphism, no glowing gold.
- No money advice, ratings or recommendations: figures only.

### Input form placement

At the top of the vendor list surface: name, category (select of enabled categories), estimated cost, amount paid, stage (defaults to Prospecting), and "Add vendor". On desktop, fields in two rows; on phone, stacked.

### Item list style

One list inside one surface, rows separated by hairlines (see Component Style).

### Update / mark state style

Stage changes via the select; the mark colour, stage text, step bar and hero figures update at once. Completed rows go muted with a full grey bar.

### Delete affordance

Quiet "Delete" text button on each row, native confirm "Delete this vendor?". Not red, no icon-only button.

### Empty state

Inside the list surface, centred: serif line "No vendors yet." and a muted line "Add your first vendor above to start your plan." Also shown when every category is hidden: "All categories are hidden. Turn one on in Settings."

### Refresh proof visibility

Data and settings are unchanged after refresh. (The "Saved in this browser." line was removed at the learner's request in Phase 2.)

## Design Verification Checklist

- [ ] Canvas is `#FAF8F5`; only hero and vendor list are white surfaces.
- [ ] Hero figure is the largest thing on the page, in `--gold-text`.
- [ ] Serif for headings and figures; sans for everything else; numbers tabular.
- [ ] No border + shadow on the same element; no shadow on rows.
- [ ] No emoji, no pill badges, no box inside a box.
- [ ] Stage shown as text plus mark; contrast checked.
- [ ] Focus ring visible on every control.
- [ ] Two columns above 900px, one column at 375px with no sideways scroll.
- [ ] Empty state and "Saved in this browser." visible when expected.
- [ ] Bars grow from 0 on load; reduced motion respected.

## Visual recipe

The build follows this section card by card. The style above sets the colours, typeface and mood; this section fixes what the page shows and how its surfaces, rows and icons are built, and wins wherever the two differ. For a page that shows rows and a main figure:

- Header: the app name, the one-line purpose under it, and the words `Sample data` in small muted text. A small inline SVG icon or no icon, never an emoji.
- Hero: a short label, the main figure at 48px or larger in the accent colour, one line under it with the count behind it (for example `4 plans in progress`), and a stacked bar showing each counted row's share of the main figure, one colour per row, and under the bar, each counted row's name and amount beside a small mark in its colour.
- Rows: one list, not a box per row. Each row: a small mark in that row's colour, the name in bold, the main amount on the right, and under them a bar for done of total with the text `6 of 12` and the words `6 left` beside it. Rows are split by a thin line. A finished row is muted, says `Finished` in place of `6 left`, and has a full grey bar.
- Colour: one accent colour from the style, plus a five-colour row palette, every colour with AA contrast on its background.
- Surfaces: the page background is tinted lightly with the accent, never plain white or plain grey. At most two areas stand out from it (for example the hero and the list, with any add form at the top of the list). Never a box inside a box, never a border and a shadow on the same thing, no shadow on rows.
- Width: on a screen wider than 900px, use the width (the hero beside the list, or the hero as a full-width band above it). On a phone, one column.
- Type: the style's typeface for words and numbers, with tabular numbers (CSS `font-variant-numeric: tabular-nums`) so figures line up. Emphasis comes from size and weight, not from boxes or pills. The only boxes in a row are its controls (buttons, tick boxes, inputs).
- Motion: bars grow from 0 when the page loads (a CSS transition). Nothing else moves.
- No new library: plain CSS and inline SVG. No emoji anywhere on the page: they look different on every device.

For an app where the learner adds or changes items, use the same row recipe for the items and the hero for the count that matters most.

## Phase 2 Layout (learner-approved, 29 Oct 2026)

Supersedes the one-page layout above where they differ; colours, type, surfaces, rows and the Visual recipe still apply.

- **App shell:** sidebar (272px) on the canvas with a hairline right border: brand, `Sample data`, Home, Marriage Procedure, a "Vendors" heading with one link per enabled category (vendor count on the right, muted), Settings pinned at the bottom. Active link: dark text, weight 600, a 2px gold mark on the left. Never a pill or filled background.
- **Quick-stats strip** at the top of every page: countdown to the next event, budget committed %, vendors booked %. Small muted labels, 14px semibold values, hairline under it.
- **Page heading:** serif 40px title (32px on phone) with one muted line under it.
- **Home:** hero (surface) → Categories list (surface, row recipe, links to each category, "No vendors yet in: …" links under it) beside Events and Payments due (on canvas, plain hairline rows).
- **Category page:** title + one figures line → event tabs (All · Akad Nikah · Sanding · Reception, with counts; active tab has a 2px gold underline, no pills) → one surface holding the vendor list, then a centred solid charcoal "+ Add a vendor" button (gold plus) standing on its own below the box, outside it. A tab with no vendors shows no box: two centred 14px muted lines ("No <Category> for <Event> yet." / "Add one from their link, or by typing their name.") with the button centred below them. The button opens the add form in its place (inside a surface) (title "Add a vendor for <Event>", Cancel closes it); after adding, the form closes and the button sits below the new vendor.
- **Add form:** quick-fill block first (link field, focused on open + "Or paste their contact text" + "Fill in from these" secondary button + a status line), dashed hairline, then name, stage, cost, paid, "For which events?" checkboxes (only the open tab's event is pre-ticked; nothing on All), Notes (optional) textarea, collapsible "Contact, socials and payment date", primary "Add to <Category>" + Cancel.
- **Vendor row:** under the name, the events it serves in muted text; contact links (WhatsApp, email, IG, TikTok, Facebook, Website, Quote / contract) as gold-underlined text links.
- **Settings page:** Events (on/off + date per event, three columns), Budget, Vendor categories (two-column checkboxes), sections split by hairlines, on canvas.
- **Vendor notes:** shown under the contact line in muted 13px text with a 2px hairline on the left, line breaks kept.
- **Phone (≤900px):** sticky top bar with a hamburger icon button on the left (44px, becomes ✕ when open, labelled "Open menu" / "Close menu"), then the brand; the sidebar opens as a drawer under the top bar over a dimmed backdrop, so the ✕ stays visible; tapping a link closes it. One column everywhere; tap targets 44px.

### Checklist page (Phase 2 step 2)

- Title, a line "x of y done · n overdue · Suggested timing, worked back from your event dates.", and a thin gold progress bar.
- A centred solid "+ Add a task" button; it opens a small form in a surface (task, due date, category), with Cancel.
- One surface with groups: small uppercase muted headings with counts (Overdue in terracotta-text), rows split by hairlines: a native checkbox, a bold title, and a meta line (due date, category link, group or "Ticked automatically: …"), with an optional muted note. Auto-ticked tasks have a disabled checkbox. Your own tasks have a quiet Delete.
- "Done (n)" is a closed `<details>` under the surface; done titles are muted with a line through.
- **Sidebar order (updated):** Home · Marriage Procedure · Checklist (open count) · VENDORS (enabled categories) · "N hidden · Show in Settings" link when any category is off · Settings at the bottom.
- **Checklist tabs:** All · General (tasks with no category) · one tab per enabled category, using short labels (Venue, Pelamin, Planner, Emcee, Catering, Attire, MUA, Florist, Hantaran, Door Gifts, Inai, Pengapit, Photo & Video, Entertainment, Car, Kad Kahwin) with open-task counts. The page title shows the full category name. On a category tab, "+ Add a task" preselects that category. Below 900px every tab row scrolls sideways instead of wrapping.

### Calendar page

- Title + one line; an overdue-tasks line linking to the Checklist when any are overdue.
- Toolbar: "Today" (secondary button), ‹ › square icon buttons, the period label in serif (month / week range / full day), and a Month · Week · Day switch on the right, styled like the tabs (gold underline, never pills). A legend: gold dot = event day, terracotta = payment due, dusk blue = task.
- **Month:** one surface with a 7-column grid (Mon–Sun), hairline cell borders. Each cell has its day number (today = charcoal circle with white number) and up to 3 one-line titles with a 2px coloured left mark (event titles in gold-text, overdue in terracotta-text, done struck through), then "+N more". Event days have a soft gold tint (#f8f1e3). The selected day has a 2px inset gold outline, and its full list shows below the grid under a serif date heading.
- **Week:** one surface listing Mon–Sun, each day heading clickable to open Day view, then that day's list.
- **Day:** one surface with the day's list. Event days show the event name in serif gold.
- Day lists: event line, then payments (vendor link + "RM x still to pay", overdue in terracotta), then tasks as checklist rows (tick, Change date).
- **Phone:** the grid shows dots (up to 4) instead of titles, with centred day numbers; tap a day to list it below. The toolbar wraps and buttons are 44px.
- **Home:** "This week" (next 7 days: tasks, payments, events, with dots) replaces "Next tasks", with "Open calendar" and the overdue count.
- **Calendar add task:** every day list (the selected day under the month grid, each day in Week view, the Day view) ends with a left-aligned outlined "+ Add a task" button (gold plus, 38px; 44px on phones). It opens the add-task form inline under a dashed hairline, with the date preset to that day; Cancel closes it.

### Guests page (Phase 2 step 3)

- Title + summary line (invited / people, attending / people, awaiting, declined).
- Headcounts per event on the canvas: event + date label, a big serif gold-text number (attending people), and "people attending · n replies awaited". Three columns on phones too (32px numbers).
- Toolbar: reply tabs (All · Awaiting reply · Attending · Declined, with counts, underline style) on the left; Side select + name search on the right (stacked full width on phones).
- One surface list. Row: status mark (emerald attending, ochre awaiting, terracotta declined; declined rows muted), bold name, "Side · Group — events" muted, people count on the right; details line: +n, "Dietary: …" in ochre-text semibold, WhatsApp link; notes; reply select, Edit, Delete.
- Header actions (top right; full width on phones): "+ Add a guest" (solid) and "Import guests" (outlined). A form opened from here appears in its own surface right under the header.
- Below the list: a centred "+ Add a guest" (plus "Import guests" when the list is empty). A form opened from here appears inside the list box under the last guest.
- Side filter: All guests · Bride's side · Groom's side · Both families. A guest's side can be "Both families".
- Import panel: a short intro naming the accepted headings (English and Malay); "Upload CSV file" (outlined) and a "Download a template" link; one textarea for pasted names or spreadsheet cells; "For rows that do not say" defaults (side, group, reply, invited to); a preview with "N guests ready to add", how the columns were read, a "Skip n names already on your list" tick box (on by default), up to 8 preview rows (skipped ones struck through) and "and N more"; then "Add N guests" / Cancel. Choosing an .xlsx file explains how to save as CSV or paste the cells instead.

### Seating page (Phase 2 step 4)

- Header with a summary (tables, seats, seated of attending people, unassigned) and a solid "+ Add a table" at the top right; event tabs underneath.
- The add-table form opens in a surface under the tabs: shape (Round 10 / Long banquet 12 / VIP 8 seats by default), seats, optional name.
- A status line under the tabs: emerald for "X seated at Table 1", terracotta for "Small has 3 free seats; X needs 4."
- Layout: the floor plan surface (left, wide) and a 300px side panel (right; below it on screens up to 900px).
- Floor plan: a warm off-white floor, a "Pelamin" block in gold tint with a serif label at the top. Tables are white with a charcoal hairline; seats are small circles, filled gold when taken; the table name is 18px semibold (gold-text for VIP) with "used/seats" under it (terracotta if over). The selected table has a gold outline; while a guest is picked, every table shows a dashed gold ring as a target. One hint line under the plan.
- Side panel: "Unassigned" with a people count and guest cards (name, people, side) to drag or tap (a picked card gets a gold border and tint). A selected table shows its name/seats/shape fields, "Seated here" with Remove, a "Seat a guest here" select (parties that do not fit are disabled), and "Delete this table".
- Phone: the plan keeps a 720px width and scrolls sideways inside its box, so names stay readable and tables stay tappable.

### E-invite page

- Header actions: "Copy WhatsApp message" (solid), "Print or save as PDF" and "Full preview" (outlined), plus a fine-print note that a web link needs Build & Ship. A status line confirms the copy.
- Two columns: the editor (sections Look · Couple and family · Wording · Events · Dress code and replies, split by hairlines) and a sticky 400px live preview. Up to 900px: one column with an Edit / Preview switch (underline style).
- Wording fields show the standard text as grey placeholder text; blank means "use the standard wording".
- The card: theme soft background, a 1px theme border and an inner frame line (outline, no shadow), centred text; Bismillah in an Arabic serif; title, couple names and event names in Cormorant in the theme accent; small diamond ornaments; events split by hairlines with date, time, venue, address and "Google Maps · Waze" links; dress code and reply sections with small uppercase labels; closing line in italic serif.
- Themes (accent on soft background, all AA): Champagne gold #8c6d2f / #fbf7ef, Sage green #4a6b53 / #f4f6f1, Dusty rose #8a5f57 / #faf3f1, Midnight navy #3e4c6b / #f3f4f8.
- Print: only the card, compact sizes, one A4 page.

### E-invite studio (Phase 2, replaces the single card design)

- **Guest invitation:** a full-screen themed page. A cover (title, couple names, first event date, "Buka jemputan" / "Open invitation" pill button) sits on top until opened; then the invitation content scrolls on the theme background inside a translucent rounded panel.
- **Opening animations** (about 1.5 s; skipped with reduced motion): Envelope (flap lifts, letter rises, wax seal with initials), Gate doors (two patterned doors swing open in 3D), Curtain (pleated curtains in the theme accent part to the sides), Fade, None. Every cover ends with a short fade. On doors and curtains the names sit on a small card in the theme background so they stay readable.
- **Themes** (original artwork in SVG/CSS; the couple's invitation may use soft washes and patterns, while the app's own UI stays flat): Champagne Classic (double gold frame + corner flourishes, Great Vibes names), Sage Garden (leaf sprigs), Dusty Rose Florals (blush washes + flower clusters), Midnight Stars (dark navy, star pattern, crescent moon, gold text), Songket Maroon (dark maroon, gold songket diamond bands), Minimal White (Playfair, no decor), Watercolour Blue (blue/lilac washes), Batik Teal (batik circle motif pattern). Text meets AA on each background; dark themes use cream text and a dark label on the gold button.
- **Studio:** a Theme gallery (4 columns of live swatches with "Aisyah & Hakim" in the theme's name font; gold outline on the chosen one), Opening animation choices (2-column outlined radio cards with a one-line note), then Look, Couple and family, Wording, Events, Dress code and replies. The preview is a 360 × 720 phone frame (10px charcoal bezel, 40px radius) with "Replay opening" under it. Choosing a theme or animation replays the opening.
- **Full preview** (#/invite/preview): the guest view filling the screen, with "‹ Back to the editor" under the invitation.
- **Print** still prints the plain framed card on one A4 page.
- Fonts added: Great Vibes (script names), Playfair Display, Amiri (Bismillah).

### E-invite studio v2 (29 Oct 2026; replaces v1 themes and openings)

Studied a finished jemputan.me invitation for structure and motion only (no artwork, names or wording copied). Key ideas kept: paper gates with a seam shadow and a round initials seal; a full-screen painted hero; cream content sections with faint botanical line art; a frosted programme card over artwork; a closing arch with curved text; a fixed bottom menu opening sheets; particles; scroll-in reveals.

- **Opening:** a round seal (theme colour, mini artwork, initials split by a fine line, "BUKA" / "OPEN" curved along the bottom, gold ring, sheen) breathes gently. Tapped, it **peels like a sticker**: a diagonal fold sweeps from the lower-right edge to the upper left, the lifted flap curls up in 3D showing the paper back with shading and a fold shadow, then the sticker comes away up-left, turning slightly (about 1.3 s, driven frame by frame). Then the reveal: Gates (textured paper gates swing apart), Envelope (flap opens, card rises, envelope drops away), Curtain (pleated drapes sweep aside under a scalloped valance), Soft fade, or None. Reduced motion skips straight to the invitation.
- **Hero (exactly one screen tall):** theme artwork scales in from 108% while the tagline, names, date and venue enter one after another (fade, rise, un-blur). Particles start: falling petals (Garden), glinting gold dust (Champagne, Songket), blossoms (Batik), twinkling stars (Midnight), none (Minimal).
- **Sections (each with its own background sized to the section):** Invitation (Bismillah, kicker, divider, hosts, opening, couple names) · Events (date / time / venue with icons, Google Maps · Waze, Save the date .ics) · Programme band (theme artwork + frosted glass card, timeline with diamond separators) · Countdown (4 tiles) · Dress code + doa + closing line · Closing arch (curved "JEMPUTAN IKHLAS DARIPADA" + script sign-off) · Docked frosted menu (Calendar, Contact, Location) opening bottom sheets.
- **Six themes × three colourways:** Garden Watercolour (Emerald, Blush, Ivory), Champagne Gold (Ivory, Pearl Grey, Noir), Songket Royale (Maroon, Royal Blue, Emerald), Batik Bloom (Indigo, Teal, Terracotta), Midnight Garden (Navy, Plum, Forest), Minimal Editorial (White, Sand, Sage). Artwork is painterly SVG: layered peony/rose blooms, blossoms, buds, veined leaves, sprigs, baby's breath with a watercolour filter (wobbly edges, pigment rim, grain); gold-foil filigree, crest, songket pucuk rebung bands and bunga tabur with a moving shine; batik bunga raya with isen-isen fills and crackle; glowing moon and starfield; fine line sprigs; paper grain on every surface.
- **Fonts:** Cinzel, Great Vibes, Pinyon Script, Italiana, Playfair Display, Cormorant Garamond, Amiri, Plus Jakarta Sans.
- **Studio:** theme gallery shows live mini heroes; a "Colour for <theme>" row of three split swatches; Opening explains the seal and lists the reveals; new fields for the cover line, doa, arch sign-off and a per-event Atur cara (time + item rows).
- Hand-painted artwork (like the reference's) needs illustrator or licensed images: that comes with the "own backgrounds and photos" round.

### Adjustments (29 Oct 2026, learner request)

- **Sidebar:** no numbers on any menu item; narrower (224px) with 13px links and tighter spacing, giving the main content more room.
- **Studio preview:** a true iPhone 18 Pro screen (402 × 874 pt, from Apple's 1206 × 2622 px at 3×) in a 10px bezel with a 64px corner radius and a Dynamic Island, scaled down to fit the window and column (CSS zoom).
- **Theme gallery:** 3 per row, thumbnails in portrait phone proportion (9:16), centred labels that wrap instead of overlapping.
- **Cover names:** 38px (31px for the all-caps Cinzel themes) with a soft drop shadow: a dark shadow on dark heroes, a faint shadow plus a halo in the hero colour on light heroes.
- **Batik Bloom:** corner flowers pushed further out and at 50% opacity; drifting blossoms fainter.
- **Songket Royale:** redesigned as static woven gold thread (no moving shine): stepped pucuk rebung with hollow centres and lozenge cores, a lozenge chain between gold rules, stepped eight-point bunga tabur; the arch is larger, fainter (45%) and sits behind the text block.

### Animation and theme fixes (29 Oct 2026, learner request)

- **Particles** run as one continuous loop: they no longer restart every second (the countdown re-render used to restart them), and they move by elapsed time, so speed is the same at 60 Hz or 120 Hz.
- **Gold foil is still on every theme** (no moving shine).
- **Moon (Midnight Garden):** a still gold crescent; its glow hugs the crescent (no full-disc halo) and breathes slowly between 55% and 100% opacity on a 5 s alternating loop.
- **Batik Bloom cover:** no crackle texture or dot grid; corner flowers at 88% opacity, top-right and bottom-left, kept clear of the text and the menu.
- **Champagne Gold cover:** a single border (the gold filigree frame); the plain rectangular border and the bottom flowers are gone; a matching gold crest sits at the bottom, mirroring the top crest.

### Smoothness and readability pass (29 Oct 2026, learner request)

- **Particles are smooth (60 fps, no stalls).** Causes found by measuring frame timing: (1) the watercolour filter on the artwork was re-run under every moving particle; (2) gradients were created for every particle every frame (garbage-collector pauses); (3) the whole invitation re-rendered every second for the countdown. Fixes: filtered artwork is baked into an image once rendered (re-baked when theme / colour changes; seal, dividers and the moonlit sky stay live); particles are pre-drawn sprites; the countdown is its own component.
- **Cover text sizes:** names 43px (35px for the all-caps Cinzel themes), ampersand 38px, tagline 18px italic, date 16.5px semibold, venue 13px, all with the soft drop shadow.
- **Songket Royale cover:** the arch is removed; the woven band is centred so a pucuk rebung and a lozenge sit exactly on the centre line.
- **Minimal Editorial:** vintage botanical engravings replace the line sprigs everywhere: an old-rose stem (cross-hatched cup, spiral heart, thorns, bud, hatched leaves, stipple) and a leafy sprig, in the accent ink with a slight hand-drawn wobble. *(Replaced 30 Oct 2026, see below.)*
- **Colour swatches:** the two colours fill the whole circle (an inner ring replaces the border that exposed the square tile).
- **Invitation sheets:** glide up from the bottom (520 ms, soft ease-out) and slide back down on close (320 ms) before being removed; only the backdrop fades, the sheet stays solid.

### Sheets and envelope (29 Oct 2026, learner request)

- **Sheets (Kalendar / Hubungi / Lokasi)** rise from behind the menu bar: the sheet layer sits above the content but below the bar (bar z-index 7, sheets 6) and is clipped at the bar's top edge (`--iv-dock-h`, 64px + safe area). Nothing else moves: the close button is focused with `preventScroll` once the sheet is in place (autofocus used to scroll the page to the hidden sheet and make the content jump). Measured: page scroll, content and bar positions identical before, during and after.
- **Opening:** the "Walimatul Urus" line on the cover is removed.
- **Envelope reveal:** the whole screen is a vertical envelope: the front pocket with folds rising from the bottom corners to the centre, the flap coming down from the top to a point in the middle, where the seal holds it. After the peel, the flap swings up and over on its top hinge, then the envelope slides down while fading out.

### Your images (studio) and photo gallery (invitation)

- Studio "Your images": each slot shows a 9:16 thumbnail (or "No image"), an outlined "Upload image" / "Replace image" button and a quiet "Remove"; options under it (a "Keep the theme artwork on top" tick box for the cover; a gold range slider with the value in bold). Gallery: a grid of 4:5 thumbnails with ‹ › square buttons and Remove, then "+ Add photos" (several at once, 12 max, with a message if some did not fit).
- Invitation: cover photo under a theme-coloured shade (light text with dark shadow on top); page image faintly behind sections; "GALERI / GALLERY" section with full-width 4:5 photos, 20px corners and a soft shadow, swiped one at a time, with dots (the active dot in the accent, slightly larger).
- **Update:** no own cover / page backgrounds (removed); the studio section is now "Photo gallery". Gallery photos are square (1:1) on the invitation and in the studio grid.
- **Menu:** the open sheet's menu button is bold with a small dot under it; tapping it again slides the sheet back down behind the bar.

### Background music

- Studio "Background music": a YouTube link field with a hint; when recognised, a 16:9 thumbnail, "Video found", the start time and "Remove music"; otherwise a terracotta "That does not look like a YouTube video link."
- Invitation: a 48px disc in the accent colour (record grooves, centre label) floats at the bottom right above the menu with a soft shadow; it shows a play triangle when paused and turns slowly (6 s per turn, linear, seamless) while playing. The menu gains "Lagu / Music". Its sheet shows the YouTube player (16:9, at least 200px tall, 14px corners) and a short note.

### E-invite RSVP, wishes and gift (29 Oct 2026)

- Order on the invitation: … countdown → **RSVP** (title, "please reply by …", solid "Sahkan kehadiran" button) → **Salam Kaut** (intro line, frosted card: gift icon, bank in small caps, account number large, holder, outlined "Salin" button, optional QR on a white square with "Imbas untuk menyumbang", optional note) → **Ucapan** (wish cards: italic message, name in accent small caps; the guest's own wish has an accent border; then name + message fields, "Hantar ucapan" and a muted preview note) → dress code and doa.
- Dock: RSVP item (envelope icon) between Lokasi and Lagu; dock items narrowed to fit five.
- RSVP sheet: reply-by line, "Nama anda", Hadir / Tidak dapat hadir as two pill buttons (filled = chosen), "Bilangan orang" 1–10, event tick boxes (only when more than one event; ticks drawn in the theme's on-accent colour), optional message, error line, thank-you note, full-width "Hantar melalui WhatsApp".
- Form fields follow the theme: 44px+ height, 14px radius, 16px text (no iPhone zoom), small-caps labels in the muted colour; focus ring in the accent colour for keyboard use only.
- Studio: "Dress code and contacts", then **RSVP**, **Wedding gift (salam kaut)** (bank, account number, holder, note, QR picker with thumbnail / Replace / Remove), **Wishes** (rows of From + Wish + Remove, "+ Add a wish"); each has a show toggle with an explanation hint.

### RSVP linked to the Guests list (29 Oct 2026)

- RSVP sheet: Nama anda, No. telefon (tel keyboard, placeholder 012-345 6789), Hadir / Tidak dapat hadir, Bilangan orang, event ticks, message, error line, full-width "HANTAR" (EN "SUBMIT"). After sending: heart in a tinted circle, "Terima kasih, <name>", received line (different for attending / not), an outlined summary box (Hadir · N orang / events), "Beritahu melalui WhatsApp juga" and "Ubah jawapan" (back to the filled form).
- Guests page, under the header: a "Replies from the invitation" panel (only when there are replies). "N replies need you": cards with an ochre left edge (name, received time, Dismiss top right; answer with a green / terracotta dot; phone + why it didn't match; quoted message; two columns: "Link to a guest on your list" select + "Link reply", "Or add as a new guest" side + group + "Add guest"; stacked on phones). "Recent replies": one line each with the outcome in small muted text; "Show all N" and "Clear this history".
- Guest rows: "Replied on the invitation · 29 Oct" in green, and "Coming to: …" when they replied for only some of their events.

### Gifts & Angpow (29 Oct 2026)

- Page head "Gifts & Angpow" with "+ Log a gift" / "+ Add an item" and (log) "Download as CSV". Four figure blocks in the headcount style: Received in total, Cash, Transfer & QR, Thank-yous to send.
- Tabs "Gift log N" / "Wish list N" (links, so the URL keeps the tab); event filter on the log. Rows follow the vendor/guest row pattern: dot (ochre = thank-you not sent / reserved, green = thanked / received, hollow = available), name, muted detail line, amount on the right, controls below (tick boxes "Thank-you sent" / "Received", text buttons).
- Wish list note line: counts plus whether it is shown on the invitation, with a link to E-invite.
- Invitation "Senarai Hadiah": intro line, frosted item cards (serif name, "± RM" price, note, small outlined "Saya hadiahkan"); tapping opens name + phone fields with Batal / TEMPAH inside the card; taken items fade with "Sudah ditempah", the guest's own has an accent border, "Ditempah oleh anda" and a thank-you line.

### Hadiah menu (29 Oct 2026; replaces the Salam Kaut / Senarai Hadiah page sections and the Lagu menu item)

- Bottom menu: Kalendar · Hubungi · Lokasi · RSVP · Hadiah (gift icon; shown when there are bank details or wish-list items). No music item: the floating disc plays / pauses.
- Hadiah sheet: "SALAM KAUT" small-caps heading, intro line, the bank card (Salin, optional QR), optional note; a hairline; "SENARAI HADIAH" heading, intro line, the item cards with Saya hadiahkan / TEMPAH.
- Page order after the countdown: RSVP → Ucapan → dress code and doa.

### Onboarding wizard (29 Oct 2026)

- Full-screen over the app: canvas background with a soft gold glow, one white card (max 640px, 16px radius, long soft shadow); on phones the card fills the screen.
- Welcome: the script R monogram in mauve, serif "Plan your wedding, your way", two lines of muted text, black "Set up my wedding" and outlined "Explore with sample data first" (same width), fine print.
- Steps: "STEP n OF m · NAME" in small caps, a 3px gold progress bar, serif question as the heading, muted lead line, then the inputs: names (two fields), events (bordered rows: tick + date; off rows greyed), budget (one field with the RM figure echoed), categories (two-column tick tiles; ticked = gold border and tint; Tick all / Untick all / "n of 16 ticked"), sample data (two radio cards). Footer: "‹ Back" left, Skip (names step) and black Next / "Finish setup" right; a summary line under the last step. "Close" top right when run again.
- Home banner while exploring samples: gold-tinted bar, "You're exploring sample data." + "Set up my wedding".

### Restu Home (29 Oct 2026; replaces the earlier Home layout)

- Name: **Restu**, serif wordmark 28px (24px in the phone bar) beside the script R monogram. Quick stats bar not shown on Home.
- Order: (sample banner) → header card → Needs your attention → First steps → budget card → card grid → checklist line.
- Header card: white with a soft gold glow top right; today's date in small caps; couple's names in serif 34–52px with a gold italic "&"; event chips (name bold + date; past events faded; "Add a date" link); on the right a gold serif countdown (64–96px) with "days to <event>". Phones: stacked, countdown inline under the chips.
- Needs your attention: small-caps section label; cards (number in serif 34px, title, one-line note, ›) with a 3px left edge in ochre / terracotta / gold; lift on hover; "✓ All caught up" when empty.
- First steps: card with "n of 5 done", a gold progress line, five steps in a row (one column on phones): circle tick (green when done, label struck through), linked label and a short note; Hide on the right.
- Card grid: two equal columns (one below 900px), 16px radius white cards, serif 26px titles with a muted link on the right; gold serif figures; reply bar green / ochre / terracotta with a legend; category chips inside a "not started" disclosure; e-invite card with the theme swatch (links to the full preview) and a readiness list with green ticks.

### Menu (30 Oct 2026; replaces the flat sidebar list)

- Brand, "Includes sample data", then three small-caps groups: **Plan** (Home, Marriage Procedure, Budget, Checklist, Calendar, Hari Majlis), **Guests & Invite** (Guests, Seating, E-invite, Gifts & Angpow), **Vendors** (in booking order: Venue & Khemah, Wedding Planner, Catering & Desserts, Photo & Video, Pelamin & Decor, MUA & Hair Stylist, Attire, Emcee & PA System, Entertainment, Kad Kahwin / Printed Cards, Hantaran & Gubahan, Door Gifts, Florist & Bouquets, Inai / Henna Artist, Pengapit & Bridal Party, Wedding Car & Transport).
- No numbers. Right of a vendor item: green ✓ (all booked) or a 6px gold dot (started); nothing when untouched.
- The Vendors heading is a toggle with a small chevron (rotates when collapsed); collapsed, only the current category shows.
- Settings is pinned at the bottom under a hairline; the groups above scroll on their own when the screen is short. Items 4px vertical padding (10px in the phone drawer).

### Checklist, Calendar, Marriage Procedure (30 Oct 2026)

- Checklist: pill filters (active = black), Category select, "Add a task" right-aligned (full width on phones). Group "CATCH UP" in ochre with a short explanation and an outlined "Spread over the next 4 weeks". Task row: 22px tick, title, one muted line (due date with pencil — ochre "Was due …" when late — then a muted category link). Undo toast: dark pill at the bottom centre for 6 seconds. A linked task flashes gold.
- Marriage Procedure: two columns (steps | 300px sticky progress panel; stacked below 1000px with the panel first). Steps on a vertical rail with 40px circles (gold outline; green ✓ when done). White cards: serif title + status badge (grey / ochre / green), the official lines and link, then the couple's fields: segmented Not started / In progress / Done, date fields, letter card (green ok, terracotta warning, gold info), documents list with add field.
- Calendar: grid + 320px white day panel (stacked below 1100px). Event day cells: cream background, 3px gold top edge, gold label with the event name. Year: 12 white mini-month cards; event days as gold circles, small dots for tasks (slate) and payments (terracotta), today outlined.

### Marriage Procedure, second pass (30 Oct 2026)

- Step cards fold: the head (title, one-line summary when folded, status badge, chevron) is the toggle. The current step has an "UP NEXT" tag and a gold border with a soft shadow.
- Milestones: 28px round ticks (green ✓ when done) with the label, a muted note and their fields beneath, separated by dashed lines.
- Course: per person, a three-option picker (Not registered / Registered / Completed; full-width 3 columns on phones) and the course date once registered.
- Side panel: lining-figure progress, a gold-tinted "Up next" box with the next action and its official link, "Key dates" list.

### Pre-marriage course, person cards (30 Oct 2026)

- Inside the course step: two cards (canvas background, hairline border, 10px radius; green tint when completed), side by side when the step is at least 640px wide (container query), stacked otherwise. Card: name (sans 15px bold) with "Same as bride" as a gold text link on the groom's card; a full-width three-option picker (Not yet / Registered / Completed, equal columns, never wraps); then Date + Time (one row; stacked on phones) and Location (full width). Before registering, a muted hint replaces the fields. One "Date, time and location are optional." line under both cards.
- Procedure page stacks (panel first) below 1180px.

### Add buttons (30 Oct 2026)

- List pages have one main add button, top right in the header (full width under the title on phones). It opens the form directly under the header.
- At the end of a list: a full-width dashed line, muted "+ Add another …" (gold "+"; gold border and light tint on hover) that opens the form in its place.
- Empty pages: the header button is hidden and the empty message carries one centred black button.

### Glossary (30 Oct 2026; one word per idea across the planner)

- **Tasks** that slipped: "to catch up on" / "Was due …" (never "overdue": the suggested timing is only a guide).
- **Payments** past their date: "Overdue" (money really owed).
- **Guests:** "Attending · Awaiting reply · Declined"; a guest's answer is a **reply**; **RSVP** is the form on the invitation.
- **Gifts:** "Gifts & Angpow" for the page; a cash gift is an **angpow**, a non-cash one a **present**; the bank-details section on the invite is **Salam Kaut**, the wish list **Senarai Hadiah**.
- **Events in the planner:** Akad Nikah · Sanding · Reception (the invitation uses its own BM names).
- **Vendors:** a category is **booked** once every vendor in it has reached Deposit Paid or later.
- Text sizes (planner): 12, 13, 14, 16, 18 for text; 22, 26, 32, 44 for headings; 56 / 64 for the two big figures; 28 for the wordmark. Nothing below 12px.

### Velvet Editorial Luxe (30 Oct 2026; supersedes the earlier colour tokens for the planner; the invitation keeps its themes)

- 60 / 30 / 10: warm cream canvas `#FAF7F5` and ivory cards `#FFFFFF` · deep obsidian `#1C1817` titles and key figures, ash taupe `#7A706D` labels · velvet burgundy `#3F0000` for primary buttons, active navigation, countdowns and progress fills. Champagne gold `#C8A261` for the brand mark, borders, focus glows and small marks; where gold must be read as small text it is darkened to `#8A6A32`.
- Hairlines `#EBE5E1`; input borders `#DCD3CE` (now `#8E8380`, see audit 001 below). Cards: 16px radius, `0 4px 20px -2px rgba(63,0,0,0.03)`.
- Status: paid `#3B5A45` on `#EBF2EC` · in progress `#A67C38` (text `#8F682B`) on `#FAF4E8` · pending / unbooked / over `#8B2626` on `#FDF0F0`.
- Type: Cormorant Garamond (display, titles, countdowns) and Plus Jakarta Sans 400–700 (interface).
- Motion: one curve `cubic-bezier(0.16, 1, 0.3, 1)`; 300ms for controls, 400ms for drawers, modals and the Vendors fold. Primary buttons lift 1.01 with a burgundy glow and press to 0.98. Phone menu drawer slides in from the left (where its button is) over a blurred dark backdrop. Categories switched on grow into the menu. Seating: a dragged guest lifts with a burgundy halo; the table pulses gold when someone is seated. A vendor reaching Final Balance Paid gets a one-off golden shimmer round its card. All motion drops to near zero with "reduce motion".

### Luminous layer (30 Oct 2026; builds on Velvet Editorial Luxe)

- Colour: burgundy stays dominant. Velvet gradient on primary buttons (`#6A1720` → `#3F0000` → `#2A0000`) with a satin highlight; metallic champagne gradient (`#F1DFB4` → `#C8A261` → `#9C7638`) for the ring, "&", "+" marks and the petal sparkle; blush accent `#E8C4B8` / `#FBEFEA` for joyful states; jewel chart tones (emerald `#2F6B53`, sapphire `#2E4A7D`, garnet `#8E2A3B`, amber `#B7832F`, plum `#6A3D6E`). Canvas: blush light top right, champagne bottom left, fine paper grain. Frosted sidebar, phone bars, studio tabs and toast.
- Motion: pages rise in (cards and rows staggered ~40–50ms); one indicator slides between tabs (`data-slide` rows); cards lift 2px with a gold hairline passing along the top; menu items lean in; focus rings bloom; buttons sweep with light on hover and ripple champagne on tap; tick boxes fill burgundy with a self-drawing gold check and a small spring; bars grow from the left; headline figures count up; toasts spring in.
- Signature moments: Home hero with blush light and drifting gold dust, names inked in on the first visit of the day, burgundy-gradient countdown. Petals (rose, blush and gold flecks, ~2.4s, with a blush message pill) for: a vendor newly booked, the first RSVP reply, every First Step done, all three marriage procedure steps done, the eve of an event. Each celebrates once (`wvt.celebrated`). "Reduce motion": no petals (message only), no entrances or dust.

### Immersive velvet (30 Oct 2026; learner chose option C)

- Burgundy owns ~30–35% of the screen: the sidebar (vertical velvet gradient `#4A0A0F` → `#2A0000` with fine grain, cream text, champagne-gold group labels, gold ring), the phone's top and bottom bars and menu drawer, every page header (a velvet panel with cream title, soft-cream subtitle, champagne links, gold dust and a gold hairline), and the Home hero (velvet panel, cream names, gold "&" and countdown). Pages with a velvet header keep their hero cards light (Hari Majlis, Budget) so two velvet blocks never stack.
- Menu items: rounded 10px boxes; hover fades in a lighter-wine box and brightens the text; press deepens it; the current page is a filled wine pill (`#6B1A2A`) with a gold left edge and champagne text, and the pill glides between items across groups (`data-slide-pill`). Status marks turn champagne. Phone bottom bar: the active tab sits on a wine pill behind its icon (springs in).
- On velvet, the main button turns champagne gold (burgundy text) and secondary buttons become cream outlines. In the content area, section titles and labels use wine (`#6B1A2A` / `#3F0000`); lists, forms, tables and status colours stay as they were.

### antislop audit 001 fixes (30 Oct 2026; learner chose "Fix all")

- **Dial: ENERGY 2 / RHYTHM 2 / MOTION 2.** Energy 2: one dominant colour (velvet burgundy) with gold as the accent, so the planner feels rich but stays calm for long planning sessions. Rhythm 2: pages share one structure (velvet header, then light content cards) so couples always know where they are; variety comes from the content (countdown, budget bars, seating plan), not from changing layouts. Motion 2: motion confirms actions (taps, ticks, sliding tabs, petals for milestones) and then stops; nothing loops in the planner.
- **Why the planner stays light:** the identity is a cream editorial paper with velvet framing. Dark belongs to the frame (sidebar, phone bars, page headers, Home hero); the working area stays cream so forms, figures and long lists stay easy to read in daylight. No dark mode toggle for now.
- Controls: field, select and tick-box borders `#8E8380` (3.7:1 on white, 3.4:1 on the cream canvas). Focus: 2px burgundy outline, offset 2px, with the soft champagne halo; on velvet surfaces the outline is champagne.
- Gold header button: `#F1DFB4` → `#C8A261` → `#B48C4C`, so burgundy text stays at 5.6:1 or more everywhere on it.
- Chart category tones (replace the jewel tones): wine `#6B1A2A`, antique gold `#B8893F`, taupe `#8C6F68`, rose clay `#B07A6C`, espresso `#4A3A36`. Green and red now only ever mean paid and over budget.
- Phones: every control at least 44px tall.
- Motion: the gold dust drifts once (about 4.5s) and rests. On the invitation, the moon breathes once and the seal breathes for about 5s. *(30 Oct 2026: particles drift continuously again and the scroll cue is removed; see below.)* The music disc keeps spinning because tapping it pauses it. Rows no longer rise in on every visit; only the page entrance, headline count-ups and bars move.
- Glass is kept only for the phone menu backdrop, the Undo message and the invitation's bottom menu.
- Cards lift on hover only when they are links (Needs your attention, theme swatches).
- Content section labels are sentence-case wine serif headings. Small caps stay only for the menu groups and the date line on Home.
- The celebration message's mark is a small gold petal (not a sparkle).

### Mauve Atelier (31 Oct 2026; supersedes Velvet Editorial Luxe, the luminous layer's colours and Immersive velvet for the planner; the invitation keeps its own themes)

- **Audience:** young, modern city couples with higher income who will pay for extras. The planner should feel like a premium lifestyle app: quiet luxury, calm, confident, simple to use.
- **Learner's choices:** smoky mauve, Instrument Serif + Instrument Sans, light porcelain frame.
- **Colour (60 / 30 / 10):**
  - Porcelain canvas `#FBF8F9` with a soft mauve wash at the top, and white cards.
  - Plum ink `#241B21` for titles and figures; muted `#6F6369` for labels.
  - Smoky mauve `#7A5A70` (deep `#5E4257`) for main buttons, the active menu pill, the countdown, progress and focus.
  - Brass `#A08A6A` only for small marks (the ring's stone, the italic "&", started dots); brass text `#7E6847`.
  - Tints: mauve `#F3EAEF`, wash `#F8F3F6`.
  - Status: paid sage `#4F6B57`, in progress ochre (text `#86642A`), over/pending clay `#9B4A45`.
  - Chart categories: mauve, brass, slate `#5E6B7A`, rose `#AB7D87`, espresso `#3F3339`.
- **Type:**
  - Instrument Serif (one weight; size does the work): titles at up to 58px, the couple's names up to 66px, the countdown up to 120px, section headings 23–28px.
  - Instrument Sans 400–700 for everything else, with 15px body.
  - The serif is never faked bold (`font-synthesis-weight: none`).
- **Frame:**
  - On desktop, the sidebar is a floating white panel (24px corners, soft shadow). The current page is a mauve pill that glides on a spring.
  - Page headers are open type on the canvas, with no panel.
  - On phones, the bars are white with hairlines, and the active bottom tab sits on a mauve-tint thumb.
- **Surfaces and controls:**
  - Cards: 20px corners (heroes 28px), a hairline and a two-part shadow.
  - Fields: 46px tall, 12px corners, `#8E8189` border, and a 2px mauve ring with a soft halo on focus. Selects get a mauve chevron.
  - Buttons are pills: the main one in a mauve gradient, secondary in white with a hairline.
  - View switches are segmented controls with a gliding white thumb. Filter pills fill mauve when active.
  - Task tick boxes are round, settings tick boxes square; both fill mauve with a white check.
  - Attention counts sit in a soft disc tinted by their tone.
- **Motion (MOTION dial 3 for this layer):**
  - Changing page: the old page fades out under the new one, which rises in. The menu stays still and its pill glides. (Browser view transitions, `src/motion.js`.)
  - Adding, deleting, undoing or ticking: rows glide to their new places, new rows rise in and removed rows fold away.
  - Forms ease in, fold-outs open to their natural height, and buttons and pills press to 0.97 and spring back.
  - Curves: `cubic-bezier(0.22, 1, 0.36, 1)` for movement, plus a soft spring with about 4% overshoot for things that land. Durations are 260ms for controls and 420–560ms for panels and glides. Only transform and opacity animate.
  - "Reduce motion" turns all of this off. Browsers without view transitions change instantly.
- **Dial update:** ENERGY 2 / RHYTHM 2 / MOTION 3. Motion goes up one step because the learner asked for super-fluid animation; it still only answers actions, and nothing loops.

### Mauve Atelier, round 2 (31 Oct 2026; learner request)

- **Serif:** Cormorant Garamond (replaces Instrument Serif). Display text at 500, headings at 600, figures with lining numerals. Instrument Sans stays for the interface.
- **Menu:** dark mauve (`#4A3344` → `#33232F`).
  - Text `#E6D8E0` (8.3:1 or more), group labels in brass `#C9B08A` (5.4:1), and the ring drawn in light mauve.
  - The current page is a porcelain pill (`#F6EEF2`, dark mauve text 11.6:1) that glides on a spring.
  - The focus ring is light inside the menu.
  - The phone drawer uses the same dark mauve; the phone's top and bottom bars stay white.
- **Guests:**
  - Every guest is its own white card (18px corners, 10px apart). Declined guests sit on a faint tint.
  - The reply dropdown is a status pill tinted by the answer: filled dot for Attending, open ring for Awaiting reply, cross for Declined, with a chevron in the same colour. It's centred in the row and 44px tall on phones.
  - The visible "Reply" title was removed at the learner's request. The label stays for screen readers, and the pill's own text says what it is. This is a deliberate exception to audit 001 item 6, for this one field.
- **Vendor pages:** switching event tabs keeps the page in place. Rows glide and fade between tabs, the tab underline slides, and the scroll position stays. An open "Add a vendor" form closes on a tab switch, because its event ticks belong to the old tab. Moving to another category is still a page change.

### Round 3 (31 Oct 2026; learner request)

- **Vendor pages:** every vendor is its own white card (18px corners, 12px apart), like guests. Compare view keeps one box for its table.
- **List changes** (event tabs, add, delete, undo, ticks): only the list moves. The rest of the page swaps in place with no cross-fade, and the "Add another" line glides along under the cards. The vendor page is no longer rebuilt on a tab switch (its key is the category alone), so headline figures and bars don't replay. The tab underline still slides to the new tab.
- **Menu pill and tab underlines (learner: no bounce):** they glide on `--glide` `cubic-bezier(0.32, 0.72, 0, 1)` over 460ms: quick to leave, a long soft arrival, no overshoot. The new item's text darkens 150ms in, as the pill arrives under it.
- **No bounce anywhere (learner):** the `--spring` token now uses the same no-overshoot curve, so button and pill presses, tick boxes, the phone tab thumb and the Undo message all ease into place.

### Cohesion pass (31 Oct 2026; learner: one design language everywhere)

- **Lists of things are cards:** guests, vendors and gift log / wish list items each sit in their own white card, 12px apart. Lists inside a card (Home and Hari Majlis summaries) stay as hairline rows. Compare view is one box.
- **Pages are cards on porcelain:** Settings sections are now white cards too.
- **Controls:**
  - Tick boxes are app-drawn and mauve everywhere: tasks round, all others square with 6px corners (event picks included).
  - Radios are a mauve ring with a mauve centre.
  - Choice cards (wizard, invitation opening) have a hairline at rest, and a mauve border on a mauve wash when chosen.
  - Segmented pickers, buttons, the Undo button and filter pills are all pills. Calendar arrows are 40px round buttons (44px on phones).
- **Disclosures:** "Or paste…", "Contact, socials…", "Done" and "categories not started" open with a mauve chevron that turns 90°.
- **Dividers:** solid hairlines throughout. Only the "Add another…" line is dashed, because it's a placeholder. Forms no longer end with a trailing rule.
- **Colour roles:**
  - Mauve marks the big days and every active or hover state: calendar event days in month, week, year and the side panel, the legend, the selected table, the current procedure step, "Up next", "Today".
  - Brass is kept for small marks only: the "+" in add buttons, the "&", link underlines, step numbers, the ring's stone and angpow amounts.
  - Status colours are unchanged.
- **Setup wizard:** porcelain backdrop, mauve ring with a brass stone, "Welcome to Restu" as a quiet mauve serif line (no small caps).
- **Phone calendar:** the month name sits on its own line above Today ‹ ›.

### Marriage Procedure motion (31 Oct 2026; learner request)

- **Course status picker:** one pill glides under the chosen option (`--glide`, 460ms). It's mauve, and fades to sage on "Completed"; the person card's tint fades with it.
- **Fields that depend on a status or tick** (course date/time/location, "Submitted on", "Issued on"): they open and close with height and fade together (`.reveal`, 420ms). Closed fields are inert.
- **Completing a step plays once, not on page load:**
  - The circle's number shrinks away, a check draws itself, and the circle fills sage with a soft glow ring and a brief brighten (1.3s).
  - The "Done" badge glows and a sweep of light crosses it (1.4s).
  - Undoing brings the number back with a plain transition.
- **Checklist (31 Oct 2026, learner request):**
  - Each group (Catch up, Next 30 days, each month, No date) is its own white card, 16px apart, and the "Done" fold-out is a matching card.
  - When you tick a task, the rows glide and a month card that empties folds away with them.
- **Serif font (31 Oct 2026, learner request):** DM Serif Display replaces Cormorant Garamond for titles, names, headings and figures.
  - It has one weight (400, plus italic for the "&") and is never faked bold.
  - Because it's wider and heavier, display sizes step down: page titles up to 52px, names up to 52px, the countdown up to 100px, section headings 25px, group headings 21px.
  - Cormorant stays loaded only for the invitation themes that use it. Instrument Sans remains the interface font.

### Motion vocabulary (31 Oct 2026; learner: cohesive motion everywhere)

Every change in the planner uses one of four motions, all on the same curves (`--glide` for travel, `--ease` for fades). Nothing bounces, nothing loops, and "reduce motion" makes everything instant.

1. **Page:** going to another page fades the old page out under the new one, which rises in. The menu stays still and its pill glides.
2. **List:** rows glide to their new places, new rows rise in, removed rows fold away, and the rest of the page stays still. Used for:
   - Tabs on Vendors, Checklist and Gifts, and the Checklist category menu.
   - Guests reply tabs and the side, group and sort filters; the Gifts event filter.
   - Opening and closing Add forms, Edit on vendor, guest and gift cards.
   - Add, delete, Undo and ticks, stage changes, and hiding First steps on Home.
3. **Swap:** rows glide as in List; anything else that changed cross-fades (180ms out, 260ms in). Used for:
   - Calendar views and Today / Jump.
   - Setup wizard steps.
   - **Panel** (a Swap scoped to one area, added after the learner asked that only the content under tabs move): the heading, tabs, menu and phone bars stay still; only the area marked `data-tab-panel` fades out (160ms) and rises back in (320ms). Used for the E-invite studio sections, its Edit / Preview switch, and the Seating and Hari Majlis event tabs. Call it with `smooth(update, 'panel:<name>')`.
   - Calendar previous / next also slide the grid 28px towards the month or week you moved to.
4. **Reveal:** height and fade together, for anything that opens in place: Marriage Procedure steps, status-dependent fields, Vendors in the menu, and fold-outs (`<details>`).

Small state changes ease rather than snap: progress bars (600ms glide), status chips and dots (colour), chevrons, the gliding pills and underlines, button presses (0.97), and tick boxes. Figures count to their new values.

Tabs inside a page no longer rebuild the page: Checklist, Seating, Hari Majlis and Gifts keep their state like Vendors, and an open form closes when its tab changes. Typing (search, amounts, dates) never animates.

## Logo (30 Oct 2026)

- The mark is a script "R" monogram supplied by the user, traced to one vector path in `src/components/BrandMark.jsx` (about 4 KB). It fills with the text colour, so each surface sets its own: brass `#d3bc94` on the dark menu (6.2:1 to 8.0:1), mauve `#7a5a70` on porcelain (6.0:1 on white).
- Sizes: 34px beside the wordmark, 52px on the welcome screen.
- Browser tab: `public/favicon.svg` (porcelain R on a mauve tile, 7px corners). Phone home screen: `public/apple-touch-icon.png` (180px).
- The guest invitation keeps its own themes and does not use the mark.

### Minimal Editorial artwork (30 Oct 2026, learner request)

The engraved rose read as heavy and old-fashioned. Replaced with original fine-line botanicals drawn in the style of the learner's reference images (style only; no reference artwork copied), in `src/components/invite/FineLine.jsx`:

- **Pen-drawn look:** stems are filled outlines that taper like a pen easing off; slender leaves are outlined with a midrib and a few veins; small leaflets are solid with a hairline midrib; jasmine (melati) flowers and closed buds; seed sprays of tiny rings on hair-thin stalks; grass blades that taper to nothing. One ink colour (the palette accent) on the paper, no wobble filter.
- **Pieces:** a leafy sprig (hero top-left and the top of each section), a fuller bouquet with a jasmine flower (hero bottom-right and the foot of a section), and a divider of a small jasmine with a leafy twig each side.
- **Placement:** sprays hang from the top-left or rise from the bottom-right with their stem ends out of view, alternating down the page so two never stack where sections meet.

### Particles back, scroll cue removed (30 Oct 2026, learner request)

- **Particles drift continuously** again on every theme that has them (petals, gold dust, blossoms, stars). The audit change that stopped them after 4 seconds is reversed at the learner's request.
- **On/off setting:** E-invite studio → Design → Look → "Floating petals / gold dust / blossoms / stars over the invitation" (on by default; saved invitations without the setting count as on). Minimal Editorial shows a note instead, as it has none. Guests whose device asks to reduce motion never see particles.
- **Scroll cue removed:** the thin line at the bottom centre of every cover is gone. After its two bounces it snapped back into view and sat there as a stray line.

### Midnight sections, Awan Larat Gold, studio layout (30 Oct 2026, learner request)

- **Midnight Garden:** stars twinkle only in the cover sky; over the content sections they made the backgrounds look see-through. The programme card is solid (Navy `#1e284a`, Plum `#3a2242`, Forest `#1b342b`).
- **Champagne Gold → Awan Larat Gold** (same theme id, so saved invitations keep it). Original gilded ornament after two traditional Malay gold crafts, in `src/components/invite/Ukiran.jsx`:
  - *Awan larat* (the scrolling vine of Malay woodcarving): tapered vines that roll into tight spirals, side tendrils curling outwards, curved leaves with a carved midrib, kudup buds and bunga cengkih (clove flowers).
  - *Telepuk* (gold leaf stamped on cloth): small bunga cengkih in a half-drop grid around the arch.
  - Cover: a pointed Malay arch (gerbang) in double gold lines, crowned by a bunga cengkih, a bud and a spray of awan larat rolling down each shoulder. Sections: carved corners. Divider: a bunga cengkih with a short scroll each side. Seal: a bunga cengkih above the initials.
  - Gold is slightly raised (soft shadow under it); petals use a centred highlight so they stay even when rotated (a diagonal gradient made small flowers read as pinwheels).
  - Colourways: Ivory (deeper gold so the gilding holds on ivory), Royal Green, Black Velvet. Names and ampersand in Great Vibes, headings in Cormorant. Text contrast: accent on ivory 5.98:1, on ivory alt 5.34:1; Royal Green accent 7.96:1, muted 6.72:1.
- **Studio layout:**
  - Space under the tab bar before each tab's first heading.
  - Venue is full width like Address.
  - Programme rows show their labels once; on phones the remove control is a 44px × button (named "Remove programme item N") so time and item fit.
  - Hosts and the wording boxes grow with their text instead of cutting it off.
  - Photo reorder buttons are 40px.
  - On phones the tab row fades at the right edge to show it scrolls.
- **Tab changes are calmer:** opacity only (old content fades out over 140 ms, new fades in over 260 ms after 100 ms), no rise.

### Envelope opening shows the card (30 Oct 2026, learner request)

- The envelope now holds the invitation card: a copy of the cover, slightly smaller and set a little low, sitting between the inside of the envelope and the front pocket.
- When the seal is peeled and the flap lifts, the top of the cover shows in the opening. The pocket then drops away while the card rises and grows to fill the screen, landing exactly on the real cover; the envelope is then removed.
- With the envelope, the real cover shows its finished state straight away (no staged fade-in of the wording or zoom of the artwork), because guests have already seen it on the card.
- The copy is hidden from screen readers and uses a plain element for the names, so the page still has a single h1.
