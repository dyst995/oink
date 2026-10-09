import { NOTE_NAMES, TRAINER_FRET_MAX, TRAINER_STRINGS } from './notes.ts'
import { canBuildSession } from './generate.ts'
import {
  DEFAULT_CONFIG,
  MODE_LABELS,
  type ExerciseMode,
  type TrainerConfig,
} from './types.ts'

type TrainerConfigProps = {
  config: TrainerConfig
  onChange: (config: TrainerConfig) => void
  onStart: () => void
}

const STRING_OPTIONS = TRAINER_STRINGS.map((string) => ({
  number: string.number,
  label: `${string.number}${suffix(string.number)} · ${string.label}`,
}))

function suffix(value: number): string {
  if (value === 1) return 'st'
  if (value === 2) return 'nd'
  if (value === 3) return 'rd'
  return 'th'
}

function toggleMode(modes: ExerciseMode[], mode: ExerciseMode): ExerciseMode[] {
  return modes.includes(mode) ? modes.filter((item) => item !== mode) : [...modes, mode]
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function TrainerConfigPanel({ config, onChange, onStart }: TrainerConfigProps) {
  const readiness = canBuildSession(config)

  return (
    <div className="trainer-config">
      <header className="trainer-intro">
        <h2>Fretboard memorization</h2>
        <p>
          Client-side practice only — this session stays in memory until you leave or reload. No
          accounts, no saved progress.
        </p>
      </header>

      <fieldset className="trainer-fieldset">
        <legend>Exercise types</legend>
        <div className="trainer-chips">
          {(Object.keys(MODE_LABELS) as ExerciseMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={config.modes.includes(mode) ? 'filter-chip is-selected' : 'filter-chip'}
              aria-pressed={config.modes.includes(mode)}
              onClick={() => onChange({ ...config, modes: toggleMode(config.modes, mode) })}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="trainer-fieldset">
        <legend>Strings</legend>
        <p className="trainer-hint">Leave empty to include every string.</p>
        <div className="trainer-chips">
          {STRING_OPTIONS.map((option) => (
            <button
              key={option.number}
              type="button"
              className={
                config.strings.includes(option.number) ? 'filter-chip is-selected' : 'filter-chip'
              }
              aria-pressed={config.strings.includes(option.number)}
              onClick={() =>
                onChange({ ...config, strings: toggleValue(config.strings, option.number) })
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="trainer-fieldset">
        <legend>Notes</legend>
        <p className="trainer-hint">Leave empty to include every pitch class.</p>
        <div className="trainer-chips">
          {NOTE_NAMES.map((note) => (
            <button
              key={note}
              type="button"
              className={config.notes.includes(note) ? 'filter-chip is-selected' : 'filter-chip'}
              aria-pressed={config.notes.includes(note)}
              onClick={() => onChange({ ...config, notes: toggleValue(config.notes, note) })}
            >
              {note}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="trainer-grid-2">
        <label className="trainer-field">
          <span>Fret from</span>
          <input
            type="number"
            min={0}
            max={TRAINER_FRET_MAX}
            value={config.fretMin}
            onChange={(event) =>
              onChange({ ...config, fretMin: Number(event.target.value) || 0 })
            }
          />
        </label>
        <label className="trainer-field">
          <span>Fret to</span>
          <input
            type="number"
            min={0}
            max={TRAINER_FRET_MAX}
            value={config.fretMax}
            onChange={(event) =>
              onChange({
                ...config,
                fretMax: Math.min(TRAINER_FRET_MAX, Number(event.target.value) || 0),
              })
            }
          />
        </label>
        <label className="trainer-field">
          <span>Questions</span>
          <input
            type="number"
            min={1}
            max={80}
            value={config.questionCount}
            onChange={(event) =>
              onChange({
                ...config,
                questionCount: Math.max(1, Math.min(80, Number(event.target.value) || 1)),
              })
            }
          />
        </label>
        <label className="trainer-field">
          <span>Retry after (questions)</span>
          <input
            type="number"
            min={1}
            max={10}
            value={config.retryDelay}
            onChange={(event) =>
              onChange({
                ...config,
                retryDelay: Math.max(1, Math.min(10, Number(event.target.value) || 3)),
              })
            }
          />
        </label>
      </div>

      <fieldset className="trainer-fieldset">
        <legend>Timed practice</legend>
        <label className="trainer-check">
          <input
            type="checkbox"
            checked={config.timed}
            onChange={(event) => onChange({ ...config, timed: event.target.checked })}
          />
          Enable per-question timer
        </label>
        {config.timed ? (
          <label className="trainer-field">
            <span>Seconds per question</span>
            <input
              type="number"
              min={3}
              max={60}
              value={config.timeLimitSec}
              onChange={(event) =>
                onChange({
                  ...config,
                  timeLimitSec: Math.max(3, Math.min(60, Number(event.target.value) || 12)),
                })
              }
            />
          </label>
        ) : null}
      </fieldset>

      {!readiness.ok ? (
        <p className="trainer-error" role="alert">
          {readiness.reason}
        </p>
      ) : null}

      <div className="trainer-actions">
        <button
          type="button"
          className="ui-btn ui-btn-primary"
          disabled={!readiness.ok}
          onClick={onStart}
        >
          Start session
        </button>
        <button
          type="button"
          className="ui-btn ui-btn-ghost"
          onClick={() => onChange({ ...DEFAULT_CONFIG })}
        >
          Reset defaults
        </button>
      </div>
    </div>
  )
}
