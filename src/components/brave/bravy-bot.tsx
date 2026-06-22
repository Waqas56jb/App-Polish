'use client'

import { motion } from 'framer-motion'

interface BravyBotProps {
  size?: number
  expression?: 'happy' | 'excited' | 'thinking' | 'wave' | 'love' | 'motivate'
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

  // Eye animation variants
  const getEyeTransform = () => {
    switch (expression) {
      case 'excited': return { scaleY: 1.2, ry: 4 }
      case 'thinking': return { ry: 6 }
      case 'love': return { rx: 3, ry: 3 }
      default: return { ry: 5 }
    }
  }

  // Mouth path based on expression
  const getMouthPath = () => {
    const cx = half
    const cy = half + 4
    switch (expression) {
      case 'excited':
        return `M ${cx - 6} ${cy - 2} Q ${cx} ${cy + 8} ${cx + 6} ${cy - 2}`
      case 'thinking':
        return `M ${cx - 4} ${cy + 1} L ${cx + 4} ${cy + 1}`
      case 'love':
        return `M ${cx - 6} ${cy - 1} Q ${cx} ${cy + 6} ${cx + 6} ${cy - 1}`
      case 'motivate':
        return `M ${cx - 7} ${cy - 3} Q ${cx} ${cy + 7} ${cx + 7} ${cy - 3}`
      default:
        return `M ${cx - 5} ${cy} Q ${cx} ${cy + 5} ${cx + 5} ${cy}`
    }
  }

  // Arm wave animation for wave expression
  const armAnimation = expression === 'wave'
    ? { rotate: [0, 15, -15, 15, 0], transition: { duration: 1, repeat: Infinity, repeatDelay: 1 } }
    : {}

