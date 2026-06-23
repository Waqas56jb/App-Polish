'use client'

import { useAppStore } from '@/lib/store'
import { AsistenteBrave } from './asistente-brave'
import { BravyBotMini } from './bravy-bot'
import { X, MessageCircle, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export function AsistenteFlotante() {
  const { asistenteAbierto, setAsistenteAbierto, setActiveModule } = useAppStore()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) return null

  return (
    <>
      {/* Botón flotante (bottom-right) */}
      <AnimatePresence>
        {!asistenteAbierto && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setAsistenteAbierto(true)}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 group flex items-center gap-2.5 pl-2.5 pr-5 py-2.5 rounded-full bg-[#2A2A28] shadow-xl text-[#FAF7F2] hover:bg-[#34342F] hover:-translate-y-0.5 transition-all duration-300"
            title="Abrir Asistente Bräve"
          >
            <div className="brave-float">
              <BravyBotMini />
            </div>
            <span className="text-[0.8rem] font-medium tracking-[0.04em] uppercase">Chat</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#8BAF8D] rounded-full border-2 border-[#2A2A28] brave-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget de conversación — docked bottom-right (full-screen en móvil) */}
      <AnimatePresence>
        {asistenteAbierto && (
          <>
            {/* Backdrop solo en móvil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-[#2A2A28]/30 backdrop-blur-sm"
              onClick={() => setAsistenteAbierto(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed z-50 flex flex-col overflow-hidden bg-[#FAF7F2] shadow-2xl border border-[rgba(42,42,40,0.1)]
                         inset-x-0 bottom-0 top-14 rounded-t-3xl
                         md:inset-auto md:bottom-6 md:right-6 md:top-auto md:w-[400px] md:h-[600px] md:max-h-[80vh] md:rounded-3xl"
            >
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-[#2A2A28] text-[#FAF7F2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#8BAF8D]" strokeWidth={1.75} />
                  </div>
                  <div className="leading-tight">
                    <p className="font-serif text-lg font-light">Asistente <span className="italic text-[#8BAF8D]">Bräve</span></p>
                    <p className="text-[10px] text-[#C8DEC9] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] inline-block" /> En línea
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setAsistenteAbierto(false); setActiveModule('asistente') }}
                    className="p-2 rounded-lg text-[#FAF7F2]/60 hover:text-[#FAF7F2] hover:bg-white/10 transition-colors"
                    title="Abrir versión completa"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAsistenteAbierto(false)}
                    className="p-2 rounded-lg text-[#FAF7F2]/60 hover:text-[#FAF7F2] hover:bg-white/10 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
                <AsistenteBrave compacto onClose={() => setAsistenteAbierto(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
