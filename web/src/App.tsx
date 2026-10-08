import { useState } from 'react'
import { SiteHeader, type SiteTab } from './layout/SiteHeader.tsx'
import { FlashcardsPage } from './modules/flashcards-module/FlashcardsPage.tsx'
import { FretboardModule } from './modules/fretboard-module/index.ts'
import { TheoryModule } from './modules/theory-module/index.ts'
import './layout/site-header.css'

function App() {
  const [tab, setTab] = useState<SiteTab>('fretboard')
  const [theoryTopicId, setTheoryTopicId] = useState<string | null>(null)

  function onTabChange(next: SiteTab) {
    setTab(next)
    if (next !== 'theory') setTheoryTopicId(null)
  }

  return (
    <div className="app-shell">
      <SiteHeader tab={tab} onTabChange={onTabChange} />
      <main className="app-main">
        {tab === 'fretboard' ? (
          <div id="panel-fretboard">
            <FretboardModule />
          </div>
        ) : tab === 'theory' ? (
          <TheoryModule topicId={theoryTopicId} onTopicChange={setTheoryTopicId} />
        ) : (
          <div id="panel-flashcards">
            <FlashcardsPage />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
