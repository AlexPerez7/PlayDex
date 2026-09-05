import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Biblioteca', icon: '🎮' },
  { to: '/add', label: 'Agregar', icon: '➕' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md justify-around">
        {links.map(({ to, label, icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs ${
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
