import { useState } from 'react'
import VendorCard from './VendorCard.jsx'
import VendorForm from './VendorForm.jsx'
import AddLine from './AddLine.jsx'
import CompareQuotes from './CompareQuotes.jsx'
import { bookedCount, committed, formatDate, formatRM, paidSoFar } from '../figures.js'
import { hrefFor } from '../useHashRoute.js'
import { smooth } from '../motion.js'

// One vendor category, with tabs for All and each event that is on.
// This category's checklist tasks, in one quiet line under the title.
function CategoryTasks({ category, tasks }) {
  if (!tasks.length) return null
  const open = tasks.filter((t) => !t.done).sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
  const when = (t) =>
    !t.dueDate ? '' : t.daysLeft < 0 ? `was due ${formatDate(t.dueDate)}` : `due ${formatDate(t.dueDate)}`
  return (
    <p className="category-tasks">
      <span className="category-tasks-label">Checklist</span>
      {open.length === 0 ? (
        <span className="category-tasks-done">✓ All {tasks.length} done</span>
      ) : (
        open.slice(0, 2).map((t) => (
          <a key={t.id} href={`#/checklist/task-${t.id}`} className={t.daysLeft < 0 ? 'is-late' : undefined}>
            {t.title}
            {when(t) && <span> · {when(t)}</span>}
          </a>
        ))
      )}
      {open.length > 2 && <a href={hrefFor({ page: 'checklist', tab: category.id })}>+{open.length - 2} more</a>}
    </p>
  )
}

export default function CategoryPage({
  category,
  tab,
  vendors,
  events,
  categories,
  colors,
  tasks = [],
  planned = 0,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const inCategory = vendors.filter((v) => v.category === category.id)
  const activeTab = events.some((e) => e.id === tab) ? tab : 'all'
  const shown = activeTab === 'all' ? inCategory : inCategory.filter((v) => v.events.includes(activeTab))
  const tabEvent = events.find((e) => e.id === activeTab)

  // Pre-tick only the open tab's event; on "All" nothing is ticked yet.
  const defaultEvents = tabEvent ? [tabEvent.id] : []
  // Where the add form is open: 'top' (header button) or 'bottom' (end of the list / empty page), or null.
  const [adding, setAdding] = useState(null)
  // Switching tabs keeps the page in place (no reload), so an open form closes: its event ticks belong to the old tab.
  const [formTab, setFormTab] = useState(activeTab)
  if (formTab !== activeTab) {
    setFormTab(activeTab)
    setAdding(null)
  }
  // List (cards) or Compare (side by side); Compare needs two or more vendors.
  const [view, setView] = useState('list')
  const canCompare = shown.length >= 2
  const comparing = view === 'compare' && canCompare
  const used = committed(inCategory)

  const tabs = [
    { id: 'all', label: 'All', count: inCategory.length },
    ...events.map((e) => ({
      id: e.id,
      label: e.label,
      count: inCategory.filter((v) => v.events.includes(e.id)).length,
    })),
  ]

  return (
    <>
      <header className="page-head page-head-actions">
        <div>
          <h1 className="page-title">{category.label}</h1>
          <p className="page-sub">
            {inCategory.length ? (
              <>
                {formatRM(committed(inCategory))} committed · {bookedCount(inCategory)} of {inCategory.length} booked ·{' '}
                {formatRM(paidSoFar(inCategory))} paid
              </>
            ) : (
              'No vendors yet. Add the ones you are considering and compare their quotes here.'
            )}
          </p>
          <p className="category-plan">
            {planned ? (
              <>
                Planned <strong>{formatRM(planned)}</strong> ·{' '}
                <span className={used > planned ? 'is-over' : undefined}>
                  {used > planned ? `${formatRM(used - planned)} over` : `${formatRM(planned - used)} left`}
                </span>
              </>
            ) : (
              'No amount planned yet'
            )}{' '}
            · <a href="#/budget">{planned ? 'Change in Budget' : 'Plan it in Budget'}</a>
          </p>
          <CategoryTasks category={category} tasks={tasks.filter((t) => t.category === category.id)} />
        </div>
        {/* The one main "Add a vendor" button; an empty category shows it in the middle instead. */}
        {inCategory.length > 0 && (
          <div className="head-actions">
            <button type="button" className="btn-add" onClick={() => smooth(() => setAdding('top'))}>
              <span aria-hidden="true">+</span> Add a vendor
            </button>
          </div>
        )}
      </header>

      {adding === 'top' && (
        <section className="surface add-surface">
          <h3 className="add-title">Add a vendor{tabEvent ? ` for ${tabEvent.label}` : ''}</h3>
          <VendorForm
            category={category.id}
            events={events}
            defaultEvents={defaultEvents}
            onSubmit={(values) =>
              smooth(() => {
                onAdd(values)
                setAdding(null)
              })
            }
            onCancel={() => smooth(() => setAdding(null))}
          />
        </section>
      )}

      {/* Event tabs only help once there are vendors to sort. */}
      {inCategory.length > 0 && (
        <div className="category-toolbar">
          <nav data-slide className="tabs" aria-label="Events">
            {tabs.map((t) => (
              <a
                key={t.id}
                href={hrefFor({
                  page: 'category',
                  category: category.id,
                  event: t.id,
                })}
                className={`tab${activeTab === t.id ? ' is-active' : ''}`}
                aria-current={activeTab === t.id ? 'page' : undefined}
              >
                {t.label} <span className="tab-count">{t.count}</span>
              </a>
            ))}
          </nav>
          {canCompare && (
            <div data-slide className="view-switch" role="group" aria-label="Show vendors as">
              {[
                ['list', 'List'],
                ['compare', 'Compare'],
              ].map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  className={`view-option${(v === 'compare') === comparing ? ' is-active' : ''}`}
                  aria-pressed={(v === 'compare') === comparing}
                  onClick={() => setView(v)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <h2 className="visually-hidden">
        {tabEvent ? `${category.label} for ${tabEvent.label}` : `All ${category.label}`}
      </h2>

      {/* Vendors sit in their own cards; Compare keeps one box for its side-by-side table. */}
      {(shown.length > 0 || adding === 'bottom') && (
        <section className={comparing ? 'surface list-surface' : 'card-stack'}>
          {comparing && <CompareQuotes vendors={shown} planned={planned} colors={colors} onUpdate={onUpdate} />}
          {shown.length > 0 && !comparing && (
            <ul className="vendor-list item-cards">
              {shown.map((v) => (
                <VendorCard
                  key={v.id}
                  vendor={v}
                  color={colors[v.category]}
                  categories={categories}
                  events={events}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          )}

          {adding === 'bottom' && (
            <div className="add-panel">
              <h3 className="add-title">Add a vendor{tabEvent ? ` for ${tabEvent.label}` : ''}</h3>
              <VendorForm
                category={category.id}
                events={events}
                defaultEvents={defaultEvents}
                onSubmit={(values) =>
                  smooth(() => {
                    onAdd(values)
                    setAdding(null)
                  })
                }
                onCancel={() => smooth(() => setAdding(null))}
              />
            </div>
          )}
          {!adding && shown.length > 0 && (
            <AddLine
              label={`Add another vendor${tabEvent ? ` for ${tabEvent.label}` : ''}`}
              onClick={() => smooth(() => setAdding('bottom'))}
            />
          )}
        </section>
      )}

      {!adding && shown.length === 0 && (
        <div className="empty-inline">
          <div>
            <p>{tabEvent ? `None for ${tabEvent.label} yet.` : 'No vendors here yet.'}</p>
            <p>Paste their website or Instagram link to fill in the details, or type their name.</p>
          </div>
          {inCategory.length === 0 && (
            <button type="button" className="btn-add" onClick={() => smooth(() => setAdding('bottom'))}>
              <span aria-hidden="true">+</span> Add a vendor
            </button>
          )}
        </div>
      )}
    </>
  )
}
