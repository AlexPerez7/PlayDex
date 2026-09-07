import { BarChart3, ClipboardList, Download } from 'lucide-react'

const features = [
  {
    Icon: ClipboardList,
    title: 'Gestiona tu biblioteca',
    description:
      'Lleva un registro de todos tus juegos: pendientes, jugando, completados y más. Nunca pierdas de vista tu backlog.',
  },
  {
    Icon: Download,
    title: 'Importa desde Steam',
    description:
      'Trae tu biblioteca de Steam en segundos y suma horas jugadas y capturas automáticamente.',
  },
  {
    Icon: BarChart3,
    title: 'Sigue tu progreso',
    description:
      'Consulta estadísticas de horas jugadas, puntajes y hábitos de juego desde tu dashboard.',
  },
]

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-12">
      <div className="flex flex-1 flex-col items-center">
        <img
          src="/icons/icon-192.png"
          alt="PlayDex"
          className="h-24 w-24 rounded-3xl shadow-lg shadow-black/40"
        />

        <p className="mt-6 text-sm text-lavender">Bienvenido a</p>
        <h1 className="text-4xl font-bold text-accent">PlayDex</h1>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-6">
          {features.map(({ Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <Icon className="mt-0.5 shrink-0 text-accent" size={24} />
              <div>
                <h2 className="font-semibold text-ink">{title}</h2>
                <p className="mt-0.5 text-sm text-lavender">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="w-full max-w-sm self-center rounded-full bg-primary py-3.5 font-semibold text-white"
      >
        Empezar
      </button>
    </div>
  )
}
