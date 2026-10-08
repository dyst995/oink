import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout.tsx'
import { FretboardModule } from './modules/fretboard-module/index.ts'
import { TheoryModule } from './modules/theory-module/index.ts'
import { IndexPage } from './pages/IndexPage.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<IndexPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
