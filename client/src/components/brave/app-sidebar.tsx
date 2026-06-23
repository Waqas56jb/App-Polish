'use client'

import { useAppStore, ModuleType } from '@/lib/store'
import { BravyBotMini, getRandomBravyPhrase } from './bravy-bot'
import {
  Sparkles, Calendar, PenTool, BookOpen, Crown,
  Lightbulb, Instagram, Bot, LayoutGrid, Home,
  MoreHorizontal, X, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'

// ============================================================
// SIDEBAR RESPONSIVE — Servify sage/cream theme
// - Phone (< md): top bar + bottom navigation + "Más" sheet
// - Tablet (md): icon rail, collapsed by default, toggle to expand
// - Laptop/Desktop (lg+): full sidebar expanded by default, collapsible
// Toggle is tap-driven (no hover) so it works identically on touch + mouse.
// ============================================================

const modules: { key: ModuleType; label: string; icon: React.ReactNode; color: string; shortLabel: string }[] = [
  { key: 'inicio', label: 'Inicio', shortLabel: 'Inicio', icon: <Home className="w-[18px] h-[18px]" />, color: '#8BAF8D' },
  { key: 'marca', label: 'Mi Marca', shortLabel: 'Marca', icon: <Crown className="w-[18px] h-[18px]" />, color: '#C9A96E' },
  { key: 'planificar', label: 'Planificar', shortLabel: 'Plan', icon: <Calendar className="w-[18px] h-[18px]" />, color: '#C8DEC9' },
  { key: 'crear', label: 'Crear', shortLabel: 'Crear', icon: <PenTool className="w-[18px] h-[18px]" />, color: '#8BAF8D' },
  { key: 'stories', label: 'Stories', shortLabel: 'Stories', icon: <Instagram className="w-[18px] h-[18px]" />, color: '#E8D5B0' },
  { key: 'ganchos', label: 'Banco de Ganchos', shortLabel: 'Ganchos', icon: <LayoutGrid className="w-[18px] h-[18px]" />, color: '#C9A96E' },
  { key: 'asistente', label: 'Asistente', shortLabel: 'Asist.', icon: <Bot className="w-[18px] h-[18px]" />, color: '#759E77' },
  { key: 'biblioteca', label: 'Biblioteca', shortLabel: 'Biblio.', icon: <BookOpen className="w-[18px] h-[18px]" />, color: '#C8DEC9' },
  { key: 'calendario', label: 'Calendario', shortLabel: 'Calend.', icon: <Sparkles className="w-[18px] h-[18px]" />, color: '#C9A96E' },
]

// En móvil mostramos los 5 principales en la barra inferior
const PRIMARY_MOBILE = ['inicio', 'planificar', 'crear', 'biblioteca', 'calendario'] as const

export function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()
  const mascotPhrase = useMemo(() => getRandomBravyPhrase(activeModule), [activeModule])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Colapsado por defecto en tablet (md), expandido en laptop/desktop (lg+)
  const [collapsed, setCollapsed] = useState(false)

  const handleModuleClick = (modKey: ModuleType) => {
    if (activeModule === modKey) {
      window.dispatchEvent(new CustomEvent('module-reactivate', { detail: { module: modKey } }))
    } else {
      setActiveModule(modKey)
    }
    setMobileMenuOpen(false)
  }

  // Estado inicial según viewport: colapsado por debajo de lg (1024px)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const apply = () => setCollapsed(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Cerrar menú móvil con Escape
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobileMenuOpen])

  const showLabels = !collapsed

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          TABLET / DESKTOP SIDEBAR (md+) — charcoal premium panel
      ════════════════════════════════════════════════════════════ */}
      <aside
        className={`hidden md:flex h-screen brave-gradient flex-col transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] shadow-2xl overflow-hidden shrink-0 z-40 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo + toggle */}
        <div className="px-3 py-5 border-b border-white/10">
          <div className={`flex ${collapsed ? 'flex-col items-center gap-3' : 'items-center gap-2.5'}`}>
            <Link href="/" className="shrink-0" title="Ir al inicio">
              <BravyBotMini />
            </Link>
            {showLabels && (
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-2xl font-light text-[#FAF7F2] tracking-tight leading-none">
                  Bräve<span className="text-[#8BAF8D] italic"> Studio</span>
                </h1>
                <p className="text-[8px] text-[#C8DEC9] font-medium tracking-[0.22em] uppercase mt-1">
                  Tu contenido, sin pensar
                </p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(v => !v)}
              className="shrink-0 p-1.5 rounded-lg text-[#FAF7F2]/60 hover:text-[#FAF7F2] hover:bg-white/10 transition-colors"
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {collapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
            </button>
          </div>

          {showLabels && (
            <div className="mt-3 mascot-banner rounded-2xl px-3 py-2">
              <p className="text-[11px] text-[#FAF7F2]/90 font-light leading-snug">{mascotPhrase}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {showLabels && (
            <p className="brave-eyebrow px-2.5 mb-2 text-[0.62rem]">Módulos</p>
          )}
          {modules.map((mod, index) => {
            const isActive = activeModule === mod.key
            return (
              <motion.button
                key={mod.key}
                onClick={() => handleModuleClick(mod.key)}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                title={collapsed ? mod.label : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 brave-nav-item ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'active bg-white/12 text-[#FAF7F2] shadow-lg shadow-black/20'
                    : 'text-[#FAF7F2]/55 hover:bg-white/8 hover:text-[#FAF7F2]'
                }`}
              >
                <span
                  className="shrink-0 transition-colors duration-200"
                  style={{ color: isActive ? mod.color : undefined }}
                >
                  {mod.icon}
                </span>
                {showLabels && <span className="min-w-0 truncate">{mod.label}</span>}
              </motion.button>
            )
          })}
        </nav>

        {/* DAME UNA IDEA button — gold pill */}
        <div className="px-2.5 pb-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openDameUnaIdea'))}
            title={collapsed ? 'Dame una idea' : undefined}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-2.5 rounded-full bg-gradient-to-r from-[#E8D5B0] to-[#C9A96E] text-[#2A2A28] font-semibold text-[12px] tracking-[0.04em] uppercase hover:from-[#C9A96E] hover:to-[#C9A96E] transition-all duration-200 shadow-lg shadow-[#C9A96E]/20 brave-card-hover"
          >
            <Lightbulb className="w-[18px] h-[18px] shrink-0" />
            {showLabels && <span className="min-w-0 truncate">Dame una idea</span>}
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════
          MÓVIL TOP BAR — logo + botón "Dame una idea"
      ════════════════════════════════════════════════════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 brave-glass border-b border-[rgba(42,42,40,0.06)] safe-area-pt">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <BravyBotMini />
            <h1 className="font-serif text-xl font-light text-[#2A2A28] leading-none">
              Bräve<span className="text-[#8BAF8D] italic"> Studio</span>
            </h1>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openDameUnaIdea'))}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#E8D5B0] to-[#C9A96E] text-[#2A2A28] font-semibold text-[11px] tracking-[0.04em] uppercase shadow-md"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Idea
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          MÓVIL BOTTOM NAVIGATION — 5 módulos + "Más"
      ════════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[rgba(42,42,40,0.08)] shadow-[0_-2px_16px_rgba(42,42,40,0.06)] safe-area-pb">
        <div className="flex items-stretch justify-around px-1 py-1">
          {PRIMARY_MOBILE.map(key => {
            const mod = modules.find(m => m.key === key)!
            const isActive = activeModule === key
            return (
              <button
                key={key}
                onClick={() => handleModuleClick(key)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-xl transition-all flex-1 min-w-0 ${
                  isActive ? 'text-[#2A2A28]' : 'text-[#9A9A94]'
                }`}
              >
                <span
                  className="shrink-0 transition-transform"
                  style={{ color: isActive ? mod.color : undefined, transform: isActive ? 'scale(1.12)' : 'scale(1)' }}
                >
                  {mod.icon}
                </span>
                <span className={`text-[9px] truncate w-full text-center ${isActive ? 'font-semibold' : 'font-light'}`}>
                  {mod.shortLabel}
                </span>
              </button>
            )
          })}

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-xl transition-all flex-1 min-w-0 ${
              mobileMenuOpen ? 'text-[#2A2A28]' : 'text-[#9A9A94]'
            }`}
          >
            <MoreHorizontal className="w-[18px] h-[18px]" />
            <span className="text-[9px] font-light">Más</span>
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════
          MÓVIL: Sheet con todos los módulos
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-[#2A2A28]/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF7F2] rounded-t-3xl shadow-2xl pb-4 safe-area-pb"
            >
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#C8DEC9]" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(42,42,40,0.08)]">
                <h3 className="font-serif text-xl font-light text-[#2A2A28]">Todos los módulos</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#EEF4EE] transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4 text-[#5C5C58]" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 p-5">
                {modules.map(mod => {
                  const isActive = activeModule === mod.key
                  return (
                    <button
                      key={mod.key}
                      onClick={() => handleModuleClick(mod.key)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-[#8BAF8D] text-white shadow-md'
                          : 'bg-white text-[#2A2A28] border border-[rgba(42,42,40,0.08)] hover:bg-[#EEF4EE]'
                      }`}
                    >
                      <span className="shrink-0" style={{ color: isActive ? 'white' : mod.color }}>
                        {mod.icon}
                      </span>
                      <span className={`text-[11px] font-medium text-center leading-tight ${isActive ? 'text-white' : ''}`}>
                        {mod.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="px-5 pb-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    window.dispatchEvent(new CustomEvent('openDameUnaIdea'))
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-[#E8D5B0] to-[#C9A96E] text-[#2A2A28] font-semibold text-sm tracking-[0.04em] uppercase shadow-md"
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
