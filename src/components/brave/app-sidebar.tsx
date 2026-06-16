'use client'

import { useAppStore, ModuleType } from '@/lib/store'
import {
  Sparkles,
  Calendar,
  PenTool,
  BookOpen,
  Crown,
  Lightbulb,
} from 'lucide-react'

const modules: { key: ModuleType; label: string; icon: React.ReactNode }[] = [
  { key: 'marca', label: 'Mi Marca', icon: <Crown className="w-5 h-5" /> },
  { key: 'planificar', label: 'Planificar', icon: <Calendar className="w-5 h-5" /> },
  { key: 'crear', label: 'Crear', icon: <PenTool className="w-5 h-5" /> },
  { key: 'biblioteca', label: 'Biblioteca', icon: <BookOpen className="w-5 h-5" /> },
  { key: 'calendario', label: 'Calendario', icon: <Sparkles className="w-5 h-5" /> },
]

export function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()

  return (
    <aside className="w-[220px] min-h-screen brave-gradient flex flex-col shadow-xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          BRÄVE
        </h1>
        <p className="text-xs text-white/60 mt-1 tracking-widest uppercase">
          Studio
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {modules.map((mod) => (
          <button
            key={mod.key}
            onClick={() => setActiveModule(mod.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeModule === mod.key
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {mod.icon}
            <span>{mod.label}</span>
          </button>
        ))}
      </nav>

      {/* DAME UNA IDEA */}
      <div className="px-4 pb-6">
        <button
          onClick={() => {
            // Trigger the DAME UNA IDEA modal
            const event = new CustomEvent('openDameUnaIdea')
            window.dispatchEvent(event)
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#C9A96E] text-[#2D1F22] font-bold text-sm hover:bg-[#D4B87E] transition-all duration-200 shadow-lg"
        >
          <Lightbulb className="w-5 h-5" />
          <span>Dame una idea</span>
        </button>
      </div>

      {/* Brand indicator */}
      <div className="px-6 pb-4">
        <div className="h-px bg-white/10 mb-4" />
        <p className="text-[10px] text-white/40 text-center tracking-wider uppercase">
          Tu contenido, sin pensar
        </p>
      </div>
    </aside>
  )
}
