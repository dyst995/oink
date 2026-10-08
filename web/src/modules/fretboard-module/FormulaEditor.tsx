import type { FormulaKind } from './theory.ts'
import { formulaKindHint } from './theory.ts'

type FormulaEditorProps = {
  formula: string
  kind: FormulaKind
  error: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onFormulaChange: (formula: string) => void
  onKindChange: (kind: FormulaKind) => void
}

const KINDS: { id: FormulaKind; label: string }[] = [
  { id: 'degrees', label: 'Scale degrees' },
  { id: 'steps', label: 'Step intervals' },
  { id: 'offsets', label: 'Semitone offsets' },
]

export function FormulaEditor({
  formula,
  kind,
  error,
  open,
  onOpenChange,
  onFormulaChange,
  onKindChange,
}: FormulaEditorProps) {
  return (
    <div className="fx-formula">
      <button
        type="button"
        className="fx-disclosure"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span>Advanced formula</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {open ? (
        <div className="fx-formula-body">
          <div className="fx-kind-tabs" role="radiogroup" aria-label="Formula mode">
            {KINDS.map((item) => (
              <label key={item.id} className={kind === item.id ? 'fx-chip is-active' : 'fx-chip'}>
                <input
                  type="radio"
                  name="formula-kind"
                  value={item.id}
                  checked={kind === item.id}
                  onChange={() => onKindChange(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>

          <label className="fx-field">
            <span>Custom formula</span>
            <input
              value={formula}
              onChange={(event) => onFormulaChange(event.target.value)}
              placeholder={formulaKindHint(kind)}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby="fx-formula-hint"
            />
            <span className="fx-hint" id="fx-formula-hint">
              {formulaKindHint(kind)}
            </span>
          </label>

          {error ? (
            <p className="fx-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
