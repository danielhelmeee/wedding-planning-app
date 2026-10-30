import { useCallback, useEffect, useState } from 'react'
import Sidebar, { Brand } from './components/Sidebar.jsx'
import HomePage from './components/HomePage.jsx'
import CategoryPage from './components/CategoryPage.jsx'
import SettingsPage from './components/SettingsPage.jsx'
import ProcedureGuide from './components/ProcedureGuide.jsx'
import ChecklistPage from './components/ChecklistPage.jsx'
import CalendarPage from './components/CalendarPage.jsx'
import GuestsPage from './components/GuestsPage.jsx'
import SeatingPage from './components/SeatingPage.jsx'
import InvitePage from './components/InvitePage.jsx'
import InviteView from './components/InviteView.jsx'
import GiftsPage from './components/GiftsPage.jsx'
import SetupWizard from './components/SetupWizard.jsx'
import Toast from './components/Toast.jsx'
import PhoneTabs from './components/PhoneTabs.jsx'
import DayPage from './components/DayPage.jsx'
import BudgetPage from './components/BudgetPage.jsx'
import Petals from './components/Petals.jsx'
import { celebrate } from './celebrate.js'
import { smooth } from './motion.js'
import { BOOKED_STAGES } from './data/stages.js'
import { CATEGORIES, CATEGORY_BY_ID } from './data/categories.js'
import {
  loadChecklist,
  loadGifts,
  loadGuests,
  loadInvite,
  loadProcedure,
  loadReplies,
  loadSeating,
  loadSetup,
  loadUi,
  loadSettings,
  loadVendors,
  saveChecklist,
  saveGifts,
  saveGuests,
  saveInvite,
  saveProcedure,
  saveReplies,
  saveSeating,
  saveSetup,
  saveUi,
  saveSettings,
  saveVendors,
} from './storage.js'
import { visibleGuests } from './guests.js'
import { unassignedTotal } from './seating.js'
import { guestFromReply, receiveReply, replyChanges } from './rsvp.js'
import { giftsByGuest, reserveItem } from './gifts.js'
import { sampleCounts, withoutSamples } from './setup.js'
import { buildChecklist } from './checklist.js'
import { categoryStats, daysText, enabledEvents, summarise } from './figures.js'
import { useHashRoute } from './useHashRoute.js'

// Three lines (hamburger), or a cross while the menu is open.
function MenuIcon({ open }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  )
}

// Puts an item back where it was (used by Undo).
const insertAt = (list, i, item) => [...list.slice(0, i), item, ...list.slice(i)]

