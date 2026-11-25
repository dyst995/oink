import { useRef, useState } from 'react'
import { BeatGrid } from './BeatGrid.tsx'
import { useTransport } from './MetronomeContext.tsx'
import { StaffNotation } from './StaffNotation.tsx'
import { usePracticeControls } from './usePracticeControls.ts'
import { useRhythmKeys } from './useRhythmKeys.ts'
import { getMetronomeEngine } from './audio/engine.ts'
import {
  beatGroups,
  beatTicks,
  beatUnitLabel,
  beatsPerBar,
  clampBpm,
  meterLabel,
  METER_PRESETS,
  signatureError,
  slotTicks,
  SUBDIVISION_PARTS,
  subdivisionName,
  type Denominator,
  type TimeSignature,
} from './theory/duration.ts'
import { accentMapFor, buildMetronomeSpec } from './theory/spec.ts'
import { cycleAccent, notesPerBar } from './theory/grid.ts'
import { uniformPattern } from './theory/questions.ts'
import { gapSilent, placeInBar } from './theory/schedule.ts'
import { estimateLatency } from './theory/accuracy.ts'
import { bpmForBar, nextTempoStep } from './theory/tempo.ts'

export function MetronomePanel() {
  const practice = usePracticeControls()
  const { settings, update, read, playing, start, stop, tapTempo, changeBpm } = practice
  const [calibrating, setCalibrating] = useState(false)
  const [calibrationNote, setCalibrationNote] = useState('')
  const calibrationTaps = useRef<number[]>([])

  function play(maxBars?: number | null, onEnded?: () => void) {
    return start(buildMetronomeSpec(read, { maxBars }), onEnded)
  }

  function calibrate() {
    const snapshot = read()
    calibrationTaps.current = []
    setCalibrating(true)
    setCalibrationNote('Tap along with the clicks.')
    play(1, () => {
      const beat = beatTicks(snapshot.signature)
      const originTick = snapshot.countInBars * beatsPerBar(snapshot.signature) * beat
      const origin = getMetronomeEngine().timeOfTick(originTick)
      if (origin === null) {
        setCalibrationNote('Play the clicks again and tap each one.')
        setCalibrating(false)
        return
      }
      const beatMs = (60 / snapshot.bpm) * 1000
      const pairs = calibrationTaps.current.map((tap) => {
        const elapsed = (tap - origin) * 1000
        const nearest = Math.round(elapsed / beatMs) * beatMs
        return { clickMs: nearest, tapMs: elapsed }
      })
      const latency = estimateLatency(pairs)
      setCalibrating(false)
      if (latency === null) {
        setCalibrationNote('Need at least three taps close to the clicks.')
        return
      }
      update({ latencyMs: latency })
      setCalibrationNote(`Saved ${latency} ms. Scores subtract this delay.`)
    })
  }

  useRhythmKeys(
    {
      toggle: () => (playing ? stop() : play()),
      faster: () => changeBpm(1),
      slower: () => changeBpm(-1),
      tapTempo,
      restart: () => play(),
      next: () => update({ tempo: { ...read().tempo, approvedStep: read().tempo.approvedStep + 1 } }),
      previous: () => update({ tempo: { ...read().tempo, approvedStep: Math.max(0, read().tempo.approvedStep - 1) } }),
      stop,
      tap: (audioTime) => {
        if (calibrating) calibrationTaps.current.push(audioTime)
      },
    },
    calibrating,
  )

  function setSignature(signature: TimeSignature) {
    if (signatureError(signature)) return
    update({ signature, accentMap: null })
    if (playing) play()
  }

  function setParts(parts: number) {
    update({ parts, accentMap: null })
    if (playing) play()
  }

  const presetId = METER_PRESETS.find((item) => sameMeter(item.signature, settings.signature))?.id ?? 'custom'
  const map = accentMapFor(settings)

  return (
    <div className="rh-panel">
      <div className="rh-transport">
        <BpmControl bpm={settings.bpm} onChange={(bpm) => update({ bpm })} onNudge={changeBpm} onTap={tapTempo} />
        <div className="rh-actions">
          <button type="button" className="rh-btn rh-btn-primary" onClick={() => (playing ? stop() : play())}>
            {playing ? 'Stop' : 'Start'}
          </button>
          <button type="button" className="rh-btn" onClick={() => play()}>Restart</button>
        </div>
      </div>
      <p className="rh-help">BPM is the {beatUnitLabel(settings.signature)}. {meterLabel(settings.signature)} has {beatsPerBar(settings.signature)} beats in a bar.</p>

      <div className="rh-split">
        <label className="rh-field">
          <span>Meter</span>
          <select
            value={presetId}
            onChange={(event) => {
              const preset = METER_PRESETS.find((item) => item.id === event.target.value)
              if (preset) setSignature(preset.signature)
            }}
          >
            {METER_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            <option value="custom">Custom</option>
          </select>
        </label>
        <label className="rh-field">
          <span>Counts</span>
          <input
            type="number"
            min={1}
            max={16}
            value={settings.signature.numerator}
            onChange={(event) => setSignature({ ...settings.signature, numerator: Number(event.target.value) })}
          />
        </label>
        <label className="rh-field">
          <span>Division</span>
          <select
            value={settings.signature.denominator}
            onChange={(event) => setSignature({ ...settings.signature, denominator: Number(event.target.value) as Denominator, beatGroup: 1 })}
          >
            {[2, 4, 8, 16].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="rh-field">
          <span>Beat group</span>
          <select
            value={settings.signature.beatGroup}
            onChange={(event) => setSignature({ ...settings.signature, beatGroup: Number(event.target.value) })}
          >
            {beatGroups(settings.signature).map((group) => (
              <option key={group} value={group}>{group === 1 ? 'Each written beat' : `${group} notes per beat`}</option>
            ))}
          </select>
        </label>
        <label className="rh-field">
          <span>Count-in</span>
          <select value={settings.countInBars} onChange={(event) => update({ countInBars: Number(event.target.value) })}>
            {[0, 1, 2, 3, 4].map((bars) => <option key={bars} value={bars}>{bars === 0 ? 'None' : `${bars} bar${bars === 1 ? '' : 's'}`}</option>)}
          </select>
        </label>
      </div>

      <div className="rh-chip-row" role="group" aria-label="Subdivision">
        {SUBDIVISION_PARTS.map((parts) => {
          const available = slotTicks(settings.signature, parts) !== null
          return (
            <button
              key={parts}
              type="button"
              className={settings.parts === parts ? 'rh-chip is-active' : 'rh-chip'}
              disabled={!available}
              onClick={() => setParts(parts)}
            >
              {subdivisionName(parts, beatTicks(settings.signature))}
            </button>
          )
        })}
      </div>
      <label className="rh-check">
        <input
          type="checkbox"
          checked={settings.subdivisionAudible}
          onChange={(event) => update({ subdivisionAudible: event.target.checked, accentMap: null })}
        />
        Play subdivision clicks
      </label>

      <div className="rh-chip-row" role="group" aria-label="Display">
        {(['grid', 'notation', 'both'] as const).map((display) => (
          <button key={display} type="button" className={settings.display === display ? 'rh-chip is-active' : 'rh-chip'} onClick={() => update({ display })}>
            {display === 'grid' ? 'Beat grid' : display === 'notation' ? 'Notation' : 'Combined'}
          </button>
        ))}
      </div>

      <LiveMetronome
        onCycle={(index) => {
          const next = map.map((state, slot) => (slot === index ? cycleAccent(state) : state))
          update({ accentMap: next })
        }}
        onContinue={() => update({ tempo: { ...read().tempo, approvedStep: read().tempo.approvedStep + 1 } })}
      />

      <SoundGapTempo calibrating={calibrating} calibrationNote={calibrationNote} onCalibrate={calibrate} />
    </div>
  )
}

function LiveMetronome({ onCycle, onContinue }: { onCycle: (index: number) => void; onContinue: () => void }) {
  const { settings } = usePracticeControls()
  const snap = useTransport()
  const place = snap.playing && !snap.waiting ? placeInBar(snap.tick, settings.signature, settings.parts) : null
  const playBar = place ? place.bar - settings.countInBars : -1
  const gap = place ? gapSilent(settings.gap, playBar, place.beat, beatsPerBar(settings.signature)) : false
  const pattern = uniformPattern(settings.signature, 1, settings.parts)
  const showGrid = settings.display !== 'notation'
  const showStaff = settings.display !== 'grid'
  const step = nextTempoStep(settings.tempo, settings.bpm, playBar)
  return (
    <div className="rh-stage">
      <p className="rh-position">
        {snap.countIn ? 'Count-in' : snap.playing ? `Bar ${Math.max(1, playBar + 1)} · beat ${place ? place.beat + 1 : 1}` : 'Stopped'}
        {snap.playing ? ` · ${Math.round(snap.bpm)} BPM` : ''}
        {gap ? ' · silent' : ''}
        {' · '}{notesPerBar(settings.signature, settings.parts)} notes in the bar
      </p>
      {step && snap.playing ? (
        <button type="button" className="rh-btn" onClick={onContinue}>
          Continue to {step} BPM
        </button>
      ) : null}
      {showGrid ? (
        <BeatGrid
          signature={settings.signature}
          parts={settings.parts}
          states={accentMapFor(settings)}
          activeSlot={place?.slotInBar ?? -1}
          gap={gap}
          onCycle={onCycle}
        />
      ) : null}
      {showStaff ? (
        <div className="rh-scroll">
          <StaffNotation signature={settings.signature} notes={pattern.notes} bars={1} activeTick={snap.playing && !snap.waiting ? localTick(snap.tick, settings) : null} />
        </div>
      ) : null}
    </div>
  )
}

function localTick(tick: number, settings: { signature: TimeSignature; countInBars: number }) {
  const size = beatTicks(settings.signature) * beatsPerBar(settings.signature)
  const origin = settings.countInBars * size
  if (tick < origin) return tick % size
  return (tick - origin) % size
}

function sameMeter(a: TimeSignature, b: TimeSignature) {
  return a.numerator === b.numerator && a.denominator === b.denominator && a.beatGroup === b.beatGroup
}

function BpmControl({ bpm, onChange, onNudge, onTap }: { bpm: number; onChange: (bpm: number) => void; onNudge: (delta: number) => void; onTap: () => void }) {
  return (
    <div className="rh-bpm">
      <button type="button" className="rh-btn" onClick={() => onNudge(-1)} aria-label="Decrease BPM">−</button>
      <label>
        <span className="rh-sr">BPM</span>
        <input
          className="rh-bpm-input"
          type="number"
          min={20}
          max={300}
          value={bpm}
          onChange={(event) => onChange(clampBpm(Number(event.target.value)))}
        />
      </label>
      <button type="button" className="rh-btn" onClick={() => onNudge(1)} aria-label="Increase BPM">+</button>
      <input type="range" min={20} max={300} value={bpm} onChange={(event) => onChange(clampBpm(Number(event.target.value)))} aria-label="BPM slider" />
      <button type="button" className="rh-btn" onClick={onTap}>Tap</button>
    </div>
  )
}

function SoundGapTempo({ calibrating, calibrationNote, onCalibrate }: { calibrating: boolean; calibrationNote: string; onCalibrate: () => void }) {
  const { settings, update } = usePracticeControls()
  const current = bpmForBar(settings.tempo, settings.bpm, 0)
  return (
    <div className="rh-stack">
      <div className="rh-split">
        <label className="rh-field">
          <span>Click</span>
          <select value={settings.click} onChange={(event) => update({ click: event.target.value as typeof settings.click })}>
            <option value="digital">Digital click</option>
            <option value="woodblock">Woodblock</option>
            <option value="cowbell">Cowbell</option>
            <option value="mechanical">Mechanical</option>
            <option value="beep">Electronic beep</option>
          </select>
        </label>
        <Volume label="Master" value={settings.volumes.master} onChange={(master) => update({ volumes: { ...settings.volumes, master } })} />
        <Volume label="Accent" value={settings.volumes.accent} onChange={(accent) => update({ volumes: { ...settings.volumes, accent } })} />
        <Volume label="Beat" value={settings.volumes.beat} onChange={(beat) => update({ volumes: { ...settings.volumes, beat } })} />
        <Volume label="Subdivision" value={settings.volumes.subdivision} onChange={(subdivision) => update({ volumes: { ...settings.volumes, subdivision } })} />
      </div>
      <p className="rh-help">Click a grid slot to cycle accent, normal, and silent. The main beat uses a different pitch from the subdivisions. A background tab may throttle the scheduler; keep this tab open while you practice.</p>
      <div className="rh-split">
        <label className="rh-field">
          <span>Gaps</span>
          <select value={settings.gap.mode} onChange={(event) => update({ gap: { ...settings.gap, mode: event.target.value as typeof settings.gap.mode } })}>
            <option value="off">No gaps</option>
            <option value="bars">Silent bars</option>
            <option value="beats">Silent beats</option>
            <option value="random-beats">Random muted beats</option>
          </select>
        </label>
        {settings.gap.mode === 'bars' ? (
          <>
            <NumberField label="Audible bars" value={settings.gap.audibleBars} min={0} max={16} onChange={(audibleBars) => update({ gap: { ...settings.gap, audibleBars } })} />
            <NumberField label="Silent bars" value={settings.gap.silentBars} min={0} max={16} onChange={(silentBars) => update({ gap: { ...settings.gap, silentBars } })} />
          </>
        ) : null}
        {settings.gap.mode === 'beats' ? (
          <>
            <NumberField label="Audible beats" value={settings.gap.audibleBeats} min={0} max={32} onChange={(audibleBeats) => update({ gap: { ...settings.gap, audibleBeats } })} />
            <NumberField label="Silent beats" value={settings.gap.silentBeats} min={0} max={32} onChange={(silentBeats) => update({ gap: { ...settings.gap, silentBeats } })} />
          </>
        ) : null}
        {settings.gap.mode === 'random-beats' ? (
          <NumberField label="Mute chance %" value={Math.round(settings.gap.muteChance * 100)} min={0} max={100} onChange={(value) => update({ gap: { ...settings.gap, muteChance: value / 100 } })} />
        ) : null}
      </div>
      <label className="rh-check">
        <input type="checkbox" checked={settings.tempo.enabled} onChange={(event) => update({ tempo: { ...settings.tempo, enabled: event.target.checked, approvedStep: 0 } })} />
        Progressive tempo, from {settings.bpm} toward {settings.tempo.targetBpm}
      </label>
      {settings.tempo.enabled ? (
        <div className="rh-split">
          <NumberField label="Target" value={settings.tempo.targetBpm} min={20} max={300} onChange={(targetBpm) => update({ tempo: { ...settings.tempo, targetBpm } })} />
          <NumberField label="Step" value={settings.tempo.increment} min={-40} max={40} onChange={(increment) => update({ tempo: { ...settings.tempo, increment: increment || 5 } })} />
          <NumberField label="Bars before increase" value={settings.tempo.barsPerStep} min={1} max={64} onChange={(barsPerStep) => update({ tempo: { ...settings.tempo, barsPerStep } })} />
          <label className="rh-check"><input type="checkbox" checked={settings.tempo.manual} onChange={(event) => update({ tempo: { ...settings.tempo, manual: event.target.checked } })} /> Confirm each tempo</label>
          <label className="rh-check"><input type="checkbox" checked={settings.tempo.repeat} onChange={(event) => update({ tempo: { ...settings.tempo, repeat: event.target.checked } })} /> Hold this tempo</label>
          <p className="rh-help">First step is {current} BPM. Changes land on a beat.</p>
        </div>
      ) : null}
      <div className="rh-split">
        <NumberField label="Latency ms" value={settings.latencyMs} min={-200} max={200} onChange={(latencyMs) => update({ latencyMs })} />
        <button type="button" className="rh-btn" onClick={onCalibrate} disabled={calibrating}>{calibrating ? 'Listening…' : 'Calibrate'}</button>
      </div>
      <p className="rh-help">{calibrationNote || 'Accuracy scores are estimates. Hardware and the browser add a delay, so calibrate if every tap looks early or late by the same amount.'}</p>
    </div>
  )
}

function Volume({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="rh-field">
      <span>{label}</span>
      <input type="range" min={0} max={1} step={0.01} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="rh-field">
      <span>{label}</span>
      <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}
