import { useMemo } from 'react'
import { buildScaleShapes } from '../shapes.ts'
import { FRET_COUNT, GUITAR_STRINGS, KEY_OPTIONS, parseKey } from '../theory.ts'
import { TRAINER_SCALES, scaleSummary, scopeError } from './engine.ts'
import type { FretVariation, MissMemory, TrainerSettings } from './types.ts'
import { EXERCISE_MODES, MODE_LABELS } from './types.ts'

type TrainerSetupProps = {
  settings: TrainerSettings
  memory: MissMemory
  onChange: (settings: TrainerSettings) => void
  onStart: () => void
}

const VARIATIONS: { id: FretVariation; label: string }[] = [
  { id: 'string', label: 'Named string' },
  { id: 'any', label: 'Any position' },
]

function toggleItem<T>(items: readonly T[], item: T): T[] {
  return items.includes(item) ? items.filter((entry) => entry !== item) : [...items, item]
}

function stringChip(number: number, label: string): string {
  if (number === 6 && label === 'E') return 'Low E'
  if (number === 1 && label === 'e') return 'High e'
  return label
}

function hasMisses(memory: MissMemory): boolean {
  return (
    Object.keys(memory.notes).length > 0 ||
    Object.keys(memory.degrees).length > 0 ||
    Object.keys(memory.positions).length > 0
  )
}

