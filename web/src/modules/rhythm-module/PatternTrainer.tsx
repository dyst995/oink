import { useMemo, useRef, useState } from 'react'
import { getMetronomeEngine } from './audio/engine.ts'
import { useTransport } from './MetronomeContext.tsx'
import { RhythmStrip } from './RhythmStrip.tsx'
import { StaffNotation } from './StaffNotation.tsx'
import { usePracticeControls } from './usePracticeControls.ts'
import { useRhythmKeys } from './useRhythmKeys.ts'
import {
  barTicks,
  beatTicks,
  DURATIONS,
  meterLabel,
} from './theory/duration.ts'
import {
  evaluateTaps,
  onsetMs,
  toleranceMs,
  type AccuracyReport,
} from './theory/accuracy.ts'
import {
  DIFFICULTIES,
  defaultOptions,
  generatePattern,
  type Difficulty,
} from './theory/generate.ts'
import {
  addBar,
  clearPattern,
  duplicateBar,
  emptyPattern,
  noteIndexAt,
  onsets,
  patternError,
  setNoteTicks,
  toggleTie,
  updateNote,
  type RhythmPattern,
} from './theory/pattern.ts'
import { buildPatternSpec } from './theory/spec.ts'

type PlayMode = 'metro' | 'rhythm' | 'both'
type Phase = 'edit' | 'listen' | 'tap' | 'score'

