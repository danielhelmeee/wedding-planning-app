# Restu

Restu is a browser-based wedding planning app for couples planning a Malay wedding. It brings vendor planning, guest and event organization, and a marriage procedure guide into one place.

## What it includes

- Vendor and category tracking, with editable booking stages, estimated costs, payments, and optional contact details.
- Budget summaries and wedding settings, including category toggles that hide items without deleting them.
- A planning checklist, guest list and replies, table seating, event calendar, invitation preview, and gift tracker.
- A read-only guide to the Muslim marriage procedure in Malaysia, with links to official sources.
- Fictional sample data so you can explore the app safely.

## Run locally

Requires Node.js 24 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Other project commands:

```sh
npm run lint
npm run build
npm run preview
```

## Data and current limits

Planning data is stored in the browser's `localStorage`. It stays in that browser profile and does not sync across devices or accounts. Clearing the browser's site data removes it. The app has no backend, user accounts, or public guest RSVP links yet.

The marriage procedure guide is informational and links to Malaysian government sources. Application steps and forms can vary by state; follow the linked official guidance for current requirements.

## Project notes

The product brief, architecture, design, and build blueprint are included in this repository. Course prompts, templates, work cards, and internal build notes remain local to the author's workspace.
