'use client'

import { motion } from 'framer-motion'

interface BravyBotProps {
  size?: number
  expression?: 'happy' | 'excited' | 'thinking' | 'wave' | 'love' | 'motivate' | 'wink' | 'celebrate'
  className?: string
  animate?: boolean
  speechBubble?: string
}

export function BravyBot({
  size = 64,
  expression = 'happy',
  className = '',
  animate = true,
  speechBubble,
}: BravyBotProps) {
  const s = size
  const half = s / 2

  const getEyeTransform = () => {
    switch (expression) {
      case 'excited': return { scaleY: 1.3, ry: 4 }
      case 'thinking': return { ry: 6 }
      case 'love': return { rx: 3, ry: 3 }
      case 'wink': return { ry: 5 }
      case 'celebrate': return { scaleY: 1.1, ry: 5 }
      default: return { ry: 5 }
    }
  }

  const getMouthPath = () => {
    const cx = half
    const cy = half + 4
    switch (expression) {
      case 'excited':
        return `M ${cx - 7} ${cy - 3} Q ${cx} ${cy + 9} ${cx + 7} ${cy - 3}`
      case 'thinking':
        return `M ${cx - 4} ${cy + 1} L ${cx + 4} ${cy + 1}`
      case 'love':
        return `M ${cx - 6} ${cy - 1} Q ${cx} ${cy + 7} ${cx + 6} ${cy - 1}`
      case 'motivate':
        return `M ${cx - 8} ${cy - 4} Q ${cx} ${cy + 8} ${cx + 8} ${cy - 4}`
      case 'wink':
        return `M ${cx - 5} ${cy} Q ${cx + 2} ${cy + 6} ${cx + 5} ${cy}`
      case 'celebrate':
        return `M ${cx - 7} ${cy - 2} Q ${cx} ${cy + 10} ${cx + 7} ${cy - 2}`
      default:
        return `M ${cx - 5} ${cy} Q ${cx} ${cy + 6} ${cx + 5} ${cy}`
    }
  }

  const armAnimation = expression === 'wave'
    ? { rotate: [0, 20, -20, 20, 0], transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.8 } }
    : expression === 'celebrate'
    ? { rotate: [0, -15, 0, 15, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.3 } }
    : {}

  const showHearts = expression === 'love'
  const showSparkles = expression === 'excited' || expression === 'motivate' || expression === 'celebrate'
  const showStarBurst = expression === 'celebrate'
  const isWink = expression === 'wink'

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: s, height: s }}>
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-12 -right-2 bg-white rounded-2xl px-3.5 py-2 shadow-lg shadow-black/[0.06] border border-[#E8E4DF]/80 max-w-[160px] z-10"
        >
          <p className="text-[11px] font-medium text-[#1A1A2E] leading-snug">{speechBubble}</p>
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-r border-b border-[#E8E4DF]/80 rotate-45" />
        </motion.div>
      )}

      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bravyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C1DBE8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#BDB2FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bravyBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C1DBE8" />
            <stop offset="100%" stopColor="#A8C8DA" />
          </linearGradient>
          <linearGradient id="bravyAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B5" />
            <stop offset="100%" stopColor="#FFE88A" />
          </linearGradient>
          <linearGradient id="bravyCheekGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4C2C2" />
            <stop offset="100%" stopColor="#FFCBA4" />
          </linearGradient>
          <filter id="bravyShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1A1A2E" floodOpacity="0.1" />
          </filter>
          <filter id="bravyGlowFilter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx={half} cy={half} r={half} fill="url(#bravyGlow)" />

        <g filter="url(#bravyShadow)">
          {/* Antenna */}
          <motion.g
            animate={animate ? { rotate: [0, -4, 4, 0] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${half}px ${half * 0.5}px` }}
          >
            <line x1={half} y1={half * 0.5} x2={half} y2={half * 0.2} stroke="#591427" strokeWidth="2" strokeLinecap="round" />
            <motion.circle
              cx={half} cy={half * 0.16}
              r={4}
              fill="url(#bravyAccent)"
              animate={animate ? { opacity: [0.7, 1, 0.7], r: [3.5, 4.5, 3.5] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx={half} cy={half * 0.16} r={2} fill="#FFE066" />
          </motion.g>

          {/* Left arm */}
          <motion.g
            animate={animate ? armAnimation : {}}
            style={{ transformOrigin: `${half * 0.42}px ${half * 0.75}px` }}
          >
            <rect
              x={half * 0.26} y={half * 0.66}
              width={s * 0.07} height={s * 0.18}
              rx={s * 0.035}
              fill="url(#bravyBodyGrad)"
              stroke="#591427" strokeWidth="1.2"
            />
            <circle cx={half * 0.29} cy={half * 0.86} r={s * 0.045} fill="#FFF1B5" stroke="#591427" strokeWidth="1.2" />
          </motion.g>

          {/* Right arm */}
          <motion.g
            animate={animate ? armAnimation : {}}
            style={{ transformOrigin: `${half * 1.58}px ${half * 0.75}px` }}
          >
            <rect
              x={half * 0.67} y={half * 0.66}
              width={s * 0.07} height={s * 0.18}
              rx={s * 0.035}
              fill="url(#bravyBodyGrad)"
              stroke="#591427" strokeWidth="1.2"
            />
            <circle cx={half * 0.71} cy={half * 0.86} r={s * 0.045} fill="#FFF1B5" stroke="#591427" strokeWidth="1.2" />
          </motion.g>

          {/* Body */}
          <rect
            x={half * 0.36} y={half * 0.33}
            width={half * 1.28} height={half * 1.34}
            rx={s * 0.16}
            fill="url(#bravyBodyGrad)"
            stroke="#591427" strokeWidth="1.5"
          />

          {/* Screen/face area */}
          <rect
            x={half * 0.44} y={half * 0.43}
            width={half * 1.12} height={half * 0.84}
            rx={s * 0.09}
            fill="white"
            opacity="0.9"
          />

          {/* Eyes */}
          {showHearts ? (
            <>
              <text x={half * 0.72} y={half * 0.73} fontSize="12" fill="#591427">
                <motion.tspan
                  animate={animate ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >&#x2665;</motion.tspan>
              </text>
              <text x={half * 1.12} y={half * 0.73} fontSize="12" fill="#591427">
                <motion.tspan
                  animate={animate ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                >&#x2665;</motion.tspan>
              </text>
            </>
          ) : (
            <>
              {/* Left eye */}
              <motion.ellipse
                cx={half * 0.72} cy={half * 0.67}
                rx={getEyeTransform().rx || 5}
                ry={getEyeTransform().ry}
                fill="#591427"
                animate={animate && expression === 'thinking' ? { cx: [half * 0.72, half * 0.84, half * 0.72] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Right eye (wink = line) */}
              {isWink ? (
                <motion.line
                  x1={half * 1.18} y1={half * 0.67}
                  x2={half * 1.3} y2={half * 0.67}
                  stroke="#591427" strokeWidth="2" strokeLinecap="round"
                  animate={animate ? { x1: [half * 1.18, half * 1.15, half * 1.18], x2: [half * 1.3, half * 1.33, half * 1.3] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : (
                <ellipse
                  cx={half * 1.28} cy={half * 0.67}
                  rx={getEyeTransform().rx || 5}
                  ry={getEyeTransform().ry}
                  fill="#591427"
                />
              )}
              {/* Eye highlights */}
              {!isWink && (
                <>
                  <circle cx={half * 0.74} cy={half * 0.63} r={2.2} fill="white" />
                  <circle cx={half * 1.30} cy={half * 0.63} r={2.2} fill="white" />
                </>
              )}
            </>
          )}

          {/* Blush - warmer colors */}
          <ellipse cx={half * 0.58} cy={half * 0.8} rx={6} ry={3.5} fill="url(#bravyCheekGrad)" opacity="0.5" />
          <ellipse cx={half * 1.42} cy={half * 0.8} rx={6} ry={3.5} fill="url(#bravyCheekGrad)" opacity="0.5" />

          {/* Mouth */}
          <motion.path
            d={getMouthPath()}
            stroke="#591427"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            animate={animate && (expression === 'motivate' || expression === 'celebrate') ? { d: [
              getMouthPath(),
              `M ${half - 5} ${half + 6} Q ${half} ${half + 9} ${half + 5} ${half + 6}`,
              getMouthPath()
            ] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          />

          {/* Chest accent light */}
          <motion.circle
            cx={half} cy={half * 1.38}
            r={4.5}
            fill="url(#bravyAccent)"
            animate={animate ? { opacity: [0.7, 1, 0.7], r: [4, 5, 4] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx={half} cy={half * 1.38} r={2.2} fill="#FFE066" />

          {/* Feet */}
          <ellipse cx={half * 0.64} cy={half * 1.7} rx={s * 0.085} ry={s * 0.035} fill="url(#bravyBodyGrad)" stroke="#591427" strokeWidth="1.2" />
          <ellipse cx={half * 1.36} cy={half * 1.7} rx={s * 0.085} ry={s * 0.035} fill="url(#bravyBodyGrad)" stroke="#591427" strokeWidth="1.2" />
        </g>

        {/* Sparkles & Effects */}
        {showSparkles && animate && (
          <>
            <motion.circle
              cx={half * 0.18} cy={half * 0.28} r={2.5}
              fill="#FFF1B5"
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx={half * 1.75} cy={half * 0.38} r={2}
              fill="#C1DBE8"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx={half * 1.65} cy={half * 0.12} r={1.8}
              fill="#BDB2FF"
              animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
            {/* Extra sparkle for celebrate */}
            {showStarBurst && (
              <>
                <motion.circle
                  cx={half * 0.12} cy={half * 0.6} r={2}
                  fill="#FF6D3F"
                  animate={{ opacity: [0, 0.8, 0], scale: [0, 1.1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                />
                <motion.circle
                  cx={half * 1.85} cy={half * 0.65} r={2.2}
                  fill="#6BA389"
                  animate={{ opacity: [0, 0.8, 0], scale: [0, 1.1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
                />
              </>
            )}
          </>
        )}
      </svg>
    </div>
  )
}

// Mini version for tight spaces
export function BravyBotMini({ className = '' }: { className?: string }) {
  return (
    <BravyBot size={34} expression="happy" animate={false} className={className} />
  )
}

// Motivational phrases per module
export const BRAVY_PHRASES: Record<string, string[]> = {
  marca: [
    'Define tu marca, brillarás más! ✨',
    'Tu marca es única, cuéntala!',
    'Vamos a crear algo especial!',
  ],
  planificar: [
    'Planifica conmigo, todo encaja! 📋',
    'Organizamos tu mes perfecto!',
    'Un plan = más clientas!',
  ],
  crear: [
    'Crea algo que enamore! 🎬',
    'Tu próximo reel va a ser genial!',
    'A crear sin miedo!',
  ],
  stories: [
    'Stories que conectan! 📸',
    'Engancha a tu audiencia!',
    'Cuenta historias mágicas!',
  ],
  ganchos: [
    'Ganchos que atrapan! 🎣',
    'Cada gancho = más visualizaciones!',
    'Elige tu gancho perfecto!',
  ],
  asistente: [
    'Hola! Soy Bravy! 🤖',
    'Pregúntame lo que quieras!',
    'Estoy aquí para ti!',
  ],
  biblioteca: [
    'Tu biblioteca de oro! 📚',
    'Todo guardado y listo!',
    'Tus ideas, organizadas!',
  ],
  calendario: [
    'Tu mes, visualizado! 📅',
    'Todo programado, sin estrés!',
    'Organización = éxito!',
  ],
  loading: [
    'Creando magia... ✨',
    'Prepárate para algo bueno!',
    'Casi listo, espera!',
  ],
}

// Motivational tips that rotate
export const BRAVY_MOTIVATIONAL_TIPS = [
  'La constancia vence al talento 💪',
  'Cada post te acerca a tu objetivo 🎯',
  'Tu voz importa, compártela! 📣',
  'Hoy es buen día para crear 🌟',
  'Tu proxima clienta está en Instagram 🔍',
  'Un reel bien hecho = 10 clientas nuevas 🚀',
  'Las historias conectan de verdad ❤️',
  'Tú ya eres experta, solo muéstralo 👑',
  'El contenido de valor siempre gana 🏆',
  'No esperes la inspiración, créala! ⚡',
]

export function getRandomBravyPhrase(module: string): string {
  const phrases = BRAVY_PHRASES[module] || BRAVY_PHRASES.marca
  return phrases[Math.floor(Math.random() * phrases.length)]
}

export function getRandomMotivationalTip(): string {
  return BRAVY_MOTIVATIONAL_TIPS[Math.floor(Math.random() * BRAVY_MOTIVATIONAL_TIPS.length)]
}

// MascotMotivator component - a small banner with rotating tips
export function MascotMotivator({ module }: { module: string }) {
  const phrase = getRandomBravyPhrase(module)
  const tip = getRandomMotivationalTip()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mascot-banner rounded-2xl px-4 py-3 flex items-center gap-3"
    >
      <div className="brave-bounce">
        <BravyBot size={40} expression={module === 'ganchos' ? 'excited' : 'wink'} animate />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground leading-snug">{phrase}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{tip}</p>
      </div>
    </motion.div>
  )
}