export function PatternTrainer() {
  const { settings, patterns, savePattern, deletePattern, addStat, read, update, playing, start, stop, tapTempo, changeBpm } =
    usePracticeControls()
  const [pattern, setPattern] = useState(() => emptyPattern(settings.signature, 1))
  const [selected, setSelected] = useState<number | null>(null)
  const [mode, setMode] = useState<PlayMode>('both')
  const [loop, setLoop] = useState(true)
  const [difficulty, setDifficulty] = useState<Difficulty>(3)
  const [bars, setBars] = useState(2)
  const [phase, setPhase] = useState<Phase>('edit')
  const [report, setReport] = useState<AccuracyReport | null>(null)
  const [name, setName] = useState('My rhythm')
  const taps = useRef<number[]>([])
  const originRef = useRef(0)

  const error = patternError(pattern)
  const selectedIndex = selected === null ? -1 : noteIndexAt(pattern, selected)
  const selectedNote = selectedIndex >= 0 ? pattern.notes[selectedIndex] : null

  function apply(next: RhythmPattern | null) {
    if (!next || patternError(next)) return
    setPattern(next)
  }

  function play(nextMode: PlayMode = mode) {
    setPhase('listen')
    setReport(null)
    start(buildPatternSpec(read, pattern, nextMode, loop))
  }

  function beginTap() {
    taps.current = []
    setReport(null)
    setPhase('tap')
    const originTick = settings.countInBars * barTicks(pattern.signature)
    const current = read()
    start(buildPatternSpec(read, pattern, 'metro', false), () => {
      const origin = originRef.current
      const expected = onsetMs(onsets(pattern), current.bpm, beatTicks(pattern.signature))
      const tapsMs = taps.current.map((time) => (time - origin) * 1000 - current.latencyMs)
      const beat = beatTicks(pattern.signature)
      const subdiv = Math.min(...pattern.notes.map((note) => note.ticks), beat)
      const scored = evaluateTaps(expected, tapsMs, toleranceMs(current.bpm, subdiv, beat, difficulty))
      setReport(scored)
      setPhase('score')
      addStat({
        at: new Date().toISOString(),
        kind: 'accuracy',
        accuracy: scored.accuracy,
        deviationMs: scored.meanAbsMs,
      })
    })
    originRef.current = getMetronomeEngine().timeOfTick(originTick) ?? getMetronomeEngine().currentTime()
  }

  useRhythmKeys(
    {
      toggle: () => (playing ? stop() : play()),
      faster: () => changeBpm(1),
      slower: () => changeBpm(-1),
      tapTempo,
      restart: () => play(),
      next: () => generate(),
      previous: () => setPattern(emptyPattern(settings.signature, pattern.bars)),
      stop,
      tap: (audioTime) => {
        if (phase === 'tap') taps.current.push(audioTime)
      },
    },
    phase === 'tap',
  )

  function generate() {
    const next = generatePattern(defaultOptions(difficulty, settings.signature, bars))
    setPattern(next)
    setSelected(null)
    setPhase('edit')
    setReport(null)
  }

  const snap = useTransport()
  const activeTick = useMemo(() => {
    if (!snap.playing || snap.waiting) return null
    const origin = settings.countInBars * barTicks(pattern.signature)
    if (snap.tick < origin) return null
    const local = snap.tick - origin
    const length = pattern.bars * barTicks(pattern.signature)
    return loop ? local % length : local
  }, [snap, settings.countInBars, pattern, loop])

  return (
    <div className="rh-panel">
      <div className="rh-transport">
        <p className="rh-position">
          {meterLabel(pattern.signature)} · {pattern.bars} bar{pattern.bars === 1 ? '' : 's'} · {settings.bpm} BPM
        </p>
        <div className="rh-actions">
          <button type="button" className="rh-btn rh-btn-primary" onClick={() => (playing ? stop() : play())}>
            {playing ? 'Stop' : 'Play'}
          </button>
          <button type="button" className="rh-btn" onClick={beginTap} disabled={Boolean(error)}>
            Tap accuracy
          </button>
          <button type="button" className="rh-btn" onClick={generate}>
            New pattern
          </button>
        </div>
      </div>

      <div className="rh-chip-row" role="group" aria-label="Playback">
        {([
          ['metro', 'Metronome only'],
          ['rhythm', 'Rhythm only'],
          ['both', 'Both'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={mode === id ? 'rh-chip is-active' : 'rh-chip'}
            onClick={() => {
              setMode(id)
              if (playing) play(id)
            }}
          >
            {label}
          </button>
        ))}
        <label className="rh-check">
          <input type="checkbox" checked={loop} onChange={(event) => setLoop(event.target.checked)} />
          Loop
        </label>
      </div>

      <div className="rh-split">
        <label className="rh-field">
          <span>Difficulty</span>
          <select value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value) as Difficulty)}>
            {DIFFICULTIES.map((item) => (
              <option key={item.level} value={item.level}>
                Level {item.level}: {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="rh-field">
          <span>Bars</span>
          <input type="number" min={1} max={8} value={bars} onChange={(event) => setBars(Number(event.target.value) || 1)} />
        </label>
        <label className="rh-field">
          <span>BPM</span>
          <input
            type="number"
            min={20}
            max={300}
            value={settings.bpm}
            onChange={(event) => update({ bpm: Number(event.target.value) })}
          />
        </label>
        <label className="rh-field">
          <span>Tap key</span>
          <input
            value={settings.tapKey}
            maxLength={1}
            onChange={(event) => update({ tapKey: event.target.value || 'j' })}
          />
        </label>
      </div>
      <p className="rh-help">{DIFFICULTIES.find((item) => item.level === difficulty)?.detail}</p>

      <div className="rh-editor-tools">
        <button type="button" className="rh-btn" onClick={() => apply(addBar(pattern))}>Add bar</button>
        <button type="button" className="rh-btn" onClick={() => apply(duplicateBar(pattern, Math.max(0, pattern.bars - 1)))}>
          Duplicate last bar
        </button>
        <button type="button" className="rh-btn" onClick={() => apply(clearPattern(pattern))}>Clear</button>
      </div>

      <RhythmStrip pattern={pattern} selectedStart={selected} activeTick={activeTick} onSelect={setSelected} />
      <div className="rh-scroll">
        <StaffNotation signature={pattern.signature} notes={pattern.notes} bars={pattern.bars} activeTick={activeTick} />
      </div>

      {selectedNote && selectedIndex >= 0 ? (
        <div className="rh-split">
          <label className="rh-field">
            <span>Duration</span>
            <select
              value={selectedNote.ticks}
              onChange={(event) => apply(setNoteTicks(pattern, selectedIndex, Number(event.target.value)))}
            >
              {DURATIONS.map((item) => (
                <option key={item.id} value={item.ticks}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rh-check">
            <input
              type="checkbox"
              checked={selectedNote.rest}
              onChange={(event) => apply(updateNote(pattern, selectedIndex, { rest: event.target.checked, accent: false, tied: false }))}
            />
            Rest
          </label>
          <label className="rh-check">
            <input
              type="checkbox"
              checked={selectedNote.accent}
              disabled={selectedNote.rest}
              onChange={(event) => apply(updateNote(pattern, selectedIndex, { accent: event.target.checked }))}
            />
            Accent
          </label>
          <button type="button" className="rh-btn" onClick={() => apply(toggleTie(pattern, selectedIndex))} disabled={selectedNote.rest}>
            Toggle tie to next
          </button>
        </div>
      ) : (
        <p className="rh-help">Select a block to change its duration, rest, accent, or tie.</p>
      )}

      {error ? <p className="rh-error" role="alert">{error}</p> : null}

      <div className="rh-split">
        <label className="rh-field">
          <span>Save as</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button
          type="button"
          className="rh-btn"
          disabled={Boolean(error)}
          onClick={() =>
            savePattern({
              id: `saved-${Date.now()}`,
              name: name.trim() || 'Saved rhythm',
              pattern,
              savedAt: new Date().toISOString(),
            })
          }
        >
          Save pattern
        </button>
      </div>
      {patterns.length ? (
        <div className="rh-saved">
          {patterns.map((item) => (
            <div key={item.id} className="rh-saved-row">
              <button type="button" className="rh-btn" onClick={() => { setPattern(item.pattern); setSelected(null) }}>
                Load {item.name}
              </button>
              <button type="button" className="rh-btn" onClick={() => deletePattern(item.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {phase === 'tap' ? (
        <p className="rh-help">
          Count-in first, then tap <kbd>{settings.tapKey.toUpperCase()}</kbd> or the pad for each note attack. Rests stay silent.
        </p>
      ) : null}
      {phase === 'tap' ? (
        <button type="button" className="rh-pad" onPointerDown={() => taps.current.push(getMetronomeEngine().currentTime())}>
          Tap
        </button>
      ) : null}
      {report ? <AccuracyCard report={report} /> : null}
    </div>
  )
}

function AccuracyCard({ report }: { report: AccuracyReport }) {
  return (
    <aside className="rh-score" aria-label="Accuracy">
      <p>
        {(report.accuracy * 100).toFixed(0)}% hit · {report.onTime} on time · {report.early} early · {report.late} late ·{' '}
        {report.missed} missed · {report.extras} extra
      </p>
      <p className="rh-help">
        Average |error| {report.meanAbsMs.toFixed(0)} ms · signed {report.meanSignedMs.toFixed(0)} ms · consistency{' '}
        {report.consistencyMs.toFixed(0)} ms. Browser and hardware delay still shape these numbers.
      </p>
      <div className="rh-timeline" aria-hidden="true">
        {report.matches.map((match, index) => (
          <span
            key={index}
            className={`rh-mark is-${match.kind}`}
            style={{ left: `${Math.min(98, Math.max(1, (match.expectedMs / Math.max(1, report.matches.at(-1)?.expectedMs ?? 1)) * 100))}%` }}
          />
        ))}
        {report.extraMs.map((time, index) => (
          <span
            key={`extra-${index}`}
            className="rh-mark is-extra"
            style={{ left: `${Math.min(98, Math.max(1, (time / Math.max(1, report.matches.at(-1)?.expectedMs ?? 1)) * 100))}%` }}
          />
        ))}
      </div>
    </aside>
  )
}
