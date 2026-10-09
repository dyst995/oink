import { sessionStats } from './session.ts'
import { MODE_LABELS, type TrainerSession } from './types.ts'

type TrainerSummaryProps = {
  session: TrainerSession
  onAgain: () => void
  onConfigure: () => void
}

export function TrainerSummary({ session, onAgain, onConfigure }: TrainerSummaryProps) {
  const stats = sessionStats(session)

  return (
    <div className="trainer-summary">
      <header>
        <h2>Session summary</h2>
        <p>This session lived only in this browser tab. Reloading clears it.</p>
      </header>

      <dl className="trainer-stats">
        <div>
          <dt>Answered</dt>
          <dd>{session.answered}</dd>
        </div>
        <div>
          <dt>Correct</dt>
          <dd>{session.correctCount}</dd>
        </div>
        <div>
          <dt>Incorrect</dt>
          <dd>{session.incorrectCount}</dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{stats.accuracy}%</dd>
        </div>
        <div>
          <dt>Avg response</dt>
          <dd>{stats.avgMs ? `${(stats.avgMs / 1000).toFixed(1)}s` : '—'}</dd>
        </div>
      </dl>

      {Object.keys(stats.byKind).length > 0 ? (
        <section>
          <h3>By exercise type</h3>
          <ul className="trainer-kind-list">
            {Object.entries(stats.byKind).map(([kind, bucket]) => (
              <li key={kind}>
                <strong>{MODE_LABELS[kind as keyof typeof MODE_LABELS] ?? kind}</strong>
                <span>
                  {bucket.correct}/{bucket.total} correct
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="trainer-actions">
        <button type="button" className="ui-btn ui-btn-primary" onClick={onAgain}>
          Practice again
        </button>
        <button type="button" className="ui-btn ui-btn-ghost" onClick={onConfigure}>
          Change setup
        </button>
      </div>
    </div>
  )
}
