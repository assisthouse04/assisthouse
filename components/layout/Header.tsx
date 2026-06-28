'use client'
import { useSession } from 'next-auth/react'
import { Bell, User } from 'lucide-react'

interface HeaderProps { title: string; subtitle?: string }

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">{session?.user?.name}</p>
            <p className="text-xs text-slate-500">{role === 'ADMIN' ? 'Administrador' : 'Técnico'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
