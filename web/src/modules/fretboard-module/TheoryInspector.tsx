import {
  describePatternQuality,
  formulaKindLabel,
  isChordToneDegree,
  stepsBetweenTones,
  type FormulaKind,
  type FormulaTone,
  type ParsedKey,
} from './theory.ts'

type TheoryInspectorProps = {
  keyData: ParsedKey
  kind: FormulaKind
  formula: string
  patternLabel: string
  tones: readonly FormulaTone[]
}

export function TheoryInspector({
  keyData,
  kind,
  formula,
  patternLabel,
  tones,
}: TheoryInspectorProps) {
  const quality = describePatternQuality(tones)
  const steps = stepsBetweenTones(tones)
  const chordTones = tones.filter((tone) => isChordToneDegree(tone.degreeLabel))
  const isChordLike = tones.length <= 4 && chordTones.length === tones.length

  return (
    <aside className="fx-theory" aria-label="Theory inspector">
      <header className="fx-theory-head">
        <p className="fx-kicker">Theory inspector</p>
        <h2>
          {keyData.name} {patternLabel}
        </h2>
        {quality ? <p className="fx-theory-quality">{quality}</p> : null}
      </header>

      <section className="fx-theory-block">
        <h3>Notes in this pattern</h3>
        <ol className="fx-tone-list">
          {tones.map((tone) => (
            <li key={`${tone.degreeLabel}-${tone.name}`}>
              <span className={`fx-role-dot fx-role-${tone.role}`} aria-hidden="true" />
              <span>
                <strong>{tone.name}</strong>
                <span className="fx-muted">
                  {' '}
                  · {tone.degreeLabel} · {tone.intervalShort}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="fx-theory-block">
        <h3>Formula</h3>
        <dl className="fx-dl">
          <div>
            <dt>Representation</dt>
            <dd>{formulaKindLabel(kind)}</dd>
          </div>
          <div>
            <dt>Entered as</dt>
            <dd>
              <code>{formula}</code>
            </dd>
          </div>
          <div>
            <dt>Scale degrees</dt>
            <dd>{tones.map((tone) => tone.degreeLabel).join(' ')}</dd>
          </div>
          <div>
            <dt>Semitone offsets</dt>
            <dd>{tones.map((tone) => tone.semitones).join(' ')}</dd>
          </div>
          {steps.length > 0 ? (
            <div>
              <dt>Step pattern</dt>
              <dd>{steps.join(' ')}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="fx-theory-block">
        <h3>Intervals from the root</h3>
        <ul className="fx-interval-list">
          {tones.map((tone) => (
            <li key={`interval-${tone.semitones}-${tone.name}`}>
              <strong>{tone.intervalName}</strong>
              <span>
                {tone.name} · {tone.semitones} st
              </span>
            </li>
          ))}
        </ul>
      </section>

      {isChordLike ? (
        <section className="fx-theory-block">
          <h3>Chord tones</h3>
          <dl className="fx-dl">
            {tones.map((tone) => (
              <div key={`chord-${tone.degreeLabel}`}>
                <dt>{roleHeading(tone)}</dt>
                <dd>
                  {tone.name} · {tone.intervalName}
                </dd>
              </div>
            ))}
          </dl>
          <p className="fx-muted">
            Inversions rearrange these same pitch classes so a different chord tone sits in the
            bass — the relationships above stay the same.
          </p>
        </section>
      ) : (
        <section className="fx-theory-block">
          <h3>Chord-tone subset</h3>
          <p>
            {chordTones.length > 0
              ? chordTones.map((tone) => `${tone.degreeLabel} (${tone.name})`).join(' · ')
              : 'No standard 1–3–5–7 chord tones in this formula.'}
          </p>
          <p className="fx-muted">
            Use Study focus → Chord tones to isolate these on the neck.
          </p>
        </section>
      )}

      <p className="fx-legend-note">
        Legend: gold = root, teal = third, cream = fifth, coral = seventh, muted = other tones.
        Shapes also use labels, not color alone.
      </p>
    </aside>
  )
}

function roleHeading(tone: FormulaTone): string {
  if (tone.role === 'root') return 'Root'
  if (tone.role === 'third') return 'Third'
  if (tone.role === 'fifth') return 'Fifth'
  if (tone.role === 'seventh') return 'Seventh'
  return tone.degreeLabel
}
