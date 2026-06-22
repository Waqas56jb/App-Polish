'use client'

import { useState } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft, ChevronRight, Film, LayoutGrid,
  MessageSquare, Trash2, Calendar as CalendarIcon,
  RefreshCw, Maximize2, Pencil
} from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, addWeeks, subWeeks,
  isSameMonth, isSameDay, parseISO, isValid
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ContentCardModal } from './content-modal'

type ViewMode = 'mes' | 'semana'

export function CalendarioView() {
  const { libraryItems, removeLibraryItem, updateLibraryItem, replaceLibraryItem, setIsLoading, brandProfile } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('mes')
  const [openItem, setOpenItem] = useState<ContentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDateId, setEditingDateId] = useState<string | null>(null)

  const scheduledItems = libraryItems.filter(
    (item) => item.estado === 'programado' || item.estado === 'aprobado'
  )

  const getItemsForDate = (date: Date) => {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayName = dayNames[date.getDay()]
    return scheduledItems.filter((item) => {
      // Match by exact fecha
      if (item.fecha) {
        try {
          const itemDate = parseISO(item.fecha)
          if (isValid(itemDate) && isSameDay(itemDate, date)) return true
        } catch {
          // ignore
        }
      }
      // Also match by diaSemana if no fecha
      if (!item.fecha && item.diaSemana === dayName) return true
      return false
    })
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays: Date[] = []
  let day = calStart
  while (day <= calEnd) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C1DBE8]'
      case 'carrusel': return 'bg-[#FFF1B5]'
      case 'story': return 'bg-[#591427]'
      default: return 'bg-gray-400'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'reel': return <Film className="w-3 h-3" />
      case 'carrusel': return <LayoutGrid className="w-3 h-3" />
      case 'story': return <MessageSquare className="w-3 h-3" />
      default: return null
    }
  }

  const navigatePrev = () => {
    setCurrentDate(viewMode === 'mes' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))
  }

  const navigateNext = () => {
    setCurrentDate(viewMode === 'mes' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))
  }

  const goToToday = () => setCurrentDate(new Date())

  const weekDayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  const handleOpen = (item: ContentItem) => {
    // Get latest from store
    const current = libraryItems.find(c => c.id === item.id) || item
    setOpenItem(current)
    setModalOpen(true)
  }

  const handleRegenerate = async (item: ContentItem) => {
    setIsLoading(true, 'Regenerando contenido...')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'script',
          brandProfile,
          context: {
            titulo: item.titulo,
            tipo: item.tipo,
            objetivo: item.objetivo,
            servicio: item.servicio,
            formato: item.formato,
          },
        }),
      })
      const data = await res.json()
      if (data.result && !data.result.raw) {
        const updated: ContentItem = {
          ...item,
          guion: data.result.guion || item.guion,
          copy: data.result.copy || item.copy,
          hashtags: data.result.hashtags || item.hashtags,
          textoPortada: data.result.textoPortada || item.textoPortada,
        }
        replaceLibraryItem(item.id, updated)
      }
    } catch (error) {
      console.error('Regenerate error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeDate = (id: string, fecha: string) => {
    updateLibraryItem(id, { fecha, estado: 'programado' })
    setEditingDateId(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-4">
        <h2 className="text-3xl font-bold text-[#2A1520]">Calendario</h2>
        <p className="text-muted-foreground text-base">
          {scheduledItems.length} contenidos programados
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev} className="border-[#E8DDD5] hover:bg-[#F5F0EB]">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-bold text-[#2A1520] min-w-[200px] text-center capitalize">
            {viewMode === 'mes'
              ? format(currentDate, 'MMMM yyyy', { locale: es })
              : `Semana del ${format(weekStart, 'd MMM', { locale: es })}`
            }
          </h3>
          <Button variant="outline" size="sm" onClick={navigateNext} className="border-[#E8DDD5] hover:bg-[#F5F0EB]">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-[#C1DBE8] text-[#C1DBE8] hover:bg-[#F5F0EB]"
          >
            Hoy
          </Button>
          <div className="flex rounded-xl overflow-hidden border-2 border-[#E8DDD5]">
            <button
              onClick={() => setViewMode('mes')}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                viewMode === 'mes' ? 'bg-[#591427] text-white' : 'bg-white text-[#2A1520]'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                viewMode === 'semana' ? 'bg-[#591427] text-white' : 'bg-white text-[#2A1520]'
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#C1DBE8]"></span> Reel</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#FFF1B5]"></span> Carrusel</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#591427]"></span> Story</span>
      </div>

      {/* Monthly View */}
      {viewMode === 'mes' && (
        <Card className="brave-glass brave-glow rounded-3xl border-none overflow-hidden">
          <div className="grid grid-cols-7 bg-[#F5F0EB]">
            {weekDayNames.map((d) => (
              <div key={d} className="p-3 text-center text-xs font-bold text-[#591427] uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((date, idx) => {
              const items = getItemsForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isToday = isSameDay(date, new Date())

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-2 border border-[#F5F0EB] ${
                    !isCurrentMonth ? 'bg-[#FFFBF0]/50' : 'bg-white'
                  } ${isToday ? 'bg-[#F5F0EB]/30' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'w-7 h-7 rounded-full bg-[#591427] text-white flex items-center justify-center'
                      : isCurrentMonth
                        ? 'text-[#2A1520]'
                        : 'text-muted-foreground/40'
                  }`}>
                    {format(date, 'd')}
                  </div>

                  <div className="space-y-1">
                    {items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className={`${getTipoColor(item.tipo)} text-white text-[10px] px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                        title={item.titulo}
                        onClick={() => handleOpen(item)}
                      >
                        {getTipoIcon(item.tipo)}
                        <span className="truncate">{item.titulo}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{items.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Weekly View with full controls */}
      {viewMode === 'semana' && (
        <div className="space-y-3">
          {weekDays.map((date, idx) => {
            const items = getItemsForDate(date)
            const isToday = isSameDay(date, new Date())

            return (
              <Card key={idx} className={`border-none shadow-md ${isToday ? 'ring-2 ring-[#591427]' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`text-center min-w-[60px] ${isToday ? 'text-[#591427]' : 'text-[#2A1520]'}`}>
                      <div className="text-xs font-medium capitalize">{format(date, 'EEE', { locale: es })}</div>
                      <div className={`text-2xl font-bold ${isToday ? 'bg-[#591427] text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto' : ''}`}>
                        {format(date, 'd')}
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Sin contenido programado</p>
                      ) : (
                        items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 p-3 rounded-xl ${getTipoColor(item.tipo)} text-white`}
                          >
                            {getTipoIcon(item.tipo)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.titulo}</p>
                              <p className="text-xs opacity-80 truncate">{item.servicio} · {item.objetivo}</p>
                              {editingDateId === item.id && (
                                <div className="mt-2 bg-white/20 p-2 rounded-lg">
                                  <label className="text-xs text-white/90 block mb-1">Cambiar fecha:</label>
                                  <input
                                    type="date"
                                    value={item.fecha || ''}
                                    onChange={(e) => handleChangeDate(item.id, e.target.value)}
                                    className="text-xs px-2 py-1 rounded text-[#2A1520]"
                                    autoFocus
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/80 hover:text-white hover:bg-white/20 h-7 w-7 p-0"
                                onClick={() => handleOpen(item)}
                                title="Abrir contenido"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/80 hover:text-white hover:bg-white/20 h-7 w-7 p-0"
                                onClick={() => handleRegenerate(item)}
                                title="Regenerar contenido"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/80 hover:text-white hover:bg-white/20 h-7 w-7 p-0"
                                onClick={() => setEditingDateId(editingDateId === item.id ? null : item.id)}
                                title="Cambiar fecha"
                              >
                                {editingDateId === item.id ? <Pencil className="w-3.5 h-3.5 fill-white" /> : <CalendarIcon className="w-3.5 h-3.5" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/80 hover:text-white hover:bg-white/20 h-7 w-7 p-0"
                                onClick={() => removeLibraryItem(item.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* All scheduled items list */}
      {scheduledItems.length > 0 && (
        <Card className="border-none shadow-md mt-6">
          <CardContent className="p-5">
            <h3 className="text-base font-bold text-[#2A1520] mb-4">Todos los Contenidos Programados</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scheduledItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#FFFBF0] hover:bg-[#F5F0EB] transition-colors"
                >
                  <div className={`${getTipoColor(item.tipo)} text-white p-2 rounded-lg shrink-0`}>
                    {getTipoIcon(item.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#2A1520] truncate">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">{item.servicio} · {item.objetivo}</p>
                  </div>
                  <div className="flex gap-1 items-center shrink-0">
                    {editingDateId === item.id ? (
                      <input
                        type="date"
                        value={item.fecha || ''}
                        onChange={(e) => handleChangeDate(item.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-[#E8DDD5] rounded text-[#2A1520]"
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground mr-2">{item.fecha || 'Sin fecha'}</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-[#591427] hover:bg-[#F5F0EB]"
                      onClick={() => handleOpen(item)}
                      title="Abrir contenido"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-[#C1DBE8] hover:bg-[#F5F0EB]"
                      onClick={() => handleRegenerate(item)}
                      title="Regenerar"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-[#591427] hover:bg-[#F5F0EB]"
                      onClick={() => setEditingDateId(editingDateId === item.id ? null : item.id)}
                      title="Cambiar fecha"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeLibraryItem(item.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
