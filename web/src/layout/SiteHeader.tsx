export type SiteTab = 'fretboard' | 'theory' | 'flashcards'

const TABS: { id: SiteTab; label: string }[] = [
  { id: 'fretboard', label: 'Fretboard' },
  { id: 'theory', label: 'Theory' },
  { id: 'flashcards', label: 'Flashcards' },
]

type SiteHeaderProps = {
  tab: SiteTab
  onTabChange: (tab: SiteTab) => void
}

export function SiteHeader({ tab, onTabChange }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <p className="site-brand">musical</p>
        <nav className="site-nav" aria-label="Primary">
          {TABS.map((item) => {
            const selected = item.id === tab
            return (
              <button
                key={item.id}
                type="button"
                className={selected ? 'site-nav-link is-active' : 'site-nav-link'}
                aria-current={selected ? 'page' : undefined}
                onClick={() => onTabChange(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
