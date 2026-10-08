import type { FormulaTone } from './theory.ts'

export type LabelMode = 'notes' | 'degrees' | 'intervals' | 'chord-tones'
export type FocusMode = 'all' | 'degree' | 'interval' | 'chord-tones'

type FretboardControlsProps = {
  labelMode: LabelMode
  onLabelModeChange: (mode: LabelMode) => void
  showRoots: boolean
  onShowRootsChange: (value: boolean) => void
  showLabels: boolean
  onShowLabelsChange: (value: boolean) => void
  showFretNumbers: boolean
  onShowFretNumbersChange: (value: boolean) => void
  showNonPattern: boolean
  onShowNonPatternChange: (value: boolean) => void
  showShapes: boolean
  onShowShapesChange: (value: boolean) => void
  focusMode: FocusMode
  onFocusModeChange: (mode: FocusMode) => void
  focusDegree: string
  onFocusDegreeChange: (degree: string) => void
  focusInterval: number
  onFocusIntervalChange: (semitones: number) => void
  tones: readonly FormulaTone[]
}

const LABEL_MODES: { id: LabelMode; label: string }[] = [
  { id: 'notes', label: 'Note names' },
  { id: 'degrees', label: 'Scale degrees' },
  { id: 'intervals', label: 'Intervals' },
  { id: 'chord-tones', label: 'Chord tones' },
]

export function FretboardControls({
  labelMode,
  onLabelModeChange,
  showRoots,
  onShowRootsChange,
  showLabels,
  onShowLabelsChange,
  showFretNumbers,
  onShowFretNumbersChange,
  showNonPattern,
  onShowNonPatternChange,
  showShapes,
  onShowShapesChange,
  focusMode,
  onFocusModeChange,
  focusDegree,
  onFocusDegreeChange,
  focusInterval,
  onFocusIntervalChange,
  tones,
}: FretboardControlsProps) {
  return (
    <div className="fx-controls">
      <fieldset className="fx-fieldset">
        <legend>Display</legend>
        <div className="fx-chip-row">
          {LABEL_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={labelMode === mode.id ? 'fx-chip is-active' : 'fx-chip'}
              aria-pressed={labelMode === mode.id}
              onClick={() => onLabelModeChange(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="fx-toggle-row">
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={showRoots}
              onChange={(event) => onShowRootsChange(event.target.checked)}
            />
            Root highlighting
          </label>
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(event) => onShowLabelsChange(event.target.checked)}
            />
            Note labels
          </label>
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={showFretNumbers}
              onChange={(event) => onShowFretNumbersChange(event.target.checked)}
            />
            Fret numbers
          </label>
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={showNonPattern}
              onChange={(event) => onShowNonPatternChange(event.target.checked)}
            />
            Non-pattern notes
          </label>
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={showShapes}
              onChange={(event) => onShowShapesChange(event.target.checked)}
            />
            Shapes
          </label>
        </div>
      </fieldset>

      <fieldset className="fx-fieldset">
        <legend>Study focus</legend>
        <div className="fx-chip-row">
          <button
            type="button"
            className={focusMode === 'all' ? 'fx-chip is-active' : 'fx-chip'}
            aria-pressed={focusMode === 'all'}
            onClick={() => onFocusModeChange('all')}
          >
            All tones
          </button>
          <button
            type="button"
            className={focusMode === 'chord-tones' ? 'fx-chip is-active' : 'fx-chip'}
            aria-pressed={focusMode === 'chord-tones'}
            onClick={() => onFocusModeChange('chord-tones')}
          >
            Chord tones
          </button>
          <button
            type="button"
            className={focusMode === 'degree' ? 'fx-chip is-active' : 'fx-chip'}
            aria-pressed={focusMode === 'degree'}
            onClick={() => onFocusModeChange('degree')}
          >
            One degree
          </button>
          <button
            type="button"
            className={focusMode === 'interval' ? 'fx-chip is-active' : 'fx-chip'}
            aria-pressed={focusMode === 'interval'}
            onClick={() => onFocusModeChange('interval')}
          >
            One interval
          </button>
        </div>

        {focusMode === 'degree' ? (
          <label className="fx-field">
            <span>Degree</span>
            <select
              value={focusDegree}
              onChange={(event) => onFocusDegreeChange(event.target.value)}
            >
              {tones.map((tone) => (
                <option key={tone.degreeLabel} value={tone.degreeLabel}>
                  {tone.degreeLabel} · {tone.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {focusMode === 'interval' ? (
          <label className="fx-field">
            <span>Interval from root</span>
            <select
              value={focusInterval}
              onChange={(event) => onFocusIntervalChange(Number(event.target.value))}
            >
              {tones.map((tone) => (
                <option key={tone.semitones} value={tone.semitones}>
                  {tone.intervalShort} · {tone.intervalName} ({tone.name})
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </fieldset>
    </div>
  )
}
