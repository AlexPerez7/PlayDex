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
    <nav className="fixed inset-x-0 bottom-4 z-10 px-4">
      <ul className="mx-auto flex max-w-md items-center justify-around rounded-full bg-slate-900/95 px-2 py-2 shadow-lg shadow-black/40 ring-1 ring-slate-800 backdrop-blur md:max-w-3xl lg:max-w-5xl">
        {links.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1 list-none">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] transition-colors ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-500 active:text-slate-300'
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
