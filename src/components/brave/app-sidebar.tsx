'use client'

import { useAppStore, ModuleType } from '@/lib/store'
import { BravyBotMini, getRandomBravyPhrase } from './bravy-bot'
import {
  Sparkles,
  Calendar,
  PenTool,
  BookOpen,
  Crown,
  Lightbulb,
  Instagram,
  Bot,
  LayoutGrid,
  Home,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'

const modules: { key: ModuleType; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'inicio', label: 'Inicio', icon: <Home className="w-[18px] h-[18px]" />, color: '#60B5FF' },
  { key: 'marca', label: 'Mi Marca', icon: <Crown className="w-[18px] h-[18px]" />, color: '#FFF1B5' },
  { key: 'planificar', label: 'Planificar', icon: <Calendar className="w-[18px] h-[18px]" />, color: '#C1DBE8' },
  { key: 'crear', label: 'Crear', icon: <PenTool className="w-[18px] h-[18px]" />, color: '#BDB2FF' },
  { key: 'stories', label: 'Stories', icon: <Instagram className="w-[18px] h-[18px]" />, color: '#F4C2C2' },
  { key: 'ganchos', label: 'Ganchos', icon: <LayoutGrid className="w-[18px] h-[18px]" />, color: '#FF6D3F' },
  { key: 'asistente', label: 'Asistente', icon: <Bot className="w-[18px] h-[18px]" />, color: '#B8E0D2' },
  { key: 'biblioteca', label: 'Biblioteca', icon: <BookOpen className="w-[18px] h-[18px]" />, color: '#7EC8E3' },
  { key: 'calendario', label: 'Calendario', icon: <Sparkles className="w-[18px] h-[18px]" />, color: '#F5D76E' },
]

export function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()
  const mascotPhrase = useMemo(() => getRandomBravyPhrase(activeModule), [activeModule])

  return (
    <aside className="w-[72px] hover:w-[240px] min-h-screen brave-gradient flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group/sidebar shadow-2xl overflow-hidden shrink-0">
      {/* Logo + Mascot */}
      <div className="px-3 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="shrink-0"
          >
            <BravyBotMini />
          </motion.div>
          <div className="min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">BRAVE</h1>
            <p className="text-[9px] text-[#FFF1B5] font-semibold tracking-[0.2em] uppercase mt-0.5">Studio</p>
          </div>
        </div>

        {/* Mascot speech bubble */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300"
          >
            <div className="mt-3 bg-white/15 rounded-xl px-2.5 py-1.5 backdrop-blur-sm">
              <p className="text-[10px] text-white/90 font-medium leading-tight">{mascotPhrase}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {modules.map((mod, index) => (
          <motion.button
            key={mod.key}
            onClick={() => setActiveModule(mod.key)}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 brave-nav-item ${
              activeModule === mod.key
                ? 'active bg-white/20 text-white shadow-lg shadow-black/10'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span
              className="shrink-0 transition-colors duration-200"
              style={{ color: activeModule === mod.key ? mod.color : undefined }}
            >
              {mod.icon}
            </span>
            <span className="min-w-0 truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
              {mod.label}
            </span>
          </motion.button>
        ))}
      </nav>

      {/* DAME UNA IDEA button */}
      <div className="px-2.5 pb-3">
        <button
          onClick={() => {
            const event = new CustomEvent('openDameUnaIdea')
            window.dispatchEvent(event)
          }}
          className="w-full flex items-center justify-center group-hover/sidebar:justify-start gap-2 px-2.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFF1B5] to-[#F5D680] text-[#591427] font-bold text-[13px] hover:from-[#FFE88A] hover:to-[#F5D080] transition-all duration-200 shadow-lg shadow-[#FFF1B5]/20 brave-card-hover"
        >
          <Lightbulb className="w-[18px] h-[18px] shrink-0" />
          <span className="min-w-0 truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            Dame una idea
          </span>
        </button>
      </div>

      {/* Brand tagline */}
      <div className="px-2.5 pb-3">
        <div className="h-px bg-white/10 mb-2.5 mx-2" />
        <p className="text-[8px] text-white/30 text-center tracking-[0.15em] uppercase font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
          Tu contenido, sin pensar
        </p>
      </div>
    </aside>
  )
}