'use client'

import { useState, useMemo, useCallback } from 'react'
import { BravyBot } from '@/components/brave/bravy-bot'
import { useAppStore, ContentItem } from '@/lib/store'
import { Input } from '@/components/ui/input'
import {
  Search, Trash2,
  FileText, Film, LayoutGrid, MessageSquare,
  Calendar,
} from 'lucide-react'
import { ContentCardModal } from './content-modal'
import { motion } from 'framer-motion'

type FilterType = 'todos' | 'reel' | 'carrusel' | 'story'

// ============================================================
// BIBLIOTECA — Versión simplificada
// Tarjetas grandes y claras. Al pulsar, abre el contenido completo.
// Dentro: guion, copy, hashtags + botón "Agendar en calendario".
// ============================================================

export function Biblioteca() {
  const { libraryItems, removeLibraryItem } = useAppStore()
  const [filterType, setFilterType] = useState<FilterType>('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [openItem, setOpenItem] = useState<ContentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Filtrado memoizado
  const filteredItems = useMemo(() => {
    return libraryItems
      .filter(item => filterType === 'todos' || item.tipo === filterType)
      .filter(item => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
          item.titulo.toLowerCase().includes(q) ||
          item.servicio.toLowerCase().includes(q) ||
          item.objetivo.toLowerCase().includes(q)
        )
      })
      // Más recientes primero
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }, [libraryItems, filterType, searchQuery])

  const getTipoIcon = useCallback((tipo: string) => {
    switch (tipo) {
      case 'reel': return <Film className="w-3.5 h-3.5" />
      case 'carrusel': return <LayoutGrid className="w-3.5 h-3.5" />
      case 'story': return <MessageSquare className="w-3.5 h-3.5" />
      default: return <FileText className="w-3.5 h-3.5" />
    }
  }, [])

  const getTipoColor = useCallback((tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C1DBE8] text-[#2A1520]'
      case 'carrusel': return 'bg-[#FFF1B5] text-[#591427]'
      case 'story': return 'bg-[#591427] text-white'
      default: return 'bg-gray-200 text-gray-700'
    }
  }, [])

  const getTipoLabel = useCallback((tipo: string) => {
    switch (tipo) {
      case 'reel': return 'Reel'
      case 'carrusel': return 'Carrusel'
      case 'story': return 'Story'
      default: return 'Contenido'
    }
  }, [])

  const getEstadoLabel = useCallback((estado: string) => {
    switch (estado) {
      case 'aprobado': return { label: 'Aprobado', color: 'bg-amber-100 text-amber-800' }
      case 'programado': return { label: 'En calendario', color: 'bg-emerald-100 text-emerald-800' }
      default: return { label: 'Borrador', color: 'bg-stone-100 text-stone-700' }
    }
  }, [])

  const handleAbrir = useCallback((item: ContentItem) => {
    setOpenItem(item)
    setModalOpen(true)
  }, [])

  // ── Estado vacío ──
  if (libraryItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="brave-float inline-block mb-4">
          <BravyBot size={72} expression="happy" animate />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tu Biblioteca está vacía</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Aquí aparecerán todas las ideas y contenidos que guardes. Empieza creando contenido o pidiendo una idea.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Biblioteca</h2>
        <p className="text-sm text-muted-foreground">
          {libraryItems.length} {libraryItems.length === 1 ? 'contenido guardado' : 'contenidos guardados'} · toca cualquiera para verlo completo
        </p>
      </div>

      {/* ── Buscador simple ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, servicio u objetivo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 rounded-2xl border-border bg-background"
        />
      </div>

      {/* ── Filtros de tipo (chips simples) ── */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'todos', label: 'Todos' },
          { key: 'reel', label: 'Reels' },
          { key: 'carrusel', label: 'Carruseles' },
          { key: 'story', label: 'Stories' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterType === f.key
                ? 'brave-gradient text-white shadow-sm'
                : 'bg-white text-muted-foreground border border-border hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Lista de tarjetas (TODO el card es clickeable) ── */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No hay contenidos con estos filtros</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => {
            const estado = getEstadoLabel(item.estado)
            return (
              <motion.button
                key={item.id}
                onClick={() => handleAbrir(item)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.25 }}
                className="w-full text-left brave-glass rounded-2xl p-4 hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer group"
              >
                {/* Fila 1: badges */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getTipoColor(item.tipo)}`}>
                    {getTipoIcon(item.tipo)}
                    {getTipoLabel(item.tipo)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
                    {estado.label}
                  </span>
                  {item.fecha && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {item.fecha}
                    </span>
                  )}
                </div>

                {/* Fila 2: título */}
                <h3 className="font-bold text-foreground text-base leading-snug mb-1 line-clamp-2">
                  {item.titulo}
                </h3>

                {/* Fila 3: info rápida */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.servicio && <span className="truncate">{item.servicio}</span>}
                  {item.servicio && item.objetivo && <span>·</span>}
                  {item.objetivo && <span className="capitalize">{item.objetivo}</span>}
                </div>

                {/* Fila 4: preview del guion */}
                {item.guion && (
                  <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-1 italic">
                    {item.guion}
                  </p>
                )}

                {/* Fila 5: acciones rápidas (no abren modal, son inline) */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs font-medium text-[#591427] group-hover:underline">
                    Toca para ver guion completo →
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeLibraryItem(item.id)
                    }}
                    className="text-muted-foreground hover:text-red-500 p-1 rounded transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* ── Modal de contenido completo ── */}
      <ContentCardModal
        item={openItem}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setOpenItem(null)
        }}
        onDelete={removeLibraryItem}
      />
    </div>
  )
}
