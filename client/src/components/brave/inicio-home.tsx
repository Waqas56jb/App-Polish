'use client'

import { useAppStore, ModuleType } from '@/lib/store'
import { BravyBot, getRandomMotivationalTip, getRandomBravyPhrase } from './bravy-bot'
import {
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

const modules: { key: ModuleType; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'marca', label: 'Mi Marca', desc: 'Define tu identidad y perfil profesional', icon: <Crown className="w-5 h-5" strokeWidth={1.5} /> },
  { key: 'planificar', label: 'Planificar', desc: 'Crea tu plan de contenido semanal o mensual', icon: <Calendar className="w-5 h-5" strokeWidth={1.5} /> },
  { key: 'crear', label: 'Crear', desc: 'Genera reels, carruseles y contenido completo', icon: <PenTool className="w-5 h-5" strokeWidth={1.5} /> },
  { key: 'stories', label: 'Stories', desc: 'Convierte tu trabajo diario en stories que venden', icon: <Instagram className="w-5 h-5" strokeWidth={1.5} /> },
  { key: 'ganchos', label: 'Banco de Ganchos', desc: 'Ganchos virales generados por IA para tus reels', icon: <LayoutGrid className="w-5 h-5" strokeWidth={1.5} /> },
  { key: 'asistente', label: 'Asistente', desc: 'Tu experto en marketing capilar disponible 24/7', icon: <Bot className="w-5 h-5" strokeWidth={1.5} /> },
  { key: 'biblioteca', label: 'Biblioteca', desc: 'Todo tu contenido creado, guardado y organizado', icon: <BookOpen className="w-5 h-5" strokeWidth={1.5} /> },
  { key: 'calendario', label: 'Calendario', desc: 'Visualiza y organiza tu agenda de publicaciones', icon: <Sparkles className="w-5 h-5" strokeWidth={1.5} /> },
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
  const motivationalTip = useMemo(() => getRandomMotivationalTip(), [])
  const currentTip = TIPS_ROTATION[tipIndex]

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ── Hero: editorial welcome ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative overflow-hidden rounded-[28px] brave-gradient p-8 md:p-12 lg:p-14 mb-8"
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#8BAF8D]/[0.10]" />
        <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-white/[0.03]" />
        <div className="absolute top-10 right-16 w-24 h-24 rounded-full bg-[#C9A96E]/[0.08]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Welcome text */}
          <div className="text-center md:text-left flex-1 min-w-0 order-2 md:order-1">
            <span className="brave-eyebrow !text-[#C8DEC9] justify-center md:justify-start flex">
              Tu contenido, sin pensar
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="font-serif text-4xl md:text-5xl lg:text-[3.4rem] font-light text-[#FAF7F2] leading-[1.08] tracking-tight mt-3"
            >
              Bienvenida a{' '}
              <span className="italic text-[#8BAF8D]">Bräve Studio</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
              className="text-[#FAF7F2]/65 text-sm md:text-base mt-4 max-w-lg leading-relaxed font-light mx-auto md:mx-0"
            >
              Tu asistente de contenido inteligente. Crea, planifica y publica
              contenido que convierte seguidores en clientas reales.
            </motion.p>

            {/* Quick CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.4 }}
              className="mt-7 flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
            >
              <button
                onClick={() => setActiveModule(hasBrand ? 'crear' : 'marca')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#8BAF8D] text-white text-[0.8rem] font-medium tracking-[0.06em] uppercase hover:bg-[#759E77] hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-[#8BAF8D]/25"
              >
                {hasBrand ? <PenTool className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                {hasBrand ? 'Crear contenido' : 'Configura tu marca'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openDameUnaIdea'))}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-transparent text-[#FAF7F2] text-[0.8rem] font-medium tracking-[0.06em] uppercase border border-white/25 hover:bg-white/10 transition-all duration-300"
              >
                <Lightbulb className="w-4 h-4 text-[#E8D5B0]" />
                Dame una idea
              </button>
            </motion.div>
          </div>

          {/* BravyBot */}
          <div className="shrink-0 relative order-1 md:order-2">
            <div className="brave-float">
              <BravyBot size={132} expression="wave" animate />
            </div>
            <div className="absolute inset-0 -z-10 blur-3xl opacity-40">
              <div className="w-full h-full rounded-full bg-[#8BAF8D]/40" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-3 gap-3 md:gap-5 mb-10"
      >
        {[
          { value: contentCount, label: 'Contenidos creados' },
          { value: savedHooksCount, label: 'Ganchos guardados' },
          { value: hasBrand ? '✓' : '—', label: 'Marca configurada' },
        ].map((stat, i) => (
          <div key={i} className="brave-glass rounded-[20px] p-5 md:p-6 text-center brave-card-hover">
            <p className="font-serif text-4xl md:text-5xl font-light text-[#8BAF8D] leading-none">{stat.value}</p>
            <p className="text-[11px] md:text-xs text-[#9A9A94] font-medium mt-2 tracking-wide">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Rotating tip ── */}
      <motion.div
        key={tipIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mascot-banner rounded-[20px] px-6 py-5 flex items-start gap-4 mb-10"
      >
        <div className="text-[#8BAF8D] mt-0.5 shrink-0">{currentTip.icon}</div>
        <div className="min-w-0 flex-1">
          <p className="brave-eyebrow mb-1.5">Consejo Bräve</p>
          <p className="text-sm md:text-[15px] text-[#5C5C58] leading-relaxed font-light">{currentTip.text}</p>
        </div>
      </motion.div>

      {/* ── Module cards grid ── */}
      <div>
        <div className="mb-6">
          <span className="brave-eyebrow">Explora</span>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-[#2A2A28] mt-2">Tus herramientas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {modules.map((mod, index) => (
            <motion.button
              key={mod.key}
              onClick={() => setActiveModule(mod.key)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group relative text-left p-6 rounded-[20px] bg-white border border-[rgba(42,42,40,0.08)] brave-card-hover overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#EEF4EE] text-[#8BAF8D] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#8BAF8D] group-hover:text-white">
                  {mod.icon}
                </div>
                <ArrowRight className="w-4 h-4 text-[#C8DEC9] group-hover:text-[#8BAF8D] group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#2A2A28] leading-tight">{mod.label}</h3>
              <p className="text-[13px] text-[#9A9A94] mt-1.5 leading-relaxed font-light">{mod.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Bottom motivation ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 mb-4 text-center"
      >
        <div className="inline-flex items-center gap-2.5 bg-white border border-[rgba(42,42,40,0.08)] rounded-full px-6 py-3 brave-glow">
          <BravyBot size={24} expression="motivate" animate={false} />
          <p className="text-[13px] font-light text-[#5C5C58]">{motivationalTip}</p>
        </div>
      </motion.div>
    </div>
  )
}