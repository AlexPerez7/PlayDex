import { NavLink } from 'react-router-dom'
import { BarChart3, ClipboardList, Gamepad2, Home, Plus } from 'lucide-react'

const links = [
  { to: '/home', label: 'Inicio', Icon: Home },
  { to: '/', label: 'Biblioteca', Icon: Gamepad2 },
  { to: '/add', label: 'Agregar', Icon: Plus },
  { to: '/lists', label: 'Listas', Icon: ClipboardList },
  { to: '/dashboard', label: 'Dashboard', Icon: BarChart3 },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 z-30 px-4"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <ul className="mx-auto flex max-w-md items-center justify-around rounded-full bg-background-surface/95 px-2 py-2 shadow-lg shadow-black/40 ring-1 ring-primary-dark/30 backdrop-blur md:max-w-3xl lg:max-w-5xl">
        {links.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1 list-none">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[11px] transition-colors ${
                  isActive
                    ? 'text-accent'
                    : 'text-lavender active:text-ink'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
