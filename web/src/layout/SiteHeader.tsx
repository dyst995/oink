import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { groupTopicsByUnit } from '../modules/theory-module/groupTopics.ts'
import { isTheoryTopicOpenable } from '../modules/theory-module/openTopics.ts'
import { THEORY_TOPICS } from '../modules/theory-module/topics.ts'

const TABS = [
  { to: '/fretboard', label: 'Fretboard' },
  { to: '/theory', label: 'Theory' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const [menuPath, setMenuPath] = useState(location.pathname)
  const panelId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const units = groupTopicsByUnit(THEORY_TOPICS)

  if (location.pathname !== menuPath) {
    setMenuPath(location.pathname)
    if (open) setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <p className="site-brand">musical</p>

        <nav className="site-nav site-nav-desktop" aria-label="Primary">
          {TABS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'site-nav-link is-active' : 'site-nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={open ? 'site-burger is-open' : 'site-burger'}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="site-burger-lines" aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <button
          type="button"
          className="site-menu-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        id={panelId}
        className={open ? 'site-menu is-open' : 'site-menu'}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
      >
        <div className="site-menu-header">
          <p className="site-menu-title">Menu</p>
          <button
            ref={closeRef}
            type="button"
            className="site-menu-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>

        <nav className="site-menu-nav" aria-label="Primary">
          {TABS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'site-menu-link is-active' : 'site-menu-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <nav className="site-menu-topics" aria-label="Theory topics">
          <p className="site-menu-section">Theory</p>
          <NavLink
            to="/theory"
            end
            className={({ isActive }) =>
              isActive ? 'site-menu-link is-active' : 'site-menu-link'
            }
          >
            Curriculum
          </NavLink>
          {units.map((group) => (
            <div key={group.unit} className="site-menu-unit">
              <p className="site-menu-unit-label">{group.unit}</p>
              {group.topics.map((topic) =>
                isTheoryTopicOpenable(topic.id) ? (
                  <NavLink
                    key={topic.id}
                    to={`/theory/${topic.id}`}
                    className={({ isActive }) =>
                      isActive ? 'site-menu-link is-active' : 'site-menu-link'
                    }
                  >
                    {topic.title}
                  </NavLink>
                ) : (
                  <span key={topic.id} className="site-menu-link is-disabled">
                    {topic.title}
                  </span>
                ),
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  )
}
