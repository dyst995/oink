import pitchDeck from '../../data/flashcards/pitch-octave-pitch-class.json'
import { Flashcards } from './Flashcards.tsx'

/** Example host page. Pass any deck JSON into <Flashcards deck={...} />. */
export function FlashcardsPage() {
  return <Flashcards deck={pitchDeck} />
}
