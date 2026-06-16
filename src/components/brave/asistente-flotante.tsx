'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { AsistenteBrave } from './asistente-brave'
import { Bot, X } from 'lucide-react'

export function AsistenteFlotante() {
  const { asistenteAbierto, setAsistenteAbierto, setActiveModule } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAsistenteAbierto(true)}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 px-4 py-3 rounded-full brave-gradient shadow-xl text-white hover:scale-105 transition-transform"
        title="Abrir Asistente BRÄVE"
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Asistente BRÄVE</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C9A96E] rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Diálogo flotante */}
      {asistenteAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setAsistenteAbierto(false)}
        >
          <div
            className="bg-[#FBF7F5] w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 overflow-y-auto">
              <AsistenteBrave
                compacto
                onClose={() => setAsistenteAbierto(false)}
              />
            </div>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6 flex gap-2 border-t border-[#F3E8E5] pt-3">
              <button
                onClick={() => {
                  setAsistenteAbierto(false)
                  setActiveModule('asistente')
                }}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#7D2E42] text-white hover:bg-[#5d2334] transition-colors"
              >
                Abrir versión completa
              </button>
              <button
                onClick={() => setAsistenteAbierto(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#F3E8E5] text-[#2D1F22] hover:bg-[#FBF7F5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
