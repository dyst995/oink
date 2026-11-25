import { missedCards, summarizeAttempts } from './engine.ts'
import type { AttemptRecord, ExerciseMode } from './types.ts'
import { MODE_LABELS } from './types.ts'

type SessionStatsProps = {
  attempts: readonly AttemptRecord[]
  trackTime: boolean
}

function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}

export function SessionStats({ attempts, trackTime }: SessionStatsProps) {
  const stats = summarizeAttempts(attempts, trackTime)
  const modes = Object.keys(stats.byMode) as ExerciseMode[]

  return (
    <div className="fx-stats">
      <p className="fx-stat-line">
        <span>{stats.answered} answered</span>
        <span>{stats.correct} correct</span>
        <span>{stats.incorrect} incorrect</span>
        <span>{stats.accuracy}%</span>
        <span>Streak {stats.streak}</span>
        {stats.averageResponseMs != null ? <span>{formatSeconds(stats.averageResponseMs)} avg</span> : null}
      </p>

      {modes.length > 0 ? (
        <ul className="fx-miss-list" aria-label="Accuracy by exercise">
          {modes.map((mode) => {
            const modeStats = stats.byMode[mode]
            if (!modeStats) return null
            return (
              <li key={mode}>
                <span>{MODE_LABELS[mode]}</span>
                <span>
                  {modeStats.accuracy}% · {modeStats.correct}/{modeStats.correct + modeStats.incorrect}
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}

      <MissList label="Missed notes" items={stats.missedNotes} />
      <MissList label="Missed degrees" items={stats.missedDegrees} />
      <MissList label="Missed positions" items={stats.missedPositions} />
    </div>
  )
}

function MissList({ label, items }: { label: string; items: { label: string; count: number }[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="fx-label">{label}</p>
      <ul className="fx-miss-list">
        {items.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <span>×{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type TrainerSummaryProps = {
  attempts: readonly AttemptRecord[]
  trackTime: boolean
  onRestart: () => void
  onNewSession: () => void
  onReview: () => void
  onWeak: () => void
  onConfigure: () => void
}

export function TrainerSummary({
  attempts,
  trackTime,
  onRestart,
  onNewSession,
  onReview,
  onWeak,
  onConfigure,
}: TrainerSummaryProps) {
  const reviewCount = missedCards(attempts).length
  const stats = summarizeAttempts(attempts, trackTime)

  return (
    <section className="fx-config fx-summary" aria-label="Session summary">
      <header className="fx-summary-head">
        <p className="fx-kicker">Session</p>
        <h2>{stats.answered === 0 ? 'No cards answered' : `${stats.accuracy}% accurate`}</h2>
      </header>
      <SessionStats attempts={attempts} trackTime={trackTime} />
      <div className="fx-card-actions">
        <button type="button" className="fx-btn fx-btn-primary" onClick={onRestart}>
          Restart session
        </button>
        <button type="button" className="fx-btn" onClick={onNewSession}>
          New session
        </button>
        <button type="button" className="fx-btn" onClick={onReview} disabled={reviewCount === 0}>
          Review incorrect{reviewCount > 0 ? ` (${reviewCount})` : ''}
        </button>
        <button type="button" className="fx-btn" onClick={onWeak}>
          Practice weak areas
        </button>
        <button type="button" className="fx-btn" onClick={onConfigure}>
          Back to configuration
        </button>
      </div>
    </section>
  )
}
