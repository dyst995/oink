import { useState } from 'react'
import { getMetronomeEngine } from './audio/engine.ts'
import { MetronomePanel } from './MetronomePanel.tsx'
import { MetronomeProvider } from './MetronomeContext.tsx'
import { PatternTrainer } from './PatternTrainer.tsx'
import { RecognitionTrainer } from './RecognitionTrainer.tsx'
import { SubdivisionTrainer } from './SubdivisionTrainer.tsx'
import './rhythm.css'

type Mode = 'metro' | 'subdivision' | 'pattern' | 'recognition'

const MODES: { id: Mode; label: string; blurb: string }[] = [
  { id: 'metro', label: 'Metronome', blurb: 'Clicks, accents, gaps, and progressive tempo.' },
  { id: 'subdivision', label: 'Subdivisions', blurb: 'Learn how notes sit on the click.' },
  { id: 'pattern', label: 'Patterns', blurb: 'Build, generate, and tap mixed rhythms.' },
  { id: 'recognition', label: 'Recognition', blurb: 'Identify rhythms by ear.' },
]

export function RhythmModule() {
  const [mode, setMode] = useState<Mode>('metro')

  return (
    <MetronomeProvider>
      <section className="rhythm-module" aria-label="Metronome and rhythm">
        <header className="rh-hero">
          <p className="rh-kicker">Practice</p>
          <h1>Metronome</h1>
          <p>
            A precise click for daily practice, plus trainers that connect counting, notation, and feel.
            Only one click engine runs at a time.
          </p>
        </header>

        <div className="rh-chip-row" role="tablist" aria-label="Rhythm modes">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={mode === item.id ? 'rh-chip is-active' : 'rh-chip'}
              aria-selected={mode === item.id}
              onClick={() => {
                getMetronomeEngine().stop()
                setMode(item.id)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="rh-help">{MODES.find((item) => item.id === mode)?.blurb}</p>

        {mode === 'metro' ? <MetronomePanel /> : null}
        {mode === 'subdivision' ? <SubdivisionTrainer /> : null}
        {mode === 'pattern' ? <PatternTrainer /> : null}
        {mode === 'recognition' ? <RecognitionTrainer /> : null}
      </section>
    </MetronomeProvider>
  )
}