  // Heart for love expression
  const showHearts = expression === 'love'
  const showSparkles = expression === 'excited' || expression === 'motivate'

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: s, height: s }}>
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-10 -right-4 bg-white rounded-2xl px-3 py-1.5 shadow-lg border border-[#C1DBE8]/50 max-w-[140px] z-10"
        >
          <p className="text-[10px] font-medium text-[#2A1520] leading-tight">{speechBubble}</p>
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-r border-b border-[#C1DBE8]/50 rotate-45" />
        </motion.div>
      )}

      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow effect */}
        <defs>
          <radialGradient id="bravyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C1DBE8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C1DBE8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bravyBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C1DBE8" />
            <stop offset="100%" stopColor="#A8C8DA" />
          </linearGradient>
          <linearGradient id="bravyAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B5" />
            <stop offset="100%" stopColor="#FFE88A" />
          </linearGradient>
          <filter id="bravyShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#591427" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx={half} cy={half} r={half} fill="url(#bravyGlow)" />

        <g filter="url(#bravyShadow)">
          {/* Antenna */}
          <motion.g
            animate={animate ? { rotate: [0, -3, 3, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${half}px ${half * 0.5}px` }}
          >
            <line x1={half} y1={half * 0.5} x2={half} y2={half * 0.22} stroke="#591427" strokeWidth="2" strokeLinecap="round" />
            <circle cx={half} cy={half * 0.18} r={3} fill="#FFF1B5" />
            <circle cx={half} cy={half * 0.18} r={1.5} fill="#FFE066" />
          </motion.g>

          {/* Left arm */}
          <motion.g
            animate={animate ? armAnimation : {}}
            style={{ transformOrigin: `${half * 0.42}px ${half * 0.75}px` }}
          >
            <rect
              x={half * 0.28}
              y={half * 0.68}
              width={s * 0.06}
              height={s * 0.16}
              rx={s * 0.03}
              fill="url(#bravyBodyGrad)"
              stroke="#591427"
              strokeWidth="1.2"
            />
            <circle cx={half * 0.31} cy={half * 0.85} r={s * 0.04} fill="#FFF1B5" stroke="#591427" strokeWidth="1.2" />
          </motion.g>

          {/* Right arm */}
          <motion.g
            animate={animate ? armAnimation : {}}
            style={{ transformOrigin: `${half * 1.58}px ${half * 0.75}px` }}
          >
            <rect
              x={half * 0.66}
              y={half * 0.68}
              width={s * 0.06}
              height={s * 0.16}
              rx={s * 0.03}
              fill="url(#bravyBodyGrad)"
              stroke="#591427"
              strokeWidth="1.2"
            />
            <circle cx={half * 0.69} cy={half * 0.85} r={s * 0.04} fill="#FFF1B5" stroke="#591427" strokeWidth="1.2" />
          </motion.g>

          {/* Body */}
          <rect
            x={half * 0.38}
            y={half * 0.35}
            width={half * 1.24}
            height={half * 1.3}
            rx={s * 0.14}
            fill="url(#bravyBodyGrad)"
            stroke="#591427"
            strokeWidth="1.5"
          />

          {/* Screen/face area */}
          <rect
            x={half * 0.46}
            y={half * 0.45}
            width={half * 1.08}
            height={half * 0.8}
            rx={s * 0.08}
            fill="white"
            opacity="0.85"
          />

          {/* Eyes */}
          {showHearts ? (
            <>
              <text x={half * 0.72} y={half * 0.72} fontSize="10" fill="#591427">
                <motion.tspan
                  animate={animate ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >&#x2665;</motion.tspan>
              </text>
              <text x={half * 1.12} y={half * 0.72} fontSize="10" fill="#591427">
                <motion.tspan
                  animate={animate ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                >&#x2665;</motion.tspan>
              </text>
            </>
          ) : (
            <>
              <motion.ellipse
                cx={half * 0.75}
                cy={half * 0.67}
                rx={getEyeTransform().rx || 5}
                ry={getEyeTransform().ry}
                fill="#591427"
                animate={animate && expression === 'thinking' ? { cx: [half * 0.75, half * 0.85, half * 0.75] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <ellipse
                cx={half * 1.25}
                cy={half * 0.67}
                rx={getEyeTransform().rx || 5}
                ry={getEyeTransform().ry}
                fill="#591427"
              />
              {/* Eye highlights */}
              <circle cx={half * 0.77} cy={half * 0.63} r={2} fill="white" />
              <circle cx={half * 1.27} cy={half * 0.63} r={2} fill="white" />
            </>
          )}

          {/* Blush */}
          <ellipse cx={half * 0.62} cy={half * 0.78} rx={5} ry={3} fill="#FFF1B5" opacity="0.6" />
          <ellipse cx={half * 1.38} cy={half * 0.78} rx={5} ry={3} fill="#FFF1B5" opacity="0.6" />

          {/* Mouth */}
          <motion.path
            d={getMouthPath()}
            stroke="#591427"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            animate={animate && expression === 'motivate' ? { d: [
              getMouthPath(),
              `M ${half - 5} ${half + 6} Q ${half} ${half + 8} ${half + 5} ${half + 6}`,
              getMouthPath()
            ] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          />

          {/* Chest accent / heart light */}
          <motion.circle
            cx={half}
            cy={half * 1.38}
            r={4}
            fill="url(#bravyAccent)"
            animate={animate ? { opacity: [0.7, 1, 0.7], r: [3.5, 4.5, 3.5] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx={half} cy={half * 1.38} r={2} fill="#FFE066" />

          {/* Feet */}
          <ellipse cx={half * 0.65} cy={half * 1.68} rx={s * 0.08} ry={s * 0.035} fill="url(#bravyBodyGrad)" stroke="#591427" strokeWidth="1.2" />
          <ellipse cx={half * 1.35} cy={half * 1.68} rx={s * 0.08} ry={s * 0.035} fill="url(#bravyBodyGrad)" stroke="#591427" strokeWidth="1.2" />
        </g>

        {/* Sparkles */}
        {showSparkles && animate && (
          <>
            <motion.circle
              cx={half * 0.2} cy={half * 0.3} r={2}
              fill="#FFF1B5"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx={half * 1.7} cy={half * 0.4} r={2}
              fill="#C1DBE8"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx={half * 1.6} cy={half * 0.15} r={1.5}
              fill="#591427"
              animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
          </>
        )}
      </svg>
    </div>
  )
}

// Inline mini version for tight spaces
export function BravyBotMini({ className = '' }: { className?: string }) {
  return (
    <BravyBot size={32} expression="happy" animate={false} className={className} />
  )
}

// Motivational phrases that the mascot can show
export const BRAVY_PHRASES: Record<string, string[]> = {
  marca: ['Define tu marca! &#x2728;', 'Tu marca es unica!', 'Vamos a brillar!'],
  planificar: ['Planifica conmigo! &#x1F4C5;', 'Organizamos todo!', 'Un plan perfecto!'],
  crear: ['Crea algo genial! &#x1F3AC;', 'Tu proximo reel!', 'A crear!'],
  stories: ['Stories magicos! &#x1F4F8;', 'Engancha a tu audiencia!', 'Cuentame una historia!'],
  ganchos: ['Ganchos virales! &#x1F525;', 'Atrae mas clientas!', 'Hooks que funcionan!'],
  asistente: ['Hola! Soy Bravy! &#x1F916;', 'En que te ayudo?', 'Pregunta lo que quieras!'],
  biblioteca: ['Tu biblioteca! &#x1F4DA;', 'Todo guardado aqui!', 'Contenidos listos!'],
  calendario: ['Organiza tu mes! &#x1F4C6;', 'Visualiza tu plan!', 'Todo programado!'],
  loading: ['Creando magia... &#x2728;', 'Preparate!', 'Casi listo!'],
}

export function getRandomBravyPhrase(module: string): string {
  const phrases = BRAVY_PHRASES[module] || BRAVY_PHRASES.marca
  return phrases[Math.floor(Math.random() * phrases.length)]
}
