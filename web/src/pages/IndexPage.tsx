import { Link } from 'react-router-dom'
import { THEORY_TOPICS } from '../modules/theory-module/topics.ts'
import { isTheoryTopicOpenable } from '../modules/theory-module/openTopics.ts'
import './index-page.css'

export function IndexPage() {
  const firstLesson = THEORY_TOPICS.find((topic) => isTheoryTopicOpenable(topic.id))

  return (
    <section className="home-page" aria-label="Home">
      <div className="home-hero">
        <p className="home-kicker">Guitar theory studio</p>
        <h1>Unfret</h1>
        <p>
          A progressive guitar theory curriculum with fretboard practice — built for focused study
          on desktop and phone.
        </p>
        <div className="home-actions">
          {firstLesson ? (
            <Link className="home-btn home-btn-primary" to={`/theory/${firstLesson.id}`}>
              Start learning
            </Link>
          ) : null}
          <Link className="home-btn home-btn-secondary" to="/theory">
            Browse curriculum
          </Link>
          <Link className="home-btn home-btn-secondary" to="/fretboard">
            Open fretboard
          </Link>
        </div>
      </div>

      <div className="home-grid">
        <article className="home-card">
          <h2>Curriculum</h2>
          <p>
            Twelve stages from pitch and rhythm through harmony and improvisation — theory and the
            neck taught together.
          </p>
        </article>

        <article className="home-card">
          <h2>Study tools</h2>
          <p>
            Use the theory workspace sidebar on desktop, curriculum drawer on mobile, and the
            fretboard panel while reading lessons.
          </p>
        </article>
      </div>

      <p className="home-note">
        Tip: turn on Study mode inside a lesson for a quieter reading layout.
      </p>
    </section>
  )
}
