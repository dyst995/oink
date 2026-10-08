import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/fretboard', label: 'Fretboard' },
  { to: '/theory', label: 'Theory' },
  { to: '/flashcards', label: 'Flashcards' },
] as const

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <p className="site-brand">musical</p>
        <nav className="site-nav" aria-label="Primary">
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
      </div>
    </header>
  )
}
