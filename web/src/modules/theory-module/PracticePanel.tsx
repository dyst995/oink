import { FretboardModule } from '../fretboard-module/index.ts'

type PracticePanelProps = {
  open: boolean
  onClose: () => void
  variant?: 'dock' | 'sheet'
}

export function PracticePanel({ open, onClose, variant = 'dock' }: PracticePanelProps) {
  if (!open) return null

  return (
    <aside
      className={variant === 'sheet' ? 'practice-panel is-sheet' : 'practice-panel'}
      aria-label="Practice tools"
    >
      <div className="practice-panel-head">
        <div>
          <p className="practice-kicker">Practice</p>
          <h2>Fretboard</h2>
        </div>
        <button type="button" className="ui-btn ui-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="practice-lede">
        Try the current idea on the neck. Change key and formula freely — this tool does not auto-grade
        your playing.
      </p>
      <div className="practice-panel-body">
        <FretboardModule />
      </div>
    </aside>
  )
}
