import { Link, Navigate, useParams } from 'react-router-dom'
import pitchLesson from './lessons/01-pitch-octave-pitch-class.md?raw'
import twelvePitchClassesLesson from './lessons/02-twelve-pitch-classes.md?raw'
import halfAndWholeStepsLesson from './lessons/03-half-and-whole-steps.md?raw'
import majorScaleConstructionLesson from './lessons/04-major-scale-construction.md?raw'
import keysAndTonalityLesson from './lessons/05-keys-and-tonality.md?raw'
import scaleDegreesAndFormulasLesson from './lessons/06-scale-degrees-and-formulas.md?raw'
import intervalNamesAndQualityLesson from './lessons/07-interval-names-and-quality.md?raw'
import intervalsInMusicLesson from './lessons/08-intervals-in-music.md?raw'
import triadsLesson from './lessons/09-triads.md?raw'
import seventhChordsLesson from './lessons/10-seventh-chords.md?raw'
import diatonicHarmonyLesson from './lessons/11-diatonic-harmony.md?raw'
import functionalProgressionsLesson from './lessons/12-functional-progressions.md?raw'
import tuningAndOpenStringsLesson from './lessons/13-tuning-and-open-strings.md?raw'
import locatingPitchClassesLesson from './lessons/14-locating-pitch-classes.md?raw'
import octavesOnTheNeckLesson from './lessons/15-octaves-on-the-neck.md?raw'
import intervalsOnTheNeckLesson from './lessons/16-intervals-on-the-neck.md?raw'
import scalesAcrossTheNeckLesson from './lessons/17-scales-across-the-neck.md?raw'
import chordShapesAsStacksLesson from './lessons/18-chord-shapes-as-stacks.md?raw'
import arpeggiosAndChordTonesLesson from './lessons/19-arpeggios-and-chord-tones.md?raw'
import pentatonicAsSubsetLesson from './lessons/20-pentatonic-as-subset.md?raw'
import modesInContextLesson from './lessons/21-modes-in-context.md?raw'
import fretboardHarmonyLesson from './lessons/22-fretboard-harmony.md?raw'
import pulseAndFeelLesson from './lessons/23-pulse-and-feel.md?raw'
import { FretboardMemorization } from './FretboardMemorization.tsx'
import { groupTopicsByUnit } from './groupTopics.ts'
import { Lesson } from './Lesson.tsx'
import { isTheoryPractice, isTheoryTopicOpenable } from './openTopics.ts'
import { THEORY_TOPICS, getTopic } from './topics.ts'
import './theory.css'

const LESSONS: Record<string, string> = {
  'pitch-octave-pitch-class': pitchLesson,
  'twelve-pitch-classes': twelvePitchClassesLesson,
  'half-and-whole-steps': halfAndWholeStepsLesson,
  'major-scale-construction': majorScaleConstructionLesson,
  'keys-and-tonality': keysAndTonalityLesson,
  'scale-degrees-and-formulas': scaleDegreesAndFormulasLesson,
  'interval-names-and-quality': intervalNamesAndQualityLesson,
  'intervals-in-music': intervalsInMusicLesson,
  triads: triadsLesson,
  'seventh-chords': seventhChordsLesson,
  'diatonic-harmony': diatonicHarmonyLesson,
  'functional-progressions': functionalProgressionsLesson,
  'tuning-and-open-strings': tuningAndOpenStringsLesson,
  'locating-pitch-classes': locatingPitchClassesLesson,
  'octaves-on-the-neck': octavesOnTheNeckLesson,
  'intervals-on-the-neck': intervalsOnTheNeckLesson,
  'scales-across-the-neck': scalesAcrossTheNeckLesson,
  'chord-shapes-as-stacks': chordShapesAsStacksLesson,
  'arpeggios-and-chord-tones': arpeggiosAndChordTonesLesson,
  'pentatonic-as-subset': pentatonicAsSubsetLesson,
  'modes-in-context': modesInContextLesson,
  'fretboard-harmony': fretboardHarmonyLesson,
  'pulse-and-feel': pulseAndFeelLesson,
}

export function TheoryModule() {
  const { topicId } = useParams<{ topicId?: string }>()
  const active = topicId ? getTopic(topicId) : null
  const lessonSource = topicId ? LESSONS[topicId] : undefined
  const isPractice = topicId ? isTheoryPractice(topicId) : false

  if (topicId && !active) {
    return <Navigate to="/theory" replace />
  }

  if (topicId && active && !lessonSource && !isPractice) {
    return <Navigate to="/theory" replace />
  }

  if (active && (lessonSource || isPractice)) {
    return (
      <section className="theory-module" id="panel-theory" aria-label="Theory">
        <Link className="theory-back" to="/theory">
          Curriculum
        </Link>
        {topicId === 'fretboard-memorization' ? (
          <FretboardMemorization />
        ) : lessonSource ? (
          <Lesson source={lessonSource} />
        ) : null}
      </section>
    )
  }

  const units = groupTopicsByUnit(THEORY_TOPICS)

  return (
    <section className="theory-module" id="panel-theory" aria-label="Theory">
      <p className="theory-curriculum-lede">
        Ordered path from pitch language to fretboard harmony. Open a topic only when its
        prerequisites are done. Full plan: <code>curriculum.md</code>.
      </p>
      <ol className="theory-map">
        {units.map((group) => (
          <li key={group.unit} className="theory-unit-group">
            <div className="theory-unit">{group.unit}</div>
            <ol className="theory-unit-topics">
              {group.topics.map((topic) => {
                const topicNumber = THEORY_TOPICS.findIndex((item) => item.id === topic.id) + 1
                const openable = isTheoryTopicOpenable(topic.id)

                return (
                  <li className="theory-topic" key={topic.id}>
                    <span className="theory-index">{topicNumber}</span>
                    <div>
                      <h2>
                        {openable ? (
                          <Link className="theory-topic-link" to={`/theory/${topic.id}`}>
                            {topic.title}
                          </Link>
                        ) : (
                          topic.title
                        )}
                      </h2>
                      <p>
                        <span className="theory-meta-label">Scope.</span> {topic.scope}
                      </p>
                      <p>
                        <span className="theory-meta-label">Prerequisites.</span>{' '}
                        {topic.prerequisites}
                      </p>
                      <p>
                        <span className="theory-meta-label">Objectives.</span> {topic.objectives}
                      </p>
                      {!openable ? <p className="theory-pending">Lesson not written yet.</p> : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  )
}
