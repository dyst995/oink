import { Outlet } from 'react-router-dom'
import { SiteHeader } from './SiteHeader.tsx'
import './site-header.css'

export function AppLayout() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
