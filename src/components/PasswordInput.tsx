import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/** Input de contraseña con botón para mostrarla (clave al teclear en el teléfono). */
export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`w-full rounded-xl bg-background-surface py-3 pl-3 pr-12 text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary ${props.className ?? ''}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-lavender"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
