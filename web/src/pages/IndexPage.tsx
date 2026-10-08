import { Link } from 'react-router-dom'
import './index-page.css'

export function IndexPage() {
  return (
    <section className="index-page">
      <h1>musical</h1>
      <p>Guitar theory and fretboard practice.</p>
      <div className="index-links">
        <Link to="/fretboard">Fretboard</Link>
        <Link to="/theory">Theory</Link>
      </div>
    </section>
  )
}
