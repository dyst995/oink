import { Navigate, Route, Routes } from 'react-router-dom'
import { FlashcardsPage } from './modules/flashcards-module/FlashcardsPage.tsx'
import { FretboardModule } from './modules/fretboard-module/index.ts'
import { TheoryModule } from './modules/theory-module/index.ts'
import { AppLayout } from './layout/AppLayout.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="fretboard" replace />} />
        <Route
          path="fretboard"
          element={
            <div id="panel-fretboard">
              <FretboardModule />
            </div>
          }
        />
        <Route path="theory">
          <Route index element={<TheoryModule />} />
          <Route path=":topicId" element={<TheoryModule />} />
        </Route>
        <Route
          path="flashcards"
          element={
            <div id="panel-flashcards">
              <FlashcardsPage />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="fretboard" replace />} />
      </Route>
    </Routes>
  )
}
