import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { applyTheme, getTheme, setTheme, subscribeTheme, type ThemePreference } from '../lib/theme.ts'
import { groupTopicsByUnit } from '../modules/theory-module/groupTopics.ts'
import { isTheoryTopicOpenable } from '../modules/theory-module/openTopics.ts'
import { THEORY_TOPICS } from '../modules/theory-module/topics.ts'

const TABS = [
  { to: '/theory', label: 'Theory' },
  { to: '/fretboard', label: 'Fretboard' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [theme, setThemeState] = useState<ThemePreference>(getTheme)
  const location = useLocation()
  const [menuPath, setMenuPath] = useState(location.pathname)
  const panelId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const units = groupTopicsByUnit(THEORY_TOPICS)

  if (location.pathname !== menuPath) {
    setMenuPath(location.pathname)
    if (open) setOpen(false)
  }

  useEffect(() => applyTheme(theme), [theme])

  useEffect(() => subscribeTheme(() => setThemeState(getTheme())), [])

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

  function cycleTheme() {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(next)
    setThemeState(next)
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" to="/">
          <span className="site-brand-mark">Unfret</span>
        </Link>

        <nav className="site-nav site-nav-desktop" aria-label="Primary">
          {TABS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'site-nav-link is-active' : 'site-nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header-actions">
          <button
            type="button"
            className="site-tool-btn"
            onClick={cycleTheme}
            aria-label={`Theme: ${theme}. Click to change.`}
            title={`Theme: ${theme}`}
          >
            Theme
          </button>
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
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'site-menu-link is-active' : 'site-menu-link')}>
            Home
          </NavLink>
          {TABS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'site-menu-link is-active' : 'site-menu-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <nav className="site-menu-topics" aria-label="Theory stages">
          <p className="site-menu-section">Curriculum</p>
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
