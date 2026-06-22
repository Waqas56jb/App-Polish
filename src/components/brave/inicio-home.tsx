'use client'

import { useAppStore, ModuleType } from '@/lib/store'
import { BravyBot, getRandomMotivationalTip, getRandomBravyPhrase } from './bravy-bot'
import {
  Home,
  Calendar,
  PenTool,
  BookOpen,
  Crown,
  Lightbulb,
  Instagram,
  Bot,
  LayoutGrid,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'

const modules: { key: ModuleType; label: string; desc: string; icon: React.ReactNode; gradient: string; iconBg: string; borderColor: string }[] = [
  {
    key: 'marca',
    label: 'Mi Marca',
    desc: 'Define tu identidad y perfil profesional',
    icon: <Crown className="w-6 h-6" />,
    gradient: 'from-[#FFF1B5]/40 to-[#F5D76E]/20',
    iconBg: 'bg-[#FFF1B5]/80',
    borderColor: 'border-[#F5D76E]/40',
  },
  {
    key: 'planificar',
    label: 'Planificar',
    desc: 'Crea tu plan de contenido semanal o mensual',
    icon: <Calendar className="w-6 h-6" />,
    gradient: 'from-[#C1DBE8]/40 to-[#7EC8E3]/20',
    iconBg: 'bg-[#C1DBE8]/80',
    borderColor: 'border-[#7EC8E3]/40',
  },
  {
    key: 'crear',
    label: 'Crear',
    desc: 'Genera reels, carruseles y contenido completo',
    icon: <PenTool className="w-6 h-6" />,
    gradient: 'from-[#BDB2FF]/40 to-[#957DAD]/20',
    iconBg: 'bg-[#BDB2FF]/80',
    borderColor: 'border-[#957DAD]/40',
  },
  {
    key: 'stories',
    label: 'Stories',
    desc: 'Convierte tu trabajo diario en stories que venden',
    icon: <Instagram className="w-6 h-6" />,
    gradient: 'from-[#F4C2C2]/40 to-[#FFCBA4]/20',
    iconBg: 'bg-[#F4C2C2]/80',
    borderColor: 'border-[#F4C2C2]/40',
  },
  {
    key: 'ganchos',
    label: 'Banco de Ganchos',
    desc: 'Ganchos virales generados por IA para tus reels',
    icon: <LayoutGrid className="w-6 h-6" />,
    gradient: 'from-[#FF6D3F]/30 to-[#C26E4F]/15',
    iconBg: 'bg-[#FF6D3F]/80',
    borderColor: 'border-[#FF6D3F]/40',
  },
  {
    key: 'asistente',
    label: 'Asistente',
    desc: 'Tu experto en marketing capilar disponible 24/7',
    icon: <Bot className="w-6 h-6" />,
    gradient: 'from-[#B8E0D2]/40 to-[#6BA389]/20',
    iconBg: 'bg-[#B8E0D2]/80',
    borderColor: 'border-[#6BA389]/40',
  },
  {
    key: 'biblioteca',
    label: 'Biblioteca',
    desc: 'Todo tu contenido creado, guardado y organizado',
    icon: <BookOpen className="w-6 h-6" />,
    gradient: 'from-[#7EC8E3]/40 to-[#C1DBE8]/20',
    iconBg: 'bg-[#7EC8E3]/80',
    borderColor: 'border-[#7EC8E3]/40',
  },
  {
    key: 'calendario',
    label: 'Calendario',
    desc: 'Visualiza y organiza tu agenda de publicaciones',
    icon: <Sparkles className="w-6 h-6" />,
    gradient: 'from-[#F5D76E]/40 to-[#FFF1B5]/20',
    iconBg: 'bg-[#F5D76E]/80',
    borderColor: 'border-[#F5D76E]/40',
  },
]

const TIPS_ROTATION = [
  { icon: <Target className="w-5 h-5" />, text: 'Define tu marca personal antes de crear contenido. La identidad atrae a las clientas ideales.' },
  { icon: <Zap className="w-5 h-5" />, text: 'Un buen gancho en los primeros 3 segundos es la diferencia entre 100 y 10.000 visualizaciones.' },
  { icon: <TrendingUp className="w-5 h-5" />, text: 'La constancia supera a la perfeccion. Publica 3-4 veces por semana y veras crecer tu salon.' },
  { icon: <Sparkles className="w-5 h-5" />, text: 'Muestra el antes y despues. Las transformaciones reales son tu mejor contenido.' },
  { icon: <Lightbulb className="w-5 h-5" />, text: 'Responde dudas frecuentes en tus stories. Cada pregunta es un reel esperando a ser creado.' },
]

export function InicioHome() {
  const { setActiveModule, brandProfile, savedHooks, libraryItems } = useAppStore()
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS_ROTATION.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const hasBrand = !!brandProfile
  const contentCount = libraryItems.length
  const savedHooksCount = savedHooks.length

  const welcomePhrase = useMemo(() => getRandomBravyPhrase('inicio'), [])
  const currentTip = TIPS_ROTATION[tipIndex]

  return (
    <div className="max-w-[960px] mx-auto">
      {/* ── Hero: Welcome with BravyBot ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative overflow-hidden rounded-[28px] brave-gradient p-6 md:p-10 mb-6"
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/[0.03]" />
        <div className="absolute top-8 right-12 w-20 h-20 rounded-full bg-[#FFF1B5]/[0.08]" />
        <div className="absolute bottom-10 right-40 w-14 h-14 rounded-full bg-[#BDB2FF]/[0.08]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* BravyBot */}
          <div className="shrink-0 relative">
            <div className="brave-float">
              <BravyBot size={120} expression="wave" animate speechBubble={welcomePhrase} />
            </div>
            {/* Glow behind bot */}
            <div className="absolute inset-0 -z-10 blur-2xl opacity-30">
              <div className="w-full h-full rounded-full bg-[#60B5FF]/40" />
            </div>
          </div>

          {/* Welcome text */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight"
            >
              Bienvenida a
              <span className="block text-[#FFF1B5]">BRAVE Studio</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-white/70 text-sm md:text-base mt-3 max-w-md leading-relaxed"
            >
              Tu asistente de contenido inteligente. Crea, planifica y publica
              contenido que convierte seguidores en clientas reales.
            </motion.p>

            {/* Quick CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-5 flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
            >
              {!hasBrand ? (
                <button
                  onClick={() => setActiveModule('marca')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFF1B5] to-[#F5D680] text-[#591427] font-bold text-sm hover:from-[#FFE88A] hover:to-[#F5D080] transition-all duration-300 shadow-lg shadow-[#FFF1B5]/20 brave-card-hover"
                >
                  <Crown className="w-4 h-4" />
                  Configura tu marca
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveModule('crear')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFF1B5] to-[#F5D680] text-[#591427] font-bold text-sm hover:from-[#FFE88A] hover:to-[#F5D080] transition-all duration-300 shadow-lg shadow-[#FFF1B5]/20 brave-card-hover"
                >
                  <PenTool className="w-4 h-4" />
                  Crear contenido
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  const event = new CustomEvent('openDameUnaIdea')
                  window.dispatchEvent(event)
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Lightbulb className="w-4 h-4 text-[#FFF1B5]" />
                Dame una idea
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick stats bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="brave-glass rounded-2xl p-4 text-center brave-glow">
          <p className="text-2xl font-bold text-[#591427]">{contentCount}</p>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Contenidos creados</p>
        </div>
        <div className="brave-glass rounded-2xl p-4 text-center brave-glow">
          <p className="text-2xl font-bold text-[#591427]">{savedHooksCount}</p>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Ganchos guardados</p>
        </div>
        <div className="brave-glass rounded-2xl p-4 text-center brave-glow">
          <p className="text-2xl font-bold text-[#591427]">{hasBrand ? '✓' : '—'}</p>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Marca configurada</p>
        </div>
      </motion.div>

      {/* ── Rotating tip ── */}
      <motion.div
        key={tipIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mascot-banner rounded-2xl px-5 py-4 flex items-start gap-3.5 mb-6"
      >
        <div className="text-[#591427] mt-0.5 shrink-0">{currentTip.icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#591427] uppercase tracking-wide mb-1">Consejo BRAVE</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{currentTip.text}</p>
        </div>
      </motion.div>

      {/* ── Module cards grid ── */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#F5D76E]" />
          Tus herramientas
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map((mod, index) => (
            <motion.button
              key={mod.key}
              onClick={() => setActiveModule(mod.key)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * index, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`group relative text-left p-4 md:p-5 rounded-2xl bg-white border ${mod.borderColor} brave-card-hover brave-glow overflow-hidden`}
            >
              {/* Gradient background overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl`} />

              <div className="relative z-10 flex items-start gap-3.5">
                <div className={`shrink-0 w-11 h-11 rounded-xl ${mod.iconBg} text-white flex items-center justify-center shadow-sm`}>
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[15px] text-foreground">{mod.label}</h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-[#591427] group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Bottom motivation ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 mb-4 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C1DBE8]/20 via-[#FFF1B5]/20 to-[#BDB2FF]/20 rounded-full px-5 py-2.5 border border-[#C1DBE8]/20">
          <BravyBot size={22} expression="motivate" animate={false} />
          <p className="text-xs font-medium text-foreground/70">{getRandomMotivationalTip()}</p>
        </div>
      </motion.div>
    </div>
  )
}