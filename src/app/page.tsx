'use client'

import { useAppStore } from '@/lib/store'
import { AppSidebar } from '@/components/brave/app-sidebar'
import { MiMarca } from '@/components/brave/mi-marca'
import { Planificar } from '@/components/brave/planificar'
import { Crear } from '@/components/brave/crear'
import { Biblioteca } from '@/components/brave/biblioteca'
import { CalendarioView } from '@/components/brave/calendario'
import { DameUnaIdea } from '@/components/brave/dame-una-idea'
import { Lightbulb } from 'lucide-react'
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export default function Home() {
  const { activeModule, isLoading, loadingMessage } = useAppStore()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#FBF7F5' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full brave-gradient shadow-lg mb-4 animate-pulse">
            <span className="text-2xl">👑</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2D1F22]">BRÄVE STUDIO</h1>
          <p className="text-sm text-muted-foreground mt-1">Cargando...</p>
        </div>
      </div>
    )
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'marca': return <MiMarca />
      case 'planificar': return <Planificar />
      case 'crear': return <Crear />
      case 'biblioteca': return <Biblioteca />
      case 'calendario': return <CalendarioView />
      default: return <MiMarca />
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#FBF7F5' }}>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="p-8 max-w-[1200px] mx-auto">
          {renderModule()}
        </div>
      </main>

      {/* Floating DAME UNA IDEA button (mobile) */}
      <button
        onClick={() => {
          const event = new CustomEvent('openDameUnaIdea')
          window.dispatchEvent(event)
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full brave-gradient shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 lg:hidden"
        title="Dame una idea"
      >
        <Lightbulb className="w-6 h-6" />
      </button>

      {/* Dame Una Idea Dialog */}
      <DameUnaIdea />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full brave-gradient shadow-lg mb-4">
              <span className="text-2xl animate-pulse">✨</span>
            </div>
            <p className="text-[#2D1F22] font-medium">{loadingMessage || 'Generando contenido...'}</p>
            <div className="mt-4 h-2 bg-[#F3E8E5] rounded-full overflow-hidden">
              <div className="h-full brave-gradient rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
