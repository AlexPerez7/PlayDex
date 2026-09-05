import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { AddGame } from './pages/AddGame'
import { Dashboard } from './pages/Dashboard'
import { GameDetail } from './pages/GameDetail'
import { Lists } from './pages/Lists'
import { ListDetail } from './pages/ListDetail'
import { Timeline } from './pages/Timeline'
import { Login } from './pages/Login'

function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Cargando...
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add" element={<AddGame />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<ListDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default App
