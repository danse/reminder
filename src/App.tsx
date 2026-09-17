import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Menu } from 'lucide-react'
import i18n from './i18n'
import { Sidebar } from './layout/Sidebar'
import { NotesBrowser } from './layout/NotesBrowser'
import { TagView } from './layout/TagView'

const AnalyticsView = lazy(() =>
  import('./features/analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView })),
)

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell" data-testid="app-shell">
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={i18n.t('nav.menu')}
        data-testid="sidebar-toggle"
      >
        <Menu size={20} />
      </button>
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} data-testid="sidebar-backdrop" />
      )}
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <main className="main">
        <Routes>
          <Route index element={<NotesBrowser />} />
          <Route path="note/:noteId" element={<NotesBrowser />} />
          <Route path="file/:fileId" element={<NotesBrowser />} />
          <Route path="tag/:tag" element={<TagView />} />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<div className="analytics analytics-empty">{i18n.t('common.loading')}</div>}>
                <AnalyticsView />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return <AppShell />
}