export default function App() {
  const [vendors, setVendors] = useState(loadVendors)
  const [settings, setSettings] = useState(loadSettings)
  const [checklist, setChecklist] = useState(loadChecklist)
  const [guests, setGuests] = useState(loadGuests)
  const [seating, setSeating] = useState(loadSeating)
  const [invite, setInvite] = useState(loadInvite)
  const [replies, setReplies] = useState(loadReplies)
  const [gifts, setGifts] = useState(loadGifts)
  const [procedure, setProcedure] = useState(loadProcedure)
  const [setup, setSetup] = useState(loadSetup)
  // The setup wizard: on first launch, or when run again from Settings.
  const [wizard, setWizard] = useState(() => (loadSetup().done ? null : 'first'))
  const [menuOpen, setMenuOpen] = useState(false)
  // Deleting is instant, with Undo in a toast (instead of browser pop-ups).
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])
  // Undo puts the row back with the same glide as the delete.
  const undoable = (text, undo) => setToast({ id: Date.now(), text, undo: () => smooth(undo) })
  const [ui, setUi] = useState(loadUi)
  const route = useHashRoute()

  useEffect(() => saveVendors(vendors), [vendors])
  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => saveChecklist(checklist), [checklist])
  useEffect(() => saveGuests(guests), [guests])
  useEffect(() => saveSeating(seating), [seating])
  useEffect(() => saveInvite(invite), [invite])
  useEffect(() => saveReplies(replies), [replies])
  useEffect(() => saveGifts(gifts), [gifts])
  useEffect(() => saveProcedure(procedure), [procedure])
  useEffect(() => saveSetup(setup), [setup])
  useEffect(() => saveUi(ui), [ui])

  // The menu is phone-only: close it if the window grows to desktop width while it is open.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)')
    const onChange = (e) => e.matches && setMenuOpen(false)
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  const addVendor = (values) => smooth(() => setVendors((list) => [...list, { id: `v_${Date.now()}`, ...values }]))
  const updateVendor = (id, changes) => {
    const v = vendors.find((x) => x.id === id)
    // A vendor newly booked is a milestone worth petals (once per vendor).
    if (v && changes.stage && !BOOKED_STAGES.includes(v.stage) && BOOKED_STAGES.includes(changes.stage)) {
      celebrate(`booked:${id}`, `${v.name} is booked`)
    }
    const apply = () => setVendors((list) => list.map((x) => (x.id === id ? { ...x, ...changes } : x)))
    // A stage change can move the vendor in its list; let it glide there.
    if (changes.stage) smooth(apply)
    else apply()
  }
  const deleteVendor = (id) => {
    const i = vendors.findIndex((v) => v.id === id)
    if (i < 0) return
    const v = vendors[i]
    smooth(() => setVendors((list) => list.filter((x) => x.id !== id)))
    undoable(`Deleted ${v.name}`, () => setVendors((list) => insertAt(list, i, v)))
  }

  const updateSettings = (changes) => setSettings((s) => ({ ...s, ...changes }))
  const updateEvent = (id, changes) =>
    setSettings((s) => ({ ...s, events: { ...s.events, [id]: { ...s.events[id], ...changes } } }))
  const toggleCategory = (id) =>
    setSettings((s) => ({
      ...s,
      hiddenCategories: s.hiddenCategories.includes(id)
        ? s.hiddenCategories.filter((c) => c !== id)
        : [...s.hiddenCategories, id],
    }))

  function finishSetup(result) {
    const at = new Date().toISOString()
    setWizard(null)
    if (result.mode === 'sample') {
      setSetup({ done: true, start: 'sample', at })
      return
    }
    let next = { vendors, guests, gifts, replies, invite }
    if (result.removeSamples) {
      next = withoutSamples(next)
      setVendors(next.vendors)
      setGuests(next.guests)
      setGifts(next.gifts)
      setReplies(next.replies)
    }
    const { bride, groom } = result.names
    setInvite({ ...next.invite, ...(bride ? { bride } : {}), ...(groom ? { groom } : {}) })
    setSettings(result.settings)
    const stillSample = sampleCounts(next)
    const hasSamples = stillSample.vendors + stillSample.guests + stillSample.gifts > 0
    setSetup({ done: true, start: hasSamples ? 'kept' : 'cleared', at })
    window.location.hash = '#/home'
  }

  // Suggested tasks are ticked by id; the couple's own tasks carry their own `done`.
  const toggleTask = (task) =>
    smooth(() =>
      setChecklist((c) =>
        task.custom
          ? { ...c, custom: c.custom.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)) }
          : { ...c, done: c.done.includes(task.id) ? c.done.filter((id) => id !== task.id) : [...c.done, task.id] },
      ),
    )
  const addTask = (task) => smooth(() => setChecklist((c) => ({ ...c, custom: [...c.custom, task] })))
  const deleteTask = (id) => {
    const i = checklist.custom.findIndex((t) => t.id === id)
    if (i < 0) return
    const t = checklist.custom[i]
    smooth(() => setChecklist((c) => ({ ...c, custom: c.custom.filter((x) => x.id !== id) })))
    undoable(`Deleted "${t.title}"`, () => setChecklist((c) => ({ ...c, custom: insertAt(c.custom, i, t) })))
  }
  // Own tasks change their date; suggested tasks remember a moved date (null = back to the suggested one).
  const rescheduleTask = (task, date) =>
    setChecklist((c) => {
      if (task.custom) {
        return { ...c, custom: c.custom.map((t) => (t.id === task.id ? { ...t, dueDate: date || '' } : t)) }
      }
      const dates = { ...(c.dates ?? {}) }
      if (date) dates[task.id] = date
      else delete dates[task.id]
      return { ...c, dates }
    })
  const taskHandlers = { onToggle: toggleTask, onDelete: deleteTask, onReschedule: rescheduleTask }

  const newId = () => `g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const addGuest = (values) => smooth(() => setGuests((list) => [...list, { id: newId(), ...values }]))
  const addGuests = (many) => setGuests((list) => [...list, ...many.map((g) => ({ id: newId(), ...g }))])
  const updateGuest = (id, changes) => setGuests((list) => list.map((g) => (g.id === id ? { ...g, ...changes } : g)))
  const deleteGuest = (id) => {
    const i = guests.findIndex((g) => g.id === id)
    if (i < 0) return
    const g = guests[i]
    smooth(() => setGuests((list) => list.filter((x) => x.id !== id)))
    undoable(`Removed ${g.name}`, () => setGuests((list) => insertAt(list, i, g)))
  }

  // A reply from the invitation's RSVP form: matched by phone number and applied at once,
  // or kept for the couple to review on the Guests page.
  const addReply = (form) => {
    const reply = {
      ...form,
      id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
    }
    const result = receiveReply(guests, reply)
    setGuests(result.guests)
    setReplies((list) => [result.reply, ...list])
    if (!replies.length) celebrate('first-reply', 'Your first RSVP reply is in')
  }
  // A guest reserving a wish-list item on the invitation.
  const reserveGift = (itemId, who) =>
    setGifts((g) => ({ ...g, wishlist: reserveItem(g.wishlist, guests, itemId, who) }))
  const setReply = (id, changes) => setReplies((list) => list.map((r) => (r.id === id ? { ...r, ...changes } : r)))
  const replyActions = {
    link: (reply, guestId) => {
      setGuests((list) => list.map((g) => (g.id === guestId ? { ...g, ...replyChanges(g, reply) } : g)))
      setReply(reply.id, { guestId, state: 'manual' })
    },
    add: (reply, where) => {
      const guestId = newId()
      setGuests((list) => [...list, { id: guestId, ...guestFromReply(reply, where) }])
      setReply(reply.id, { guestId, state: 'added' })
    },
    dismiss: (reply) => setReply(reply.id, { state: 'dismissed' }),
    clear: () => setReplies((list) => list.filter((r) => r.state === 'review')),
  }

  const addTable = (table) => setSeating((s) => ({ ...s, tables: [...s.tables, table] }))
  const updateTable = (id, changes) =>
    setSeating((s) => ({ ...s, tables: s.tables.map((t) => (t.id === id ? { ...t, ...changes } : t)) }))
  // Deleting a table also frees the guests seated at it.
  const deleteTable = (id) => {
    const before = seating
    const name = seating.tables.find((t) => t.id === id)?.name ?? 'the table'
    undoable(`Deleted ${name}; its guests are unassigned`, () => setSeating(before))
    setSeating((s) => ({
      tables: s.tables.filter((t) => t.id !== id),
      assign: Object.fromEntries(
        Object.entries(s.assign).map(([e, a]) => [
          e,
          Object.fromEntries(Object.entries(a).filter(([, t]) => t !== id)),
        ]),
      ),
    }))
  }
  const assignSeat = (eventId, guestId, tableId) =>
    setSeating((s) => {
      const a = { ...(s.assign[eventId] ?? {}) }
      if (tableId) a[guestId] = tableId
      else delete a[guestId]
      return { ...s, assign: { ...s.assign, [eventId]: a } }
    })

  const summary = summarise(vendors, settings)
  const shownGuests = visibleGuests(guests, settings)
  const events = enabledEvents(settings)
  const unseated = unassignedTotal(
    seating,
    shownGuests,
    events.map((e) => e.id),
  )
  const hasTables = seating.tables.some((t) => events.some((e) => e.id === t.event))
  const tasks = buildChecklist(settings, vendors, checklist, guests, seating, invite, procedure)
  const enabledCategories = CATEGORIES.filter((c) => !settings.hiddenCategories.includes(c.id))
  const navCategories = enabledCategories

  // A hidden or unknown category falls back to Home.
  const category =
    route.page === 'category' && enabledCategories.includes(CATEGORY_BY_ID[route.category])
      ? CATEGORY_BY_ID[route.category]
      : null
  const page = route.page === 'category' && !category ? 'home' : route.page

  // The full-screen invite, as a guest would see it (opening animation included).
  if (page === 'invite-preview') {
    return (
      <div className="invite-full">
        <InviteView
          invite={invite}
          settings={settings}
          onReply={addReply}
          wishlist={gifts.wishlist}
          onReserve={reserveGift}
        />
        <a className="invite-back" href="#/invite">
          ‹ Back to the editor
        </a>
      </div>
    )
  }

  const wizardView = wizard && (
    <SetupWizard
      settings={settings}
      invite={invite}
      samples={sampleCounts({ vendors, guests, gifts })}
      again={wizard === 'again'}
      onFinish={finishSetup}
      onClose={() => setWizard(null)}
    />
  )

  return (
    <div className="app">
      {wizardView}
      <Toast toast={toast} onClose={closeToast} />
      <PhoneTabs page={page} menuOpen={menuOpen} onMore={() => setMenuOpen((o) => !o)} />
      <div className="mobile-bar">
        <button
          type="button"
          className="menu-button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="sidebar"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <MenuIcon open={menuOpen} />
        </button>
        <Brand />
        {daysText(summary.next) && <p className="mobile-countdown">{daysText(summary.next)}</p>}
      </div>

      <Sidebar
        route={route}
        categories={navCategories}
        hiddenCount={CATEGORIES.length - enabledCategories.length}
        sample={Object.values(sampleCounts({ vendors, guests, gifts })).some((n) => n > 0)}
        countdown={daysText(summary.next)}
        status={Object.fromEntries(
          categoryStats(summary.visible, settings)
            .filter((c) => c.count > 0)
            .map((c) => [c.id, c.booked === c.count ? 'booked' : 'started']),
        )}
        vendorsOpen={ui.vendorsOpen}
        onToggleVendors={() => setUi((u) => ({ ...u, vendorsOpen: !u.vendorsOpen }))}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <Petals />
      <main className="main">
        {/* Each page rises in as you arrive (keyed by the route so it plays on every visit). */}
        <div className="page-enter" key={page === 'category' ? `category/${route.category}` : page}>
          {page === 'home' && (
            <HomePage
              summary={summary}
              settings={settings}
              tasks={tasks}
              guests={shownGuests}
              vendors={vendors}
              invite={invite}
              gifts={gifts}
              replies={replies}
              procedure={procedure}
              unseated={hasTables ? unseated : 0}
              setup={setup}
              categories={enabledCategories}
              onHideSteps={() => smooth(() => setSetup((s) => ({ ...s, hideSteps: true })))}
              onRunSetup={() => setWizard('again')}
            />
          )}
          {page === 'procedure' && <ProcedureGuide procedure={procedure} settings={settings} onChange={setProcedure} />}
          {page === 'checklist' && (
            <ChecklistPage
              tab={route.tab}
              items={tasks}
              categories={enabledCategories}
              onAdd={addTask}
              {...taskHandlers}
            />
          )}
          {page === 'guests' && (
            <GuestsPage
              guests={shownGuests}
              settings={settings}
              events={events}
              onAdd={addGuest}
              onAddMany={addGuests}
              onUpdate={updateGuest}
              onDelete={deleteGuest}
              allGuests={guests}
              giftTotals={giftsByGuest(gifts.log)}
              replies={replies}
              replyActions={replyActions}
            />
          )}
          {page === 'seating' && (
            <SeatingPage
              tab={route.tab}
              events={events}
              guests={shownGuests}
              seating={seating}
              onAddTable={addTable}
              onUpdateTable={updateTable}
              onDeleteTable={deleteTable}
              onAssign={assignSeat}
            />
          )}
          {page === 'invite' && (
            <InvitePage
              invite={invite}
              settings={settings}
              events={events}
              onChange={(changes) => setInvite((i) => ({ ...i, ...changes }))}
              onReply={addReply}
              wishlist={gifts.wishlist}
              onReserve={reserveGift}
            />
          )}
          {page === 'budget' && (
            <BudgetPage
              settings={settings}
              vendors={summary.visible}
              categories={enabledCategories}
              onChange={updateSettings}
            />
          )}
          {page === 'day' && (
            <DayPage
              tab={route.tab}
              events={events}
              settings={settings}
              vendors={summary.visible}
              guests={shownGuests}
              seating={seating}
              invite={invite}
            />
          )}
          {page === 'gifts' && (
            <GiftsPage
              tab={route.tab}
              gifts={gifts}
              guests={guests}
              events={events}
              invite={invite}
              onChange={setGifts}
              onDeleted={undoable}
            />
          )}
          {page === 'calendar' && (
            <CalendarPage
              settings={settings}
              vendors={summary.visible}
              tasks={tasks}
              categories={enabledCategories}
              onAdd={addTask}
              handlers={taskHandlers}
            />
          )}
          {page === 'settings' && (
            <SettingsPage
              settings={settings}
              onChange={updateSettings}
              onEventChange={updateEvent}
              onToggleCategory={toggleCategory}
              onRunSetup={() => setWizard('again')}
            />
          )}
          {page === 'category' && (
            <CategoryPage
              key={category.id}
              category={category}
              tab={route.event}
              vendors={summary.visible}
              events={events}
              categories={enabledCategories}
              colors={summary.colors}
              tasks={tasks}
              planned={settings.categoryBudgets?.[category.id] ?? 0}
              onAdd={addVendor}
              onUpdate={updateVendor}
              onDelete={deleteVendor}
            />
          )}
        </div>
      </main>
    </div>
  )
}
