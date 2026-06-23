'use client'

import { useState, useMemo, useCallback } from 'react'
import { BravyBot } from '@/components/brave/bravy-bot'
import { useAppStore, ContentItem } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen, Search, Copy, Trash2, Edit3, Maximize2,
  FileText, Calendar, Film, LayoutGrid, MessageSquare,
  Filter
} from 'lucide-react'
import { ContentCardModal } from './content-modal'

type FilterType = 'todos' | 'reel' | 'carrusel' | 'story'
type FilterObjetivo = '' | 'autoridad' | 'reservas' | 'visibilidad' | 'educación' | 'venta' | 'deseo' | 'objeción'

export function Biblioteca() {
  const { libraryItems, removeLibraryItem, updateLibraryItem, scheduleContentItem } = useAppStore()
  const [filterType, setFilterType] = useState<FilterType>('todos')
  const [filterObjetivo, setFilterObjetivo] = useState<FilterObjetivo>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openItem, setOpenItem] = useState<ContentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Memoizamos el filtrado para no recalcular en cada render
  // (por ejemplo, cuando se abre/cierra un modal sin cambiar los filtros).
  const filteredItems = useMemo(() => libraryItems.filter((item) => {
    if (filterType !== 'todos' && item.tipo !== filterType) return false
    if (filterObjetivo && item.objetivo !== filterObjetivo) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.titulo.toLowerCase().includes(q) ||
        item.servicio.toLowerCase().includes(q) ||
        item.copy.toLowerCase().includes(q)
      )
    }
    return true
  }), [libraryItems, filterType, filterObjetivo, searchQuery])

  // Helpers estables: se recrean solo si cambian las dependencias (nunca en este caso).
  const getTipoIcon = useCallback((tipo: string) => {
    switch (tipo) {
      case 'reel': return <Film className="w-4 h-4" />
      case 'carrusel': return <LayoutGrid className="w-4 h-4" />
      case 'story': return <MessageSquare className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }, [])

  const getTipoColor = useCallback((tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C1DBE8]'
      case 'carrusel': return 'bg-[#FFF1B5]'
      case 'story': return 'bg-[#591427]'
      default: return 'bg-gray-500'
    }
  }, [])

  const getEstadoBadge = useCallback((estado: string) => {
    switch (estado) {
      case 'borrador': return <Badge variant="secondary" className="bg-[#F5F0EB] text-[#2A1520]">Borrador</Badge>
      case 'aprobado': return <Badge className="bg-[#FFF1B5] text-white">Aprobado</Badge>
      case 'programado': return <Badge className="bg-green-600 text-white">Programado</Badge>
      default: return <Badge variant="secondary">Borrador</Badge>
    }
  }, [])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
  }, [])

  if (libraryItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="brave-float inline-block mb-4">
          <BravyBot size={64} expression="happy" animate />
        </div>
        <h3 className="text-xl font-bold text-[#2A1520] mb-2">Tu Biblioteca está vacía</h3>
        <p className="text-muted-foreground">Los contenidos que generes se guardarán aquí automáticamente.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-6">
        <h2 className="text-3xl font-bold text-[#2A1520]">Biblioteca</h2>
        <p className="text-muted-foreground text-base">{libraryItems.length} contenidos guardados</p>
      </div>

      {/* Search & Filters */}
      <Card className="brave-glass brave-card-hover brave-glow rounded-3xl border-none">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contenido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#E8DDD5] focus:border-[#C1DBE8] focus:ring-[#C1DBE8]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar por tipo
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'todos', label: 'Todos' },
                { key: 'reel', label: 'Reels' },
                { key: 'carrusel', label: 'Carruseles' },
                { key: 'story', label: 'Stories' },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterType === f.key
                      ? 'bg-[#591427] text-white'
                      : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Filtrar por objetivo</label>
            <div className="flex flex-wrap gap-2">
              {['', 'autoridad', 'reservas', 'visibilidad', 'educación', 'venta'].map((obj) => (
                <button
                  key={obj || 'all'}
                  onClick={() => setFilterObjetivo(obj as FilterObjetivo)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                    filterObjetivo === obj
                      ? 'bg-[#C1DBE8] text-[#2A1520]'
                      : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                  }`}
                >
                  {obj || 'Todos'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No hay contenidos con estos filtros
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="brave-card-hover border-none shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getTipoColor(item.tipo)} text-white text-xs flex items-center gap-1`}>
                        {getTipoIcon(item.tipo)}
                        {item.tipo.toUpperCase()}
                      </Badge>
                      {getEstadoBadge(item.estado)}
                      {item.fecha && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.fecha}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-[#2A1520] text-base truncate">{item.titulo}</h4>
                    <div className="flex gap-2 mt-2">
                      {item.servicio && (
                        <Badge variant="secondary" className="bg-[#F5F0EB] text-[#2A1520] text-xs">
                          {item.servicio}
                        </Badge>
                      )}
                      {item.objetivo && (
                        <Badge variant="secondary" className="bg-[#F5F0EB] text-[#2A1520] text-xs capitalize">
                          {item.objetivo}
                        </Badge>
                      )}
                    </div>

                    {/* Preview of script/copy */}
                    {(item.guion || item.copy) && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {item.guion || item.copy}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setOpenItem(item)
                        setModalOpen(true)
                      }}
                      className="text-[#591427] hover:text-[#7A2A40] hover:bg-[#F5F0EB]"
                      title="Abrir contenido"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    {(item.guion || item.copy) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard([item.guion, item.copy, item.hashtags].filter(Boolean).join('\n\n'))}
                        className="text-[#C1DBE8] hover:text-[#591427] hover:bg-[#F5F0EB]"
                        title="Copiar"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                    {item.estado === 'borrador' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => scheduleContentItem(item.id, new Date().toISOString().split('T')[0])}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Programar"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLibraryItem(item.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Content Modal */}
      <ContentCardModal
        item={openItem}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={removeLibraryItem}
      />
    </div>
  )
}

