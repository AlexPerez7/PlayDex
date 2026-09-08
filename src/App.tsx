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

  // GamesProvider/ListsProvider quedan siempre montados (aunque no haya
  // sesión todavía) para que su listener de onAuthStateChange esté
  // suscripto ANTES de que el login dispare el evento SIGNED_IN. Si en
  // cambio solo se montaran después de que `session` pasa a ser verdadero,
  // se pierden ese evento inicial y la primera consulta puede dispararse
  // en la ventana en que el cliente de Supabase todavía no terminó de
  // adjuntar el token nuevo, trayendo listas vacías hasta refrescar.
  return (
    <GamesProvider>
      <ListsProvider>
        {loading ? (
          <div className="flex min-h-screen items-center justify-center text-lavender">
            Cargando...
          </div>
        ) : !session ? (
          !onboardingSeen ? (
            <Onboarding
              onFinish={() => {
                localStorage.setItem(ONBOARDING_KEY, 'true')
                setOnboardingSeen(true)
              }}
            />
          ) : (
            <Login />
          )
        ) : (
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
        )}
      </ListsProvider>
    </GamesProvider>
  )
}

export default App
