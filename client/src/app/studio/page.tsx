'use client'

import { useAppStore } from '@/lib/store'
import { AppSidebar } from '@/components/brave/app-sidebar'
import dynamic from 'next/dynamic'
import { AsistenteFlotante } from '@/components/brave/asistente-flotante'
import { DameUnaIdea } from '@/components/brave/dame-una-idea'
import { BravyBot } from '@/components/brave/bravy-bot'
import { useSyncExternalStore, useMemo } from 'react'
import { motion } from 'framer-motion'

// Lazy-load módulos pesados para reducir el bundle inicial.
const InicioHome = dynamic(() => import('@/components/brave/inicio-home').then(m => ({ default: m.InicioHome })), {
  loading: () => <ModuleSkeleton />,
})
const MiMarca = dynamic(() => import('@/components/brave/mi-marca').then(m => ({ default: m.MiMarca })), {
  loading: () => <ModuleSkeleton />,
})
const Planificar = dynamic(() => import('@/components/brave/planificar').then(m => ({ default: m.Planificar })), {
  loading: () => <ModuleSkeleton />,
})
const Crear = dynamic(() => import('@/components/brave/crear').then(m => ({ default: m.Crear })), {
  loading: () => <ModuleSkeleton />,
})
const Biblioteca = dynamic(() => import('@/components/brave/biblioteca').then(m => ({ default: m.Biblioteca })), {
  loading: () => <ModuleSkeleton />,
})
const CalendarioView = dynamic(() => import('@/components/brave/calendario').then(m => ({ default: m.CalendarioView })), {
  loading: () => <ModuleSkeleton />,
})
const StoriesBrave = dynamic(() => import('@/components/brave/stories-brave').then(m => ({ default: m.StoriesBrave })), {
  loading: () => <ModuleSkeleton />,
})
const AsistenteBrave = dynamic(() => import('@/components/brave/asistente-brave').then(m => ({ default: m.AsistenteBrave })), {
  loading: () => <ModuleSkeleton />,
})
const BancoGanchos = dynamic(() => import('@/components/brave/banco-ganchos').then(m => ({ default: m.BancoGanchos })), {
  loading: () => <ModuleSkeleton />,
})

function ModuleSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="brave-float inline-block mb-4">
          <BravyBot size={64} expression="excited" animate />
        </div>
        <p className="text-sm text-[#9A9A94] font-light">Cargando módulo...</p>
      </div>
    </div>
  )
}

const emptySubscribe = () => () => {}

export default function StudioPage() {
  const { activeModule, isLoading, loadingMessage } = useAppStore()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const moduleElement = useMemo(() => {
    switch (activeModule) {
      case 'inicio': return <InicioHome />
      case 'marca': return <MiMarca />
      case 'planificar': return <Planificar />
      case 'crear': return <Crear />
      case 'stories': return <StoriesBrave />
      case 'ganchos': return <BancoGanchos />
      case 'asistente': return <AsistenteBrave />
      case 'biblioteca': return <Biblioteca />
      case 'calendario': return <CalendarioView />
      default: return <InicioHome />
    }
  }, [activeModule])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center brave-bg-pattern">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="brave-float inline-block mb-4">
            <BravyBot size={80} expression="wave" animate />
          </div>
          <h1 className="font-serif text-3xl font-light text-[#2A2A28] tracking-tight">Bräve Studio</h1>
          <p className="text-sm text-[#9A9A94] mt-1 font-light">Cargando...</p>
        </motion.div>
      </div>
    )
  }

  const mostrarFlotante = activeModule !== 'asistente'

  return (
    // h-screen + overflow-hidden en el shell: el sidebar queda fijo y SOLO el contenido scrollea
    <div className="flex h-screen brave-bg-pattern overflow-hidden">
      {/* Sidebar (fijo, no scrollea con el contenido) */}
      <AppSidebar />

      {/* Main Content — único elemento con scroll vertical */}
      <main className="flex-1 h-screen overflow-y-auto min-w-0">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="px-4 pt-16 pb-28 md:px-8 lg:px-10 md:pt-10 md:pb-12 max-w-[1100px] mx-auto safe-area-pt safe-area-pb"
        >
          {moduleElement}
        </motion.div>
      </main>

      {/* Asistente flotante (widget bottom-right) */}
      {mostrarFlotante && <AsistenteFlotante />}

      {/* Dame Una Idea Dialog */}
      <DameUnaIdea />

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#2A2A28]/15 backdrop-blur-sm z-[60] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="brave-glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
          >
            <div className="brave-float inline-block mb-4">
              <BravyBot size={72} expression="excited" animate speechBubble={loadingMessage || 'Generando...'} />
            </div>
            <p className="text-[#2A2A28] font-medium text-sm mt-2">{loadingMessage || 'Generando contenido...'}</p>
            <div className="mt-4 h-1.5 bg-[#EEF4EE] rounded-full overflow-hidden">
              <div className="h-full brave-shimmer rounded-full" style={{ width: '60%' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
