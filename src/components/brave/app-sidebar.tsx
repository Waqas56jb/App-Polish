'use client'

import { useAppStore, ModuleType } from '@/lib/store'
import { BravyBotMini, getRandomBravyPhrase } from './bravy-bot'
import {
  Sparkles, Calendar, PenTool, BookOpen, Crown,
  Lightbulb, Instagram, Bot, LayoutGrid, Home,
  MoreHorizontal, X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'

// ============================================================
// SIDEBAR RESPONSIVE
// - Desktop (md+): sidebar vertical expandible a la izquierda (mismo que antes)
// - Móvil (< md): bottom navigation bar con los 5 módulos principales
//   + botón "Más" que abre un sheet con el resto
// ============================================================

const modules: { key: ModuleType; label: string; icon: React.ReactNode; color: string; shortLabel: string }[] = [
  { key: 'inicio', label: 'Inicio', shortLabel: 'Inicio', icon: <Home className="w-[18px] h-[18px]" />, color: '#60B5FF' },
  { key: 'marca', label: 'Mi Marca', shortLabel: 'Marca', icon: <Crown className="w-[18px] h-[18px]" />, color: '#FFF1B5' },
  { key: 'planificar', label: 'Planificar', shortLabel: 'Plan', icon: <Calendar className="w-[18px] h-[18px]" />, color: '#C1DBE8' },
  { key: 'crear', label: 'Crear', shortLabel: 'Crear', icon: <PenTool className="w-[18px] h-[18px]" />, color: '#BDB2FF' },
  { key: 'stories', label: 'Stories', shortLabel: 'Stories', icon: <Instagram className="w-[18px] h-[18px]" />, color: '#F4C2C2' },
  { key: 'ganchos', label: 'Banco de Ganchos', shortLabel: 'Ganchos', icon: <LayoutGrid className="w-[18px] h-[18px]" />, color: '#FF6D3F' },
  { key: 'asistente', label: 'Asistente', shortLabel: 'Asist.', icon: <Bot className="w-[18px] h-[18px]" />, color: '#B8E0D2' },
  { key: 'biblioteca', label: 'Biblioteca', shortLabel: 'Biblio.', icon: <BookOpen className="w-[18px] h-[18px]" />, color: '#7EC8E3' },
  { key: 'calendario', label: 'Calendario', shortLabel: 'Calend.', icon: <Sparkles className="w-[18px] h-[18px]" />, color: '#F5D76E' },
]

// En móvil mostramos los 5 principales en la barra inferior
const PRIMARY_MOBILE = ['inicio', 'planificar', 'crear', 'biblioteca', 'calendario'] as const

export function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()
  const mascotPhrase = useMemo(() => getRandomBravyPhrase(activeModule), [activeModule])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleModuleClick = (modKey: ModuleType) => {
    if (activeModule === modKey) {
      window.dispatchEvent(new CustomEvent('module-reactivate', { detail: { module: modKey } }))
    } else {
      setActiveModule(modKey)
    }
    setMobileMenuOpen(false)
  }

  // Cerrar menú móvil con Escape
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobileMenuOpen])

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR (md+)
          Sidebar vertical expandible a la izquierda
      ════════════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex w-[72px] hover:w-[240px] min-h-screen brave-gradient flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group/sidebar shadow-2xl overflow-hidden shrink-0">
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
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {modules.map((mod, index) => (
            <motion.button
              key={mod.key}
              onClick={() => handleModuleClick(mod.key)}
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
            onClick={() => window.dispatchEvent(new CustomEvent('openDameUnaIdea'))}
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

      {/* ════════════════════════════════════════════════════════════
          MÓVIL TOP BAR — logo pequeño + botón "Dame una idea"
      ════════════════════════════════════════════════════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 brave-gradient shadow-md">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <BravyBotMini />
            <div>
              <h1 className="text-sm font-bold text-white leading-none">BRAVE</h1>
              <p className="text-[8px] text-[#FFF1B5] font-semibold tracking-[0.15em] uppercase">Studio</p>
            </div>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openDameUnaIdea'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FFF1B5] to-[#F5D680] text-[#591427] font-bold text-xs shadow-md"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Dame una idea
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          MÓVIL BOTTOM NAVIGATION
          5 módulos principales + botón "Más"
      ════════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-pb">
        <div className="flex items-stretch justify-around px-1 py-1">
          {/* 5 módulos principales */}
          {PRIMARY_MOBILE.map(key => {
            const mod = modules.find(m => m.key === key)!
            const isActive = activeModule === key
            return (
              <button
                key={key}
                onClick={() => handleModuleClick(key)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-xl transition-all flex-1 min-w-0 ${
                  isActive ? 'text-[#591427]' : 'text-muted-foreground'
                }`}
              >
                <span
                  className="shrink-0 transition-transform"
                  style={{ color: isActive ? mod.color : undefined, transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                >
                  {mod.icon}
                </span>
                <span className={`text-[9px] font-medium truncate w-full text-center ${isActive ? 'font-bold' : ''}`}>
                  {mod.shortLabel}
                </span>
              </button>
            )
          })}

          {/* Botón Más */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-xl transition-all flex-1 min-w-0 ${
              mobileMenuOpen ? 'text-[#591427]' : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal className="w-[18px] h-[18px]" />
            <span className="text-[9px] font-medium">Más</span>
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════
          MÓVIL: Sheet con todos los módulos (se abre al pulsar "Más")
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl pb-4 safe-area-pb"
            >
              {/* Handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h3 className="text-base font-bold text-foreground">Todos los módulos</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Grid de módulos */}
              <div className="grid grid-cols-3 gap-3 p-5">
                {modules.map(mod => {
                  const isActive = activeModule === mod.key
                  return (
                    <button
                      key={mod.key}
                      onClick={() => handleModuleClick(mod.key)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                        isActive
                          ? 'brave-gradient text-white shadow-md'
                          : 'bg-muted/40 text-foreground hover:bg-muted'
                      }`}
                    >
                      <span
                        className="shrink-0"
                        style={{ color: isActive ? 'white' : mod.color }}
                      >
                        {mod.icon}
                      </span>
                      <span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? 'text-white' : ''}`}>
                        {mod.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              {/* Botón Dame una idea */}
              <div className="px-5 pb-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    window.dispatchEvent(new CustomEvent('openDameUnaIdea'))
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#FFF1B5] to-[#F5D680] text-[#591427] font-bold text-sm shadow-md"
                >
                  <Lightbulb className="w-4 h-4" />
                  Dame una idea
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
