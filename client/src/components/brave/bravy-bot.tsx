'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'

interface BravyBotProps {
  size?: number
  expression?: 'happy' | 'excited' | 'thinking' | 'wave' | 'love' | 'motivate' | 'wink' | 'celebrate'
  className?: string
  animate?: boolean
  speechBubble?: string
}

// ─── Main BravyBot ───────────────────────────────────────────
// Style: white minimalist 3D robot, black visor face, blue glowing eyes, antenna, floating
// Memoizamos: BravyBot se renderiza mucho (loading, sidebar, headers, floating assistant).
// Con memo evitamos re-renders cuando el parent cambia estado no relacionado.
export const BravyBot = memo(function BravyBot({
  size = 64,
  expression = 'happy',
  className = '',
  animate = true,
  speechBubble,
}: BravyBotProps) {
  const s = size
  const cx = s / 2
  const cy = s / 2

  // ── Eye config per expression ──
  const getEyeStyle = () => {
    switch (expression) {
      case 'excited':   return { left: 'star', right: 'star', leftScale: 1.15, rightScale: 1.15 }
      case 'love':      return { left: 'heart', right: 'heart', leftScale: 1, rightScale: 1 }
      case 'wink':      return { left: 'normal', right: 'closed', leftScale: 1, rightScale: 1 }
      case 'thinking':  return { left: 'normal', right: 'normal', leftScale: 1, rightScale: 1, lookLeft: true }
      case 'celebrate': return { left: 'star', right: 'star', leftScale: 1.2, rightScale: 1.2 }
      case 'motivate':  return { left: 'normal', right: 'normal', leftScale: 1.15, rightScale: 1.15 }
      default:          return { left: 'normal', right: 'normal', leftScale: 1, rightScale: 1 }
    }
  }

  // ── Mouth path per expression ──
  const getMouth = () => {
    const my = cy + s * 0.14
    const w = s * 0.08
    switch (expression) {
      case 'excited':   return `M ${cx - w * 1.1} ${my - 2} Q ${cx} ${my + w * 1.4} ${cx + w * 1.1} ${my - 2}`
      case 'thinking':  return `M ${cx - w * 0.6} ${my + 1} L ${cx + w * 0.6} ${my + 1}`
      case 'love':      return `M ${cx - w} ${my - 1} Q ${cx} ${my + w * 1.2} ${cx + w} ${my - 1}`
      case 'motivate':  return `M ${cx - w * 1.2} ${my - 3} Q ${cx} ${my + w * 1.6} ${cx + w * 1.2} ${my - 3}`
      case 'celebrate': return `M ${cx - w * 1.1} ${my - 2} Q ${cx} ${my + w * 1.5} ${cx + w * 1.1} ${my - 2}`
      case 'wink':      return `M ${cx - w * 0.7} ${my} Q ${cx + w * 0.3} ${my + w} ${cx + w * 0.7} ${my}`
      default:          return `M ${cx - w * 0.8} ${my - 0.5} Q ${cx} ${my + w} ${cx + w * 0.8} ${my - 0.5}`
    }
  }

  // ── Arm animations ──
  const leftArmAnim = expression === 'wave'
    ? { rotate: [0, 25, -15, 25, 0], transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.7 } }
    : expression === 'celebrate'
    ? { rotate: [0, -20, 0, 20, 0], transition: { duration: 0.7, repeat: Infinity, repeatDelay: 0.3 } }
    : expression === 'love'
    ? { rotate: [0, 8, 0], transition: { duration: 1.5, repeat: Infinity, repeatDelay: 1 } }
    : {}

  const rightArmAnim = expression === 'celebrate'
    ? { rotate: [0, 20, 0, -20, 0], transition: { duration: 0.7, repeat: Infinity, repeatDelay: 0.3 } }
    : expression === 'love'
    ? { rotate: [0, -8, 0], transition: { duration: 1.5, repeat: Infinity, repeatDelay: 1 } }
    : {}

  const eyeStyle = getEyeStyle()
  const showHearts = expression === 'love'
  const showSparkles = expression === 'excited' || expression === 'motivate' || expression === 'celebrate'

  // ── Dimensions ──
  const bodyW = s * 0.52
  const bodyH = s * 0.48
  const bodyX = cx - bodyW / 2
  const bodyY = cy - bodyH / 2 + s * 0.06
  const bodyR = s * 0.14

  const visorW = bodyW * 0.82
  const visorH = bodyH * 0.48
  const visorX = cx - visorW / 2
  const visorY = bodyY + bodyH * 0.14

  const eyeY = visorY + visorH * 0.42
  const eyeSpread = visorW * 0.26
  const eyeLX = cx - eyeSpread
  const eyeRX = cx + eyeSpread
  const eyeSize = s * 0.055

  const mouthY = visorY + visorH * 0.78

  // Feet
  const footW = s * 0.12
  const footH = s * 0.05
  const footY = bodyY + bodyH + s * 0.01

  // Arms
  const armW = s * 0.06
  const armH = s * 0.18
  const armY = bodyY + bodyH * 0.35

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: s, height: s }}>
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, x: -8, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          // Bocadillo a la derecha del robot para no taparlo.
          // En móvil (pantalla pequeña) se posiciona arriba para no desbordar.
          className="absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-white rounded-2xl px-3.5 py-2.5 shadow-lg shadow-black/[0.08] border border-gray-100 max-w-[160px] z-10 sm:max-w-[180px]"
        >
          <p className="text-[11px] font-medium text-gray-700 leading-snug text-center">{speechBubble}</p>
          {/* Cola del bocadillo apuntando al robot (hacia la izquierda) */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-l border-b border-gray-100 -rotate-45" />
        </motion.div>
      )}

      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Body gradient - clean white with subtle 3D shading */}
          <linearGradient id="bravyBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F8F9FA" />
            <stop offset="100%" stopColor="#E9ECEF" />
          </linearGradient>

          {/* Subtle shadow for 3D depth */}
          <linearGradient id="bravyBodyShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#DEE2E6" stopOpacity="0.6" />
          </linearGradient>

          {/* Visor gradient - glossy black */}
          <linearGradient id="bravyVisor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C2C34" />
            <stop offset="40%" stopColor="#1A1A22" />
            <stop offset="100%" stopColor="#0D0D12" />
          </linearGradient>

          {/* Blue eye glow */}
          <radialGradient id="bravyEyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8BAF8D" stopOpacity="1" />
            <stop offset="60%" stopColor="#759E77" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#5C8A5E" stopOpacity="0.7" />
          </radialGradient>

          {/* Antenna glow */}
          <radialGradient id="bravyAntennaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8BAF8D" stopOpacity="1" />
            <stop offset="100%" stopColor="#759E77" stopOpacity="0.4" />
          </radialGradient>

          {/* Arm gradient */}
          <linearGradient id="bravyArm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E9ECEF" />
          </linearGradient>

          {/* 3D drop shadow */}
          <filter id="bravy3DShadow">
            <feDropShadow dx="0" dy={s * 0.04} stdDeviation={s * 0.04} floodColor="#1A1A22" floodOpacity="0.15" />
          </filter>

          {/* Blue glow filter */}
          <filter id="bravyBlueGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Antenna ── */}
        <motion.g
          animate={animate ? { rotate: [0, -3, 3, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${cx}px ${bodyY}px` }}
        >
          <line x1={cx} y1={bodyY + 2} x2={cx} y2={bodyY - s * 0.1} stroke="#CED4DA" strokeWidth={s * 0.025} strokeLinecap="round" />
          <motion.circle
            cx={cx}
            cy={bodyY - s * 0.1 - s * 0.025}
            r={s * 0.032}
            fill="url(#bravyAntennaGlow)"
            animate={animate ? { opacity: [0.6, 1, 0.6], r: [s * 0.028, s * 0.036, s * 0.028] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* ── Left arm ── */}
        <motion.g
          animate={animate ? leftArmAnim : {}}
          style={{ transformOrigin: `${bodyX + 1}px ${armY + 2}px` }}
        >
          <rect x={bodyX - armW + 2} y={armY} width={armW} height={armH} rx={armW / 2} fill="url(#bravyArm)" stroke="#DEE2E6" strokeWidth={s * 0.008} />
          {/* Hand */}
          <circle cx={bodyX - armW / 2 + 2} cy={armY + armH} r={s * 0.038} fill="#F8F9FA" stroke="#DEE2E6" strokeWidth={s * 0.008} />
        </motion.g>

        {/* ── Right arm ── */}
        <motion.g
          animate={animate ? rightArmAnim : {}}
          style={{ transformOrigin: `${bodyX + bodyW - 1}px ${armY + 2}px` }}
        >
          <rect x={bodyX + bodyW - 2} y={armY} width={armW} height={armH} rx={armW / 2} fill="url(#bravyArm)" stroke="#DEE2E6" strokeWidth={s * 0.008} />
          {/* Hand */}
          <circle cx={bodyX + bodyW - 2 + armW / 2} cy={armY + armH} r={s * 0.038} fill="#F8F9FA" stroke="#DEE2E6" strokeWidth={s * 0.008} />
        </motion.g>

        {/* ── Main body ── */}
        <g filter="url(#bravy3DShadow)">
          <rect
            x={bodyX} y={bodyY}
            width={bodyW} height={bodyH}
            rx={bodyR}
            fill="url(#bravyBody)"
            stroke="#DEE2E6"
            strokeWidth={s * 0.01}
          />
          {/* Subtle 3D overlay */}
          <rect
            x={bodyX} y={bodyY}
            width={bodyW} height={bodyH}
            rx={bodyR}
            fill="url(#bravyBodyShadow)"
          />
          {/* Top highlight for gloss */}
          <rect
            x={bodyX + bodyW * 0.1} y={bodyY + bodyH * 0.02}
            width={bodyW * 0.8} height={bodyH * 0.12}
            rx={bodyR * 0.6}
            fill="white"
            opacity="0.5"
          />
        </g>

        {/* ── Visor (black face area) ── */}
        <rect
          x={visorX} y={visorY}
          width={visorW} height={visorH}
          rx={s * 0.06}
          fill="url(#bravyVisor)"
        />
        {/* Visor glossy reflection */}
        <rect
          x={visorX + visorW * 0.08} y={visorY + visorH * 0.06}
          width={visorW * 0.84} height={visorH * 0.2}
          rx={s * 0.03}
          fill="white"
          opacity="0.06"
        />

        {/* ── Eyes ── */}
        {showHearts ? (
          <>
            <motion.text
              x={eyeLX} y={eyeY + 1}
              fontSize={s * 0.1}
              textAnchor="middle"
              fill="#E8D5B0"
              animate={animate ? { scale: [1, 1.2, 1] } : {}}
              style={{ transformOrigin: `${eyeLX}px ${eyeY}px` }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >&#9829;</motion.text>
            <motion.text
              x={eyeRX} y={eyeY + 1}
              fontSize={s * 0.1}
              textAnchor="middle"
              fill="#E8D5B0"
              animate={animate ? { scale: [1, 1.2, 1] } : {}}
              style={{ transformOrigin: `${eyeRX}px ${eyeY}px` }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
            >&#9829;</motion.text>
          </>
        ) : (
          <>
            {/* Left eye */}
            {eyeStyle.left === 'star' ? (
              <motion.text
                x={eyeLX} y={eyeY + s * 0.025}
                fontSize={s * 0.09}
                textAnchor="middle"
                fill="#8BAF8D"
                animate={animate ? { scale: [1, 1.2, 1] } : {}}
                style={{ transformOrigin: `${eyeLX}px ${eyeY}px` }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >&#10022;</motion.text>
            ) : (
              <motion.ellipse
                cx={eyeLX}
                cy={eyeY}
                rx={eyeSize * (eyeStyle.leftScale || 1)}
                ry={eyeSize * 0.75 * (eyeStyle.leftScale || 1)}
                fill="url(#bravyEyeGlow)"
                filter="url(#bravyBlueGlow)"
                animate={animate && eyeStyle.lookLeft ? { cx: [eyeLX, eyeLX - 3, eyeLX] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Right eye */}
            {eyeStyle.right === 'closed' ? (
              <motion.line
                x1={eyeRX - eyeSize * 0.7}
                y1={eyeY}
                x2={eyeRX + eyeSize * 0.7}
                y2={eyeY}
                stroke="#8BAF8D"
                strokeWidth={s * 0.018}
                strokeLinecap="round"
              />
            ) : eyeStyle.right === 'star' ? (
              <motion.text
                x={eyeRX} y={eyeY + s * 0.025}
                fontSize={s * 0.09}
                textAnchor="middle"
                fill="#8BAF8D"
                animate={animate ? { scale: [1, 1.2, 1] } : {}}
                style={{ transformOrigin: `${eyeRX}px ${eyeY}px` }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              >&#10022;</motion.text>
            ) : (
              <motion.ellipse
                cx={eyeRX}
                cy={eyeY}
                rx={eyeSize * (eyeStyle.rightScale || 1)}
                ry={eyeSize * 0.75 * (eyeStyle.rightScale || 1)}
                fill="url(#bravyEyeGlow)"
                filter="url(#bravyBlueGlow)"
                animate={animate && eyeStyle.lookLeft ? { cx: [eyeRX, eyeRX - 3, eyeRX] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Eye highlights (white dots for 3D look) */}
            {eyeStyle.left !== 'star' && eyeStyle.left !== 'heart' && (
              <circle cx={eyeLX + eyeSize * 0.25} cy={eyeY - eyeSize * 0.2} r={eyeSize * 0.22} fill="white" opacity="0.8" />
            )}
            {eyeStyle.right !== 'star' && eyeStyle.right !== 'heart' && eyeStyle.right !== 'closed' && (
              <circle cx={eyeRX + eyeSize * 0.25} cy={eyeY - eyeSize * 0.2} r={eyeSize * 0.22} fill="white" opacity="0.8" />
            )}
          </>
        )}

        {/* ── Mouth ── */}
        <motion.path
          d={getMouth().replace(/my/g, String(mouthY))}
          stroke="#8BAF8D"
          strokeWidth={s * 0.015}
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
          animate={animate && (expression === 'motivate' || expression === 'celebrate') ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* ── Chest accent (small blue circle) ── */}
        <motion.circle
          cx={cx}
          cy={bodyY + bodyH * 0.82}
          r={s * 0.025}
          fill="#8BAF8D"
          animate={animate ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Feet ── */}
        <ellipse cx={cx - s * 0.09} cy={footY} rx={footW / 2} ry={footH / 2} fill="url(#bravyArm)" stroke="#DEE2E6" strokeWidth={s * 0.008} />
        <ellipse cx={cx + s * 0.09} cy={footY} rx={footW / 2} ry={footH / 2} fill="url(#bravyArm)" stroke="#DEE2E6" strokeWidth={s * 0.008} />

        {/* ── Sparkles & Effects ── */}
        {showSparkles && animate && (
          <>
            <motion.circle
              cx={cx - s * 0.32} cy={cy - s * 0.2}
              r={s * 0.018}
              fill="#8BAF8D"
              animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx={cx + s * 0.35} cy={cy - s * 0.15}
              r={s * 0.015}
              fill="#C8DEC9"
              animate={{ opacity: [0, 0.8, 0], scale: [0, 1.1, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
            />
            <motion.circle
              cx={cx + s * 0.3} cy={cy + s * 0.3}
              r={s * 0.013}
              fill="#E8D5B0"
              animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}
            />
            {expression === 'celebrate' && (
              <>
                <motion.circle
                  cx={cx - s * 0.36} cy={cy + s * 0.1}
                  r={s * 0.016}
                  fill="#C9A96E"
                  animate={{ opacity: [0, 0.8, 0], scale: [0, 1.2, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 }}
                />
                <motion.circle
                  cx={cx + s * 0.38} cy={cy + s * 0.15}
                  r={s * 0.014}
                  fill="#759E77"
                  animate={{ opacity: [0, 0.8, 0], scale: [0, 1.1, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.9 }}
                />
              </>
            )}
          </>
        )}

        {/* Floating shadow beneath robot */}
        <ellipse
          cx={cx}
          cy={s * 0.94}
          rx={s * 0.18}
          ry={s * 0.025}
          fill="#1A1A22"
          opacity="0.06"
        />
      </svg>
    </div>
  )
})

// ─── Mini version for sidebar ────────────────────────────────
export function BravyBotMini({ className = '' }: { className?: string }) {
  return <BravyBot size={32} expression="happy" animate={false} className={className} />
}

// ─── Phrases per module ──────────────────────────────────────
export const BRAVY_PHRASES: Record<string, string[]> = {
  inicio: [
    'Bienvenida a BRAVE Studio!',
    'Vamos a crear contenido increible!',
    'Tu asistente de contenido esta listo!',
  ],
  marca: [
    'Define tu marca, brillaras mas!',
    'Tu marca es unica, cuentala!',
    'Vamos a crear algo especial!',
  ],
  planificar: [
    'Planifica conmigo, todo encaja!',
    'Organizamos tu mes perfecto!',
    'Un plan = mas clientas!',
  ],
  crear: [
    'Crea algo que enamore!',
    'Tu proximo reel va a ser genial!',
    'A crear sin miedo!',
  ],
  stories: [
    'Stories que conectan!',
    'Engancha a tu audiencia!',
    'Cuenta historias magicas!',
  ],
  ganchos: [
    'Ganchos que atrapan!',
    'Cada gancho = mas visualizaciones!',
    'Elige tu gancho perfecto!',
  ],
  asistente: [
    'Hola! Soy Bravy!',
    'Preguntame lo que quieras!',
    'Estoy aqui para ti!',
  ],
  biblioteca: [
    'Tu biblioteca de oro!',
    'Todo guardado y listo!',
    'Tus ideas, organizadas!',
  ],
  calendario: [
    'Tu mes, visualizado!',
    'Todo programado, sin estres!',
    'Organizacion = exito!',
  ],
  loading: [
    'Creando magia...',
    'Preparate para algo bueno!',
    'Casi listo, espera!',
  ],
}

export const BRAVY_MOTIVATIONAL_TIPS = [
  'La constancia vence al talento',
  'Cada post te acerca a tu objetivo',
  'Tu voz importa, compartela!',
  'Hoy es buen día para crear',
  'Tu proxima clienta esta en Instagram',
  'Un reel bien hecho = 10 clientas nuevas',
  'Las historias conectan de verdad',
  'Tu ya eres experta, solo muestralo',
  'El contenido de valor siempre gana',
  'No esperes la inspiracion, creala!',
]

export function getRandomBravyPhrase(module: string): string {
  const phrases = BRAVY_PHRASES[module] || BRAVY_PHRASES.inicio
  return phrases[Math.floor(Math.random() * phrases.length)]
}

export function getRandomMotivationalTip(): string {
  return BRAVY_MOTIVATIONAL_TIPS[Math.floor(Math.random() * BRAVY_MOTIVATIONAL_TIPS.length)]
}

// ─── MascotMotivator banner ──────────────────────────────────
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