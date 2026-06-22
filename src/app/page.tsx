'use client'

import { useAppStore } from '@/lib/store'
import { AppSidebar } from '@/components/brave/app-sidebar'
import { MiMarca } from '@/components/brave/mi-marca'
import { Planificar } from '@/components/brave/planificar'
import { Crear } from '@/components/brave/crear'
import { Biblioteca } from '@/components/brave/biblioteca'
import { CalendarioView } from '@/components/brave/calendario'
import { StoriesBrave } from '@/components/brave/stories-brave'
import { AsistenteBrave } from '@/components/brave/asistente-brave'
import { BancoGanchos } from '@/components/brave/banco-ganchos'
import { AsistenteFlotante } from '@/components/brave/asistente-flotante'
import { DameUnaIdea } from '@/components/brave/dame-una-idea'
import { BravyBot } from '@/components/brave/bravy-bot'
import { useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'

const emptySubscribe = () => () => {}

export default function Home() {
  const { activeModule, isLoading, loadingMessage } = useAppStore()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#FFFBF0' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="brave-float inline-block mb-4">
            <BravyBot size={80} expression="wave" animate />
          </div>
          <h1 className="text-2xl font-bold text-[#591427] tracking-tight">BRÄVE STUDIO</h1>
          <p className="text-sm text-[#8A7080] mt-1">Cargando...</p>
        </motion.div>
      </div>
    )
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'marca': return <MiMarca />
      case 'planificar': return <Planificar />
      case 'crear': return <Crear />
      case 'stories': return <StoriesBrave />
      case 'ganchos': return <BancoGanchos />
      case 'asistente': return <AsistenteBrave />
      case 'biblioteca': return <Biblioteca />
      case 'calendario': return <CalendarioView />
      default: return <MiMarca />
    }
  }

  const mostrarFlotante = activeModule !== 'asistente'

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFBF0' }}>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="p-6 md:p-8 max-w-[1200px] mx-auto"
        >
          {renderModule()}
        </motion.div>
      </main>

      {/* Asistente BRÄVE flotante */}
      {mostrarFlotante && <AsistenteFlotante />}

      {/* Dame Una Idea Dialog */}
      <DameUnaIdea />

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/15 backdrop-blur-sm z-[60] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="brave-glass-strong rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
          >
            <div className="brave-float inline-block mb-4">
              <BravyBot size={72} expression="excited" animate speechBubble={loadingMessage || 'Generando...'} />
            </div>
            <p className="text-[#591427] font-medium text-sm mt-2">{loadingMessage || 'Generando contenido...'}</p>
            <div className="mt-4 h-1.5 bg-[#F5F0EB] rounded-full overflow-hidden">
              <div className="h-full brave-shimmer rounded-full" style={{ width: '60%' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
