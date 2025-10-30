import Link from 'next/link'
import { Plus, Upload, Zap, Instagram } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: 'Nova Ideia',
      href: '/dashboard/ideas/new',
      color: 'hover:bg-white/20',
    },
    {
      icon: Upload,
      label: 'Importar',
      href: '/dashboard/import',
      color: 'hover:bg-white/20',
    },
    {
      icon: Zap,
      label: 'Automações',
      href: '/dashboard/automations',
      color: 'hover:bg-white/20',
    },
    {
      icon: Instagram,
      label: 'Conectar IG',
      href: '/dashboard/instagram',
      color: 'hover:bg-white/20',
    },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={`flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl font-medium transition-all ${action.color} border border-white/20 hover:scale-105`}
        >
          <action.icon className="h-5 w-5" />
          {action.label}
        </Link>
      ))}
    </div>
  )
}
