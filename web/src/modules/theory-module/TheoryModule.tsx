import { THEORY_LATER, THEORY_TOPICS } from './topics.ts'
import './theory.css'

export function TheoryModule() {
  return (
    <section className="theory-module" id="panel-theory" role="tabpanel" aria-labelledby="tab-theory">
      <ol className="theory-map">
        {THEORY_TOPICS.map((topic, index) => (
          <li className="theory-topic" key={topic.id}>
            <span className="theory-index">{index + 1}</span>
            <div>
              <h2>{topic.title}</h2>
              <p>{topic.body}</p>
              {topic.formulas ? (
                <ul className="theory-formulas">
                  {topic.formulas.map((item) => (
                    <li key={item.formula}>
                      <span className="theory-formula-label">{item.label}</span>
                      <code>{item.formula}</code>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <p className="theory-later">{THEORY_LATER}</p>
    </section>
  )
}
