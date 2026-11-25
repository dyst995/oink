import { MetronomeProvider, useTransport } from './MetronomeContext.tsx'
import { usePracticeControls } from './usePracticeControls.ts'
import { beatUnitLabel, clampBpm, meterLabel } from './theory/duration.ts'
import { buildMetronomeSpec } from './theory/spec.ts'
import { placeInBar } from './theory/schedule.ts'
import './rhythm.css'

/** Small transport for other modules. Uses the same singleton engine. */
export function CompactMetronome() {
  return (
    <MetronomeProvider>
      <CompactBody />
    </MetronomeProvider>
  )
}

function CompactBody() {
  const { settings, update, read, playing, start, stop, tapTempo, changeBpm } = usePracticeControls()
  const snap = useTransport()
  const place = snap.playing && !snap.waiting ? placeInBar(snap.tick, settings.signature, settings.parts) : null

  return (
    <div className="rh-compact" aria-label="Compact metronome">
      <div className="rh-compact-row">
        <button type="button" className="rh-btn rh-btn-primary" onClick={() => (playing ? stop() : start(buildMetronomeSpec(read)))}>
          {playing ? 'Stop' : 'Start'}
        </button>
        <button type="button" className="rh-btn" onClick={() => changeBpm(-1)} aria-label="Slower">
          −
        </button>
        <input
          className="rh-bpm-input"
          type="number"
          min={20}
          max={300}
          value={settings.bpm}
          aria-label="BPM"
          onChange={(event) => update({ bpm: clampBpm(Number(event.target.value)) })}
        />
        <button type="button" className="rh-btn" onClick={() => changeBpm(1)} aria-label="Faster">
          +
        </button>
        <button type="button" className="rh-btn" onClick={tapTempo}>
          Tap
        </button>
      </div>
      <p className="rh-help">
        {meterLabel(settings.signature)} · {beatUnitLabel(settings.signature)}
        {place ? ` · beat ${place.beat + 1}` : ''}
      </p>
    </div>
  )
}
