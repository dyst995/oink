import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { getStudyMode, subscribeStudyMode } from '../lib/studyMode.ts'
import { applyTheme } from '../lib/theme.ts'
import { SiteHeader } from './SiteHeader.tsx'
import './site-header.css'

export function AppLayout() {
  const [studyMode, setStudyModeState] = useState(getStudyMode)

  useEffect(() => {
    applyTheme()
    return subscribeStudyMode(() => setStudyModeState(getStudyMode()))
  }, [])

  return (
    <div className={studyMode ? 'app-shell is-study' : 'app-shell'}>
      <SiteHeader />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
