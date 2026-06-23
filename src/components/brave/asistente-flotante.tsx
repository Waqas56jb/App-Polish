'use client'

import { useAppStore } from '@/lib/store'
import { AsistenteBrave } from './asistente-brave'
import { BravyBotMini } from './bravy-bot'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export function AsistenteFlotante() {
  const { asistenteAbierto, setAsistenteAbierto, setActiveModule } = useAppStore()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) return null

  return (
    <>
      {/* Botón flotante with mascot */}
      <AnimatePresence>
        {!asistenteAbierto && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setAsistenteAbierto(true)}
            // En móvil: subimos el botón para que no se solape con la bottom bar (h-16 ≈ 64px)
            // En desktop: bottom-6 right-6 normal
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 group flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full brave-gradient shadow-xl text-white hover:scale-105 transition-transform brave-glow"
            title="Abrir Asistente BRÄVE"
          >
            <div className="brave-float">
              <BravyBotMini />
            </div>
            <span className="text-sm font-semibold hidden sm:inline">Chat</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFF1B5] rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Diálogo flotante */}
      <AnimatePresence>
        {asistenteAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setAsistenteAbierto(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#FFFBF0] w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col brave-glass-strong pt-14 sm:pt-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 overflow-y-auto">
                <AsistenteBrave
                  compacto
                  onClose={() => setAsistenteAbierto(false)}
                />
              </div>
              <div className="px-4 pb-4 sm:px-6 sm:pb-6 flex gap-2 border-t border-[#F5F0EB] pt-3">
                <button
                  onClick={() => {
                    setAsistenteAbierto(false)
                    setActiveModule('asistente')
                  }}
                  className="flex-1 text-xs px-3 py-2.5 rounded-2xl brave-gradient text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Abrir versión completa
                </button>
                <button
                  onClick={() => setAsistenteAbierto(false)}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#E8DDD5] text-[#2A1520] hover:bg-[#F5F0EB] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
