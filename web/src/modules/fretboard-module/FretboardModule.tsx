import { useMemo, useState } from 'react'
import { FormulaEditor } from './FormulaEditor.tsx'
import { Fretboard } from './Fretboard.tsx'
import {
  FretboardControls,
  type FocusMode,
  type LabelMode,
} from './FretboardControls.tsx'
import { NoteInspector, type SelectedNote } from './NoteInspector.tsx'
import { PatternSelector } from './PatternSelector.tsx'
import { TheoryInspector } from './TheoryInspector.tsx'
import {
  KEY_OPTIONS,
  findPresetByFormula,
  parseFormula,
  parseKey,
  type FormulaKind,
  type FormulaPreset,
} from './theory.ts'
import './fretboard.css'

const DEFAULT_KEY = 'C'
const DEFAULT_FORMULA = '1 2 3 4 5 6 7'

export function FretboardModule() {
  const [keyId, setKeyId] = useState(DEFAULT_KEY)
  const [formula, setFormula] = useState(DEFAULT_FORMULA)
  const [formulaKind, setFormulaKind] = useState<FormulaKind>('degrees')
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [labelMode, setLabelMode] = useState<LabelMode>('notes')
  const [showRoots, setShowRoots] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showFretNumbers, setShowFretNumbers] = useState(true)
  const [showNonPattern, setShowNonPattern] = useState(false)
  const [focusMode, setFocusMode] = useState<FocusMode>('all')
  const [focusDegree, setFocusDegree] = useState('1')
  const [focusInterval, setFocusInterval] = useState(0)
  const [selected, setSelected] = useState<SelectedNote | null>(null)

  const parsed = useMemo(() => {
    try {
      const key = parseKey(keyId)
      const result = parseFormula(formula, key, formulaKind)
      return { key, result, error: null as string | null }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Enter a valid formula.'
      return { key: null, result: null, error: message }
    }
  }, [formula, formulaKind, keyId])

  const tones = parsed.result?.tones ?? []
  const pattern = findPresetByFormula(formula)
  const patternLabel = pattern?.label ?? 'Custom formula'
  const activeFocusDegree = tones.some((tone) => tone.degreeLabel === focusDegree)
    ? focusDegree
    : (tones[0]?.degreeLabel ?? '1')
  const activeFocusInterval = tones.some((tone) => tone.semitones === focusInterval)
    ? focusInterval
    : (tones[0]?.semitones ?? 0)
  const resolvedSelected = selected
    ? {
        ...selected,
        tone: tones.find((item) => item.pitchClass === selected.pitchClass) ?? null,
      }
    : null

  function handlePreset(preset: FormulaPreset) {
    setFormula(preset.formula)
    setFormulaKind(preset.kind ?? 'degrees')
    if (preset.category === 'custom') setFormulaOpen(true)
  }

  return (
    <section className="fretboard-module" aria-label="Fretboard explorer">
      <header className="fx-hero">
        <p className="fx-kicker">Explorer</p>
        <h1>Fretboard</h1>
        <p>
          Choose a root and pattern, then inspect notes on the neck. Standard tuning, low to high:
          E A D G B e.
        </p>
      </header>

      <section className="fx-config" aria-label="Configuration">
        <div className="fx-config-row">
          <label className="fx-field fx-root">
            <span>Root</span>
            <select value={keyId} onChange={(event) => setKeyId(event.target.value)}>
              {KEY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {parseKey(option).name}
                </option>
              ))}
            </select>
          </label>

          <PatternSelector formula={formula} onSelect={handlePreset} />
        </div>

        <FormulaEditor
          formula={formula}
          kind={formulaKind}
          error={parsed.error}
          open={formulaOpen}
          onOpenChange={setFormulaOpen}
          onFormulaChange={(value) => {
            setFormula(value)
            if (!formulaOpen) setFormulaOpen(true)
          }}
          onKindChange={setFormulaKind}
        />

        {parsed.error && !formulaOpen ? (
          <p className="fx-error" role="alert">
            {parsed.error}
          </p>
        ) : null}

        <FretboardControls
          labelMode={labelMode}
          onLabelModeChange={setLabelMode}
          showRoots={showRoots}
          onShowRootsChange={setShowRoots}
          showLabels={showLabels}
          onShowLabelsChange={setShowLabels}
          showFretNumbers={showFretNumbers}
          onShowFretNumbersChange={setShowFretNumbers}
          showNonPattern={showNonPattern}
          onShowNonPatternChange={setShowNonPattern}
          focusMode={focusMode}
          onFocusModeChange={setFocusMode}
          focusDegree={activeFocusDegree}
          onFocusDegreeChange={setFocusDegree}
          focusInterval={activeFocusInterval}
          onFocusIntervalChange={setFocusInterval}
          tones={tones}
        />
      </section>

      <section className="fx-stage" aria-label="Interactive fretboard">
        <Fretboard
          tones={tones}
          labelMode={labelMode}
          showRoots={showRoots}
          showLabels={showLabels}
          showFretNumbers={showFretNumbers}
          showNonPattern={showNonPattern}
          focusMode={focusMode}
          focusDegree={activeFocusDegree}
          focusInterval={activeFocusInterval}
          selected={resolvedSelected}
          onSelect={(note) =>
            setSelected((current) =>
              current?.string.id === note.string.id && current.fret === note.fret ? null : note,
            )
          }
        />

        <ul className="fx-legend" aria-label="Note legend">
          <li>
            <span className="fx-role-dot fx-role-root" aria-hidden="true" /> Root
          </li>
          <li>
            <span className="fx-role-dot fx-role-third" aria-hidden="true" /> Third
          </li>
          <li>
            <span className="fx-role-dot fx-role-fifth" aria-hidden="true" /> Fifth
          </li>
          <li>
            <span className="fx-role-dot fx-role-seventh" aria-hidden="true" /> Seventh
          </li>
          <li>
            <span className="fx-role-dot fx-role-other" aria-hidden="true" /> Other
          </li>
        </ul>

        <NoteInspector
          selected={resolvedSelected}
          keyName={parsed.key?.name ?? keyId}
          patternLabel={patternLabel}
          onClear={() => setSelected(null)}
        />
      </section>

      {parsed.key && parsed.result ? (
        <TheoryInspector
          keyData={parsed.key}
          kind={parsed.result.kind}
          formula={formula}
          patternLabel={patternLabel}
          tones={tones}
        />
      ) : (
        <aside className="fx-theory is-empty" aria-label="Theory inspector">
          <p>Enter a valid formula to see theory details for the current selection.</p>
        </aside>
      )}
    </section>
  )
}
