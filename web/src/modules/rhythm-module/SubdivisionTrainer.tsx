import { useEffect, useRef, useState, type RefObject } from 'react'
import { getMetronomeEngine } from './audio/engine.ts'
import { BeatGrid } from './BeatGrid.tsx'
import { useTransport } from './MetronomeContext.tsx'
import { StaffNotation } from './StaffNotation.tsx'
import { usePracticeControls } from './usePracticeControls.ts'
import { useRhythmKeys } from './useRhythmKeys.ts'
import {
  beatTicks,
  beatsPerBar,
  slotTicks,
  SUBDIVISION_PARTS,
  subdivisionName,
} from './theory/duration.ts'
import { buildMetronomeSpec } from './theory/spec.ts'
import { gridCaption, notesPerBar, notesPerBeat, pickingDirections, TRANSITION_PRESETS, type SubdivisionInterval } from './theory/grid.ts'
import { createSubdivisionClock, subdivisionSummary, type SubdivisionClock } from './theory/subdivision.ts'
import type { Assistance } from './theory/spec.ts'
import { placeInBar } from './theory/schedule.ts'
import { uniformPattern } from './theory/questions.ts'

export function SubdivisionTrainer() {
  const { settings, read, update, playing, start, stop, tapTempo, changeBpm } = usePracticeControls()
  const [mode, setMode] = useState<'single' | 'transition'>('single')
  const [single, setSingle] = useState(settings.parts)
  const [preset, setPreset] = useState(TRANSITION_PRESETS[2]?.id ?? 'q-16')
  const [interval, setInterval] = useState<SubdivisionInterval>({ unit: 'bar', count: 1 })
  const [assistance, setAssistance] = useState<Assistance>('guided')
  const [manual, setManual] = useState(false)
  const [bars, setBars] = useState(8)
  const [unlimited, setUnlimited] = useState(false)
  const [picking, setPicking] = useState(true)
  const [step, setStep] = useState(0)
  const clockRef = useRef<SubdivisionClock | null>(null)

  function sequence() {
    if (mode === 'single') return [single]
    const chosen = TRANSITION_PRESETS.find((item) => item.id === preset)
    if (!chosen || chosen.id === 'random') return SUBDIVISION_PARTS.filter((parts) => slotTicks(settings.signature, parts))
    return chosen.parts.filter((parts) => slotTicks(settings.signature, parts))
  }

  function begin(nextStep = step) {
    const current = read()
    const parts = sequence()
    if (!parts.length) return
    const clock = createSubdivisionClock({
      signature: current.signature,
      sequence: mode === 'single' ? [single] : parts,
      random: mode === 'transition' && preset === 'random',
      choices: parts,
      interval,
      countInBars: current.countInBars,
      manual,
      seed: Math.floor(Math.random() * 100000) + nextStep,
    })
    clock.setManualIndex(nextStep)
    clock.reset()
    clockRef.current = clock
    start(buildMetronomeSpec(read, {
      maxBars: unlimited ? null : bars,
      assistance,
      partsAt: (tick) => clock.partsAtTick(tick),
    }))
  }

  function move(delta: number) {
    const next = Math.max(0, step + delta)
    setStep(next)
    if (manual && playing && clockRef.current) {
      clockRef.current.setManualIndex(next)
      clockRef.current.releaseAfter(getMetronomeEngine().snapshot().tick)
      return
    }
    if (playing || delta === 0) begin(next)
  }

  useRhythmKeys({
    toggle: () => (playing ? stop() : begin()),
    faster: () => changeBpm(1),
    slower: () => changeBpm(-1),
    tapTempo,
    restart: () => begin(0),
    next: () => move(1),
    previous: () => move(-1),
    stop,
  })

  const available = SUBDIVISION_PARTS.filter((parts) => slotTicks(settings.signature, parts))

  return (
    <div className="rh-panel">
      <div className="rh-transport">
        <p className="rh-position">{settings.bpm} BPM · {subdivisionName(single, beatTicks(settings.signature))}</p>
        <div className="rh-actions">
          <button type="button" className="rh-btn rh-btn-primary" onClick={() => (playing ? stop() : begin())}>{playing ? 'Stop' : 'Start'}</button>
          <button type="button" className="rh-btn" onClick={() => move(-1)}>Previous</button>
          <button type="button" className="rh-btn" onClick={() => move(1)}>Next</button>
        </div>
      </div>
      <div className="rh-chip-row">
        <button type="button" className={mode === 'single' ? 'rh-chip is-active' : 'rh-chip'} onClick={() => setMode('single')}>One subdivision</button>
        <button type="button" className={mode === 'transition' ? 'rh-chip is-active' : 'rh-chip'} onClick={() => setMode('transition')}>Transitions</button>
      </div>
      {mode === 'single' ? (
        <div className="rh-chip-row">
          {available.map((parts) => (
            <button key={parts} type="button" className={single === parts ? 'rh-chip is-active' : 'rh-chip'} onClick={() => setSingle(parts)}>
              {subdivisionName(parts, beatTicks(settings.signature))}
            </button>
          ))}
        </div>
      ) : (
        <label className="rh-field">
          <span>Exercise</span>
          <select value={preset} onChange={(event) => setPreset(event.target.value)}>
            {TRANSITION_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      )}
      <div className="rh-split">
        <label className="rh-field">
          <span>Change every</span>
          <select
            value={`${interval.count}-${interval.unit}`}
            onChange={(event) => {
              const [count, unit] = event.target.value.split('-')
              setInterval({ count: Number(count), unit: unit === 'beat' ? 'beat' : 'bar' })
            }}
          >
            <option value="1-beat">Beat</option>
            <option value="2-beat">2 beats</option>
            <option value="1-bar">Bar</option>
            <option value="2-bar">2 bars</option>
            <option value="4-bar">4 bars</option>
          </select>
        </label>
        <label className="rh-field">
          <span>Bars</span>
          <input type="number" min={1} max={64} value={bars} disabled={unlimited} onChange={(event) => setBars(Number(event.target.value) || 1)} />
        </label>
        <label className="rh-check"><input type="checkbox" checked={unlimited} onChange={(event) => setUnlimited(event.target.checked)} /> Unlimited</label>
        <label className="rh-check"><input type="checkbox" checked={manual} onChange={(event) => setManual(event.target.checked)} /> Manual next</label>
        <label className="rh-check"><input type="checkbox" checked={picking} onChange={(event) => setPicking(event.target.checked)} /> Picking guide</label>
        <label className="rh-field">
          <span>BPM</span>
          <input type="number" min={20} max={300} value={settings.bpm} onChange={(event) => update({ bpm: Number(event.target.value) })} />
        </label>
      </div>
      <div className="rh-chip-row" role="group" aria-label="Assistance">
        {(['guided', 'intermediate', 'independent'] as const).map((level) => (
          <button key={level} type="button" className={assistance === level ? 'rh-chip is-active' : 'rh-chip'} onClick={() => setAssistance(level)}>
            {level === 'guided' ? 'Guided' : level === 'intermediate' ? 'Intermediate' : 'Independent'}
          </button>
        ))}
      </div>
      <p className="rh-help">
        {assistance === 'guided' ? 'You hear the beat and the subdivision, and the counting stays on screen.' : null}
        {assistance === 'intermediate' ? 'You hear only the main beats. The subdivision stays visible.' : null}
        {assistance === 'independent' ? 'You hear only the main beats. Inner counts stay hidden.' : null}
      </p>
      <SubdivisionStage clockRef={clockRef} assistance={assistance} picking={picking} single={single} />
    </div>
  )
}

function SubdivisionStage({
  clockRef,
  assistance,
  picking,
  single,
}: {
  clockRef: RefObject<SubdivisionClock | null>
  assistance: Assistance
  picking: boolean
  single: number
}) {
  const { settings } = usePracticeControls()
  const snap = useTransport()
  const [parts, setParts] = useState(single)
  const [upcoming, setUpcoming] = useState<{ parts: number; ticksLeft: number } | null>(null)

  useEffect(() => {
    const clock = clockRef.current
    if (!snap.playing || !clock) {
      setParts(single)
      setUpcoming(null)
      return
    }
    setParts(clock.partsAtTick(snap.tick))
    setUpcoming(clock.upcoming(snap.tick))
  }, [clockRef, snap.playing, snap.tick, single])

  const place = snap.playing && !snap.waiting ? placeInBar(snap.tick, settings.signature, parts) : null
  const pattern = uniformPattern(settings.signature, 1, parts)
  const picks = picking ? pickingDirections(parts) : null
  return (
    <div className="rh-stage">
      <p className="rh-position">
        Now: {subdivisionSummary(settings.signature, parts)} · {gridCaption(settings.signature, parts)} · {notesPerBeat(parts)} per beat · {notesPerBar(settings.signature, parts)} per bar
        {place ? ` · bar ${Math.max(1, place.bar - settings.countInBars + 1)} beat ${place.beat + 1}` : ''}
      </p>
      {upcoming && upcoming.parts !== parts ? (
        <p className="rh-help">Next: {subdivisionName(upcoming.parts, beatTicks(settings.signature))}{upcoming.ticksLeft >= 0 ? ` in ${Math.max(1, Math.ceil(upcoming.ticksLeft / beatTicks(settings.signature)))} beats` : ' when you continue'}</p>
      ) : null}
      {picks ? <p className="rh-help">Pick: {picks.join(' ')}</p> : null}
      <BeatGrid
        signature={settings.signature}
        parts={parts}
        activeSlot={place?.slotInBar ?? -1}
        showInner={assistance !== 'independent'}
        showPicking={picking}
      />
      <div className="rh-scroll">
        <StaffNotation
          signature={settings.signature}
          notes={pattern.notes}
          bars={1}
          activeTick={snap.playing && !snap.waiting && place ? (place.beat * beatTicks(settings.signature) + place.slotInBeat * (beatTicks(settings.signature) / parts)) : null}
        />
      </div>
      <p className="rh-help">{beatsPerBar(settings.signature)} beats · meter stays at the BPM you set while the subdivision changes.</p>
    </div>
  )
}
