import { useEffect, useMemo, useState } from 'react'
import { parseFlashcardDeck } from './parseDeck.ts'
import type { Flashcard, FlashcardDeck } from './types.ts'
import './flashcards.css'

export type FlashcardsProps = {
  /** Validated deck, raw JSON object, or JSON string. */
  deck: FlashcardDeck | string | unknown
  /** Start with a shuffled order. Default true. */
  shuffle?: boolean
  /** Hide the deck title block when hosted inside another page. Default false. */
  hideHeader?: boolean
}

type SessionCard = Flashcard & { order: number }

function shuffleCards(cards: Flashcard[]): SessionCard[] {
  const next = cards.map((card, order) => ({ ...card, order }))
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  return next
}

function orderedCards(cards: Flashcard[]): SessionCard[] {
  return cards.map((card, order) => ({ ...card, order }))
}

type SessionProps = {
  deck: FlashcardDeck
  shuffle: boolean
  hideHeader: boolean
}

function FlashcardsSession({ deck, shuffle, hideHeader }: SessionProps) {
  const [queue, setQueue] = useState<SessionCard[]>(() =>
    shuffle ? shuffleCards(deck.cards) : orderedCards(deck.cards),
  )
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [again, setAgain] = useState(0)
  const [finished, setFinished] = useState(false)

  const card = queue[index]
  const total = queue.length
  const remaining = Math.max(total - index, 0)

  function restart() {
    setQueue(shuffle ? shuffleCards(deck.cards) : orderedCards(deck.cards))
    setIndex(0)
    setFlipped(false)
    setKnown(0)
    setAgain(0)
    setFinished(false)
  }

  function flip() {
    setFlipped((value) => !value)
  }

  function grade(result: 'known' | 'again') {
    if (finished || !flipped) return

    if (result === 'known') setKnown((value) => value + 1)
    else setAgain((value) => value + 1)

    setIndex((current) => {
      const nextIndex = current + 1
      if (nextIndex >= total) {
        setFinished(true)
        setFlipped(false)
        return current
      }
      setFlipped(false)
      return nextIndex
    })
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      if (finished) return

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        if (!flipped) setFlipped(true)
        return
      }
      if (!flipped) return
      if (event.key === '1' || event.key === 'ArrowLeft') {
        event.preventDefault()
        grade('again')
        return
      }
      if (event.key === '2' || event.key === 'ArrowRight') {
        event.preventDefault()
        grade('known')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (!card && !finished) {
    return (
      <section className="flashcards">
        <p>This deck has no cards.</p>
      </section>
    )
  }

  if (finished) {
    return (
      <section className="flashcards" aria-label={deck.title}>
        {hideHeader ? null : (
          <header className="flashcards-header">
            <h1>{deck.title}</h1>
            {deck.description ? <p>{deck.description}</p> : null}
          </header>
        )}
        <div className="flashcards-summary">
          <p>
            Done. {known} known, {again} again, out of {total}.
          </p>
          <button type="button" className="flashcards-primary" onClick={restart}>
            Practice again
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="flashcards" aria-label={deck.title}>
      {hideHeader ? (
        <p className="flashcards-progress" aria-live="polite">
          Card {index + 1} of {total} · {remaining} left · {known} known · {again} again
        </p>
      ) : (
        <header className="flashcards-header">
          <h1>{deck.title}</h1>
          {deck.description ? <p>{deck.description}</p> : null}
          <p className="flashcards-progress" aria-live="polite">
            Card {index + 1} of {total} · {remaining} left · {known} known · {again} again
          </p>
        </header>
      )}

      <button
        type="button"
        className={flipped ? 'flashcard is-flipped' : 'flashcard'}
        onClick={flip}
        aria-pressed={flipped}
      >
        <span className="flashcard-side-label">{flipped ? 'Answer' : 'Prompt'}</span>
        <span className="flashcard-text">{flipped ? card.back : card.front}</span>
        <span className="flashcard-hint">{flipped ? 'Grade below' : 'Tap to flip'}</span>
      </button>

      <div className="flashcards-actions">
        <button
          type="button"
          className="flashcards-again"
          disabled={!flipped}
          onClick={() => grade('again')}
        >
          Again
        </button>
        <button
          type="button"
          className="flashcards-known"
          disabled={!flipped}
          onClick={() => grade('known')}
        >
          Known
        </button>
      </div>
    </section>
  )
}

export function Flashcards({
  deck: deckInput,
  shuffle = true,
  hideHeader = false,
}: FlashcardsProps) {
  const deck = useMemo(() => parseFlashcardDeck(deckInput), [deckInput])
  const sessionKey = `${deck.id}:${shuffle}:${deck.cards.map((card) => card.id).join(',')}`

  return (
    <FlashcardsSession
      key={sessionKey}
      deck={deck}
      shuffle={shuffle}
      hideHeader={hideHeader}
    />
  )
}
