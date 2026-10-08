import type { ScaleShape } from './shapes.ts'
import type { FormulaTone, GuitarString } from './theory.ts'

export type SelectedNote = {
  string: GuitarString
  fret: number
  tone: FormulaTone | null
  pitchClass: number
  shapes?: ScaleShape[]
}

type NoteInspectorProps = {
  selected: SelectedNote | null
  keyName: string
  patternLabel: string
  onClear: () => void
}

function pitchClassName(pitchClass: number, preferred: FormulaTone | null): string {
  if (preferred) return preferred.name
  const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
  return names[pitchClass] ?? '?'
}

function roleLabel(role: FormulaTone['role']): string {
  if (role === 'root') return 'Root'
  if (role === 'third') return 'Third (chord tone)'
  if (role === 'fifth') return 'Fifth (chord tone)'
  if (role === 'seventh') return 'Seventh (chord tone)'
  return 'Color / scale tone'
}

export function NoteInspector({ selected, keyName, patternLabel, onClear }: NoteInspectorProps) {
  if (!selected) {
    return (
      <div className="fx-note-inspector is-empty">
        <p>Tap a note on the fretboard to inspect it.</p>
      </div>
    )
  }

  const { string, fret, tone, pitchClass, shapes = [] } = selected
  const noteName = pitchClassName(pitchClass, tone)

  return (
    <div className="fx-note-inspector" aria-live="polite">
      <div className="fx-note-inspector-head">
        <div>
          <p className="fx-kicker">Selected note</p>
          <h3>{noteName}</h3>
        </div>
        <button type="button" className="fx-btn-ghost" onClick={onClear}>
          Clear
        </button>
      </div>
      <dl className="fx-dl">
        <div>
          <dt>String</dt>
          <dd>
            {string.number} ({string.label})
          </dd>
        </div>
        <div>
          <dt>Fret</dt>
          <dd>{fret}</dd>
        </div>
        <div>
          <dt>Key / pattern</dt>
          <dd>
            {keyName} · {patternLabel}
          </dd>
        </div>
        {tone ? (
          <>
            <div>
              <dt>Scale degree</dt>
              <dd>{tone.degreeLabel}</dd>
            </div>
            <div>
              <dt>Interval</dt>
              <dd>
                {tone.intervalName} ({tone.intervalShort})
              </dd>
            </div>
            <div>
              <dt>Function</dt>
              <dd className={`fx-role fx-role-${tone.role}`}>{roleLabel(tone.role)}</dd>
            </div>
          </>
        ) : (
          <div>
            <dt>In pattern</dt>
            <dd>No — outside the current formula</dd>
          </div>
        )}
        {shapes.length > 0 ? (
          <div className="fx-dl-wide">
            <dt>Shapes covering this fret</dt>
            <dd>
              <ul className="fx-shape-coverage">
                {shapes.map((shape) => (
                  <li key={shape.id}>
                    <span className={`fx-shape-swatch fx-shape-${shape.id}`} aria-hidden="true" />
                    {shape.label} · {shape.positionLabel}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