export function TrainerSetup({ settings, memory, onChange, onStart }: TrainerSetupProps) {
  const error = scopeError(settings)
  const summary = scaleSummary(settings.tonic, settings.scaleId)
  const shapes = useMemo(
    () => buildScaleShapes(parseKey(settings.tonic).pitchClass),
    [settings.tonic],
  )
  const selectedStrings = settings.stringNumbers ?? GUITAR_STRINGS.map((string) => string.number)

  function patch(partial: Partial<TrainerSettings>) {
    onChange({ ...settings, ...partial })
  }

  return (
    <form
      className="fx-config fx-setup"
      aria-label="Practice setup"
      onSubmit={(event) => {
        event.preventDefault()
        if (!error) onStart()
      }}
    >
      <div className="fx-setup-grid">
        <label className="fx-field">
          <span>Tonic</span>
          <select value={settings.tonic} onChange={(event) => patch({ tonic: event.target.value })}>
            {KEY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {parseKey(option).name}
              </option>
            ))}
          </select>
        </label>

        <label className="fx-field">
          <span>Scale</span>
          <select value={settings.scaleId} onChange={(event) => patch({ scaleId: event.target.value })}>
            {(['scales', 'pentatonics', 'modes'] as const).map((category) => (
              <optgroup
                key={category}
                label={category === 'pentatonics' ? 'Pentatonic and blues' : category === 'modes' ? 'Modes' : 'Scales'}
              >
                {TRAINER_SCALES.filter((preset) => preset.category === category).map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      {summary ? (
        <p className="fx-scale-preview">
          <span>{summary.context}</span>
          <span>{summary.notes}</span>
          <span>{summary.degrees}</span>
        </p>
      ) : null}

      <fieldset className="fx-fieldset">
        <legend>Exercises</legend>
        <div className="fx-chip-row">
          {EXERCISE_MODES.map((mode) => {
            const active = settings.modes.includes(mode)
            return (
              <button
                key={mode}
                type="button"
                className={active ? 'fx-chip is-active' : 'fx-chip'}
                aria-pressed={active}
                onClick={() =>
                  patch({
                    modes: EXERCISE_MODES.filter((item) => toggleItem(settings.modes, mode).includes(item)),
                  })
                }
              >
                {MODE_LABELS[mode]}
              </button>
            )
          })}
        </div>
      </fieldset>

      {settings.modes.includes('note-to-fret') ? (
        <fieldset className="fx-fieldset">
          <legend>Note → fret asks for</legend>
          <div className="fx-chip-row">
            {VARIATIONS.map((variation) => {
              const active = settings.variations.includes(variation.id)
              return (
                <button
                  key={variation.id}
                  type="button"
                  className={active ? 'fx-chip is-active' : 'fx-chip'}
                  aria-pressed={active}
                  onClick={() =>
                    patch({
                      variations: VARIATIONS.map((item) => item.id).filter((item) =>
                        toggleItem(settings.variations, variation.id).includes(item),
                      ),
                    })
                  }
                >
                  {variation.label}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="fx-fieldset">
        <legend>Fretboard range</legend>
        <div className="fx-chip-row">
          {(
            [
              ['entire', 'Entire fretboard'],
              ['custom', 'Custom range'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={settings.range === id ? 'fx-chip is-active' : 'fx-chip'}
              aria-pressed={settings.range === id}
              onClick={() => patch({ range: id })}
            >
              {label}
            </button>
          ))}
        </div>

        {settings.range === 'custom' ? (
          <div className="fx-setup-custom">
            <div className="fx-setup-frets">
              <label className="fx-field">
                <span>From fret</span>
                <input
                  type="number"
                  min={0}
                  max={FRET_COUNT}
                  value={settings.fretMin}
                  onChange={(event) => patch({ fretMin: event.target.valueAsNumber })}
                />
              </label>
              <label className="fx-field">
                <span>To fret</span>
                <input
                  type="number"
                  min={0}
                  max={FRET_COUNT}
                  value={settings.fretMax}
                  onChange={(event) => patch({ fretMax: event.target.valueAsNumber })}
                />
              </label>
              <label className="fx-field">
                <span>Shape</span>
                <select
                  value={settings.shapeId ?? ''}
                  onChange={(event) =>
                    patch({ shapeId: event.target.value ? Number(event.target.value) : null })
                  }
                >
                  <option value="">Any shape</option>
                  {shapes.map((shape) => (
                    <option key={shape.id} value={shape.id}>
                      {shape.label} · {shape.caged} · {shape.positionLabel}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="fx-chip-row" role="group" aria-label="Strings">
              {GUITAR_STRINGS.map((string) => {
                const active = selectedStrings.includes(string.number)
                return (
                  <button
                    key={string.id}
                    type="button"
                    className={active ? 'fx-chip is-active' : 'fx-chip'}
                    aria-pressed={active}
                    onClick={() => {
                      const next = toggleItem(selectedStrings, string.number)
                      patch({
                        stringNumbers: next.length === GUITAR_STRINGS.length ? null : next,
                      })
                    }}
                  >
                    {stringChip(string.number, string.label)}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="fx-fieldset">
        <legend>Session</legend>
        <div className="fx-setup-session">
          <label className="fx-field">
            <span>Cards</span>
            <input
              type="number"
              min={1}
              max={200}
              disabled={settings.questionCount == null}
              value={settings.questionCount ?? 20}
              onChange={(event) => patch({ questionCount: event.target.valueAsNumber })}
            />
          </label>
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={settings.questionCount == null}
              onChange={(event) => patch({ questionCount: event.target.checked ? null : 20 })}
            />
            Unlimited
          </label>
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={settings.trackTime}
              onChange={(event) => patch({ trackTime: event.target.checked })}
            />
            Time answers
          </label>
          {settings.trackTime ? (
            <label className="fx-field">
              <span>Limit in seconds</span>
              <input
                type="number"
                min={3}
                max={120}
                placeholder="No limit"
                value={settings.timeLimitSec ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  patch({ timeLimitSec: value === '' ? null : event.target.valueAsNumber })
                }}
              />
            </label>
          ) : null}
        </div>
        <div className="fx-toggle-row">
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={settings.autoAdvance}
              onChange={(event) => patch({ autoAdvance: event.target.checked })}
            />
            Advance automatically
          </label>
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={settings.prioritizeMisses}
              onChange={(event) => patch({ prioritizeMisses: event.target.checked })}
            />
            Prioritize missed answers
          </label>
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={settings.hideBoardUntilReveal}
              onChange={(event) => patch({ hideBoardUntilReveal: event.target.checked })}
            />
            Hide fretboard until the answer
          </label>
        </div>
        {settings.prioritizeMisses && hasMisses(memory) ? (
          <p className="fx-hint">Earlier misses on this device will show up more often.</p>
        ) : null}
      </fieldset>

      {error ? (
        <p className="fx-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="fx-card-actions">
        <button type="submit" className="fx-btn fx-btn-primary" disabled={Boolean(error)}>
          Start practice
        </button>
      </div>
    </form>
  )
}
