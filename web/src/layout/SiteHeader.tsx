import type { KeyboardEvent } from 'react'

export type SiteTab = 'fretboard' | 'theory'

const TABS: { id: SiteTab; label: string }[] = [
  { id: 'fretboard', label: 'fretboard' },
  { id: 'theory', label: 'Theory' },
]

type SiteHeaderProps = {
  tab: SiteTab
  onChange: (tab: SiteTab) => void
}

export function SiteHeader({ tab, onChange }: SiteHeaderProps) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const index = TABS.findIndex((item) => item.id === tab)
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const next = TABS[(index + direction + TABS.length) % TABS.length]
    onChange(next.id)
    document.getElementById(`tab-${next.id}`)?.focus()
  }

  return (
    <header className="site-header">
      <div className="site-nav" role="tablist" aria-label="Primary" onKeyDown={onKeyDown}>
        {TABS.map((item) => {
          const selected = item.id === tab
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              className={selected ? 'site-tab is-active' : 'site-tab'}
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
