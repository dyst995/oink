import { useState } from 'react'
import { SiteHeader, type SiteTab } from './layout/SiteHeader.tsx'
import { FlashcardsPage } from './modules/flashcards-module/FlashcardsPage.tsx'
import { FretboardModule } from './modules/fretboard-module/index.ts'
import { TheoryModule } from './modules/theory-module/index.ts'
import './layout/site-header.css'

function App() {
  const [tab, setTab] = useState<SiteTab>('fretboard')

  return (
    <>
      <SiteHeader tab={tab} onChange={setTab} />
      {tab === 'fretboard' ? (
        <div id="panel-fretboard" role="tabpanel" aria-labelledby="tab-fretboard">
          <FretboardModule />
        </div>
      ) : tab === 'theory' ? (
        <TheoryModule />
      ) : (
        <div id="panel-flashcards" role="tabpanel" aria-labelledby="tab-flashcards">
          <FlashcardsPage />
        </div>
      )}
    </>
  )
}

export default App
