'use client'

import { motion } from 'framer-motion'

// Cabecera editorial reutilizable (estilo Servify) para todos los módulos.
// eyebrow (label sage en mayúsculas) + título serif con palabra acentuada en cursiva sage + subtítulo.
export function PageHeader({
  eyebrow,
  title,
  accent,
  subtitle,
  align = 'left',
  children,
}: {
  eyebrow: string
  title: string
  accent?: string
  subtitle?: string
  align?: 'left' | 'center'
  children?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`mb-8 ${align === 'center' ? 'text-center' : ''}`}
    >
      <span className={`brave-eyebrow ${align === 'center' ? 'justify-center inline-flex' : ''}`}>{eyebrow}</span>
      <h1 className="font-serif text-3xl md:text-4xl font-light text-[#2A2A28] leading-tight mt-2.5">
        {title}
        {accent && <span className="italic text-[#8BAF8D]"> {accent}</span>}
      </h1>
      {subtitle && (
        <p className={`text-[#5C5C58] font-light mt-3 leading-relaxed ${align === 'center' ? 'max-w-xl mx-auto' : 'max-w-2xl'}`}>
          {subtitle}
        </p>
      )}
      {children}
    </motion.div>
  )
}
