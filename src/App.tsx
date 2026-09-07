import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { GamesProvider } from './contexts/GamesContext'
import { ListsProvider } from './contexts/ListsContext'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { AddGame } from './pages/AddGame'
import { Dashboard } from './pages/Dashboard'
import { GameDetail } from './pages/GameDetail'
import { Lists } from './pages/Lists'
import { ListDetail } from './pages/ListDetail'
import { Timeline } from './pages/Timeline'
import { SteamImport } from './pages/SteamImport'
import { SteamCallback } from './pages/SteamCallback'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'

const ONBOARDING_KEY = 'playdex_onboarding_seen'

function App() {
  const { session, loading } = useAuth()
  const [onboardingSeen, setOnboardingSeen] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true'
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Cargando...
      </div>
    )
  }

  if (!session) {
    if (!onboardingSeen) {
      return (
        <Onboarding
          onFinish={() => {
            localStorage.setItem(ONBOARDING_KEY, 'true')
            setOnboardingSeen(true)
          }}
        />
      )
    }
    return <Login />
  }

  return (
    <GamesProvider>
      <ListsProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/home" element={<Home />} />
            <Route path="/add" element={<AddGame />} />
            <Route path="/steam-import" element={<SteamImport />} />
            <Route path="/steam-import/callback" element={<SteamCallback />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/lists/:id" element={<ListDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </ListsProvider>
    </GamesProvider>
  )
}

export default App
