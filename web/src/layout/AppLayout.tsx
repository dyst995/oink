import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from './SiteHeader.tsx'
import { TheorySidebar } from './TheorySidebar.tsx'
import '../layout/site-header.css'
import '../layout/theory-sidebar.css'

export function AppLayout() {
  const { pathname } = useLocation()
  const onTheory = pathname === '/theory' || pathname.startsWith('/theory/')

  return (
    <div className={onTheory ? 'app-shell has-sidebar' : 'app-shell'}>
      <SiteHeader />
      <div className="app-body">
        {onTheory ? <TheorySidebar /> : null}
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
