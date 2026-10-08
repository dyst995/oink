import { useMemo, useState } from 'react'
import { Fretboard } from './Fretboard.tsx'
import {
  FORMULA_PRESETS,
  KEY_OPTIONS,
  formulaKindLabel,
  normalizeFormula,
  parseFormula,
  parseKey,
} from './theory.ts'
import './fretboard.css'

const DEFAULT_KEY = 'C'
const DEFAULT_FORMULA = '1 2 3 4 5 6 7'

export function FretboardModule() {
  const [keyId, setKeyId] = useState(DEFAULT_KEY)
  const [formula, setFormula] = useState(DEFAULT_FORMULA)

  const parsed = useMemo(() => {
    try {
      const key = parseKey(keyId)
      const result = parseFormula(formula, key)
      return { key, result, error: null }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Enter a valid formula.'
      return { key: null, result: null, error: message }
    }
  }, [formula, keyId])

  const normalizedFormula = normalizeFormula(formula)

  return (
    <section className="fretboard-module">
      <div className="panel">
        <div className="controls">
          <label className="field">
            <span>Key</span>
            <select value={keyId} onChange={(event) => setKeyId(event.target.value)}>
              {KEY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {parseKey(option).name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Interval formula</span>
            <input
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
              placeholder="1 2 b3 4 5 b6 b7"
              spellCheck={false}
              autoComplete="off"
              aria-invalid={parsed.error ? true : undefined}
              aria-describedby="formula-hint"
            />
            <span className="hint" id="formula-hint">
              Degrees such as 1 2 b3 4 5 b6 b7, steps such as 2-2-1-2-2-2-1, or offsets such as 0
              2 4 5 7 9 11.
            </span>
          </label>
        </div>

        <div className="presets" role="group" aria-label="Formula presets">
          {FORMULA_PRESETS.map((preset) => {
            const selected = normalizeFormula(preset.formula) === normalizedFormula
            return (
              <button
                key={preset.id}
                type="button"
                className={selected ? 'preset is-selected' : 'preset'}
                aria-pressed={selected}
                onClick={() => setFormula(preset.formula)}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      {parsed.error ? (
        <p className="status status-error" role="alert">
          {parsed.error}
        </p>
      ) : parsed.result && parsed.key ? (
        <p className="status">
          {parsed.key.name}, read as {formulaKindLabel(parsed.result.kind)}. Showing{' '}
          {parsed.result.tones.map((tone) => tone.name).join(' ')}.
        </p>
      ) : null}

      <Fretboard tones={parsed.result?.tones ?? []} />

      <p className="tuning">Standard tuning, low to high: E A D G B e. The gold note is the root.</p>

      {parsed.result && parsed.result.tones.length > 0 ? (
        <ul className="legend">
          {parsed.result.tones.map((tone) => (
            <li key={`${tone.degreeLabel}-${tone.name}`}>
              <span className={tone.isRoot ? 'swatch swatch-root' : 'swatch'} aria-hidden="true" />
              <span>
                {tone.degreeLabel} · {tone.name}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
