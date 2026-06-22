'use client'

import { useState } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { ContentCardModal } from './content-modal'
import { BravyBot } from './bravy-bot'
import {
  ChevronLeft, ChevronRight, Film, LayoutGrid,
  MessageSquare, Trash2, RefreshCw, List, Calendar as CalIcon,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, addWeeks, subWeeks,
  isSameMonth, isSameDay, parseISO, isValid, isAfter, isBefore,
  startOfDay, endOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { fetchJSON } from '@/lib/fetch-safe'

type ViewMode = 'calendario' | 'lista'

export function CalendarioView() {
  const { libraryItems, removeLibraryItem, replaceLibraryItem, setIsLoading, brandProfile, setActiveModule } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('calendario')
  const [openItem, setOpenItem] = useState<ContentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // All scheduled/approved items with dates
  const scheduledItems = libraryItems.filter(i => i.estado === 'programado' && i.fecha)

  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return scheduledItems.filter(item => {
      if (!item.fecha) return false
      try {
        return isSameDay(parseISO(item.fecha), date)
      } catch { return false }
    })
  }

  // Calendar grid
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

  // List sorted by date
  const sortedList = [...scheduledItems].sort((a, b) => {
    if (!a.fecha && !b.fecha) return 0
    if (!a.fecha) return 1
    if (!b.fecha) return -1
    return a.fecha.localeCompare(b.fecha)
  })

  const navigatePrev = () => {
    setCurrentDate(viewMode === 'calendario' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))
  }
  const navigateNext = () => {
    setCurrentDate(viewMode === 'calendario' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))
  }
  const goToToday = () => setCurrentDate(new Date())

  const handleOpen = (item: ContentItem) => {
    const current = libraryItems.find(c => c.id === item.id) || item
    setOpenItem(current)
    setModalOpen(true)
  }

  const handleRegenerate = async (item: ContentItem) => {
    setIsLoading(true, 'Regenerando contenido...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'script',
          brandProfile,
          context: {
            titulo: item.titulo, tipo: item.tipo,
            objetivo: item.objetivo, servicio: item.servicio, formato: item.formato,
          },
        }),
      })
      if (data?.result && !data.result.raw) {
        replaceLibraryItem(item.id, {
          ...item,
          guion: data.result.guion || item.guion,
          copy: data.result.copy || item.copy,
          hashtags: data.result.hashtags || item.hashtags,
          textoPortada: data.result.textoPortada || item.textoPortada,
        })
      }
    } catch (e) {
      console.error('Regenerate error:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C1DBE8] text-[#2A1520]'
      case 'carrusel': return 'bg-[#FFF1B5] text-[#591427]'
      case 'story': return 'bg-[#591427] text-white'
      default: return 'bg-gray-400 text-white'
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

  const weekDayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const today = new Date()

  // ─── Empty state ───
  if (scheduledItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="brave-float inline-block mb-4">
          <BravyBot size={80} expression="thinking" animate speechBubble="Tu calendario está vacío" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Sin contenido programado</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Crea un plan de contenido y envíalo aquí para verlo organizado.
        </p>
        <button
          onClick={() => setActiveModule('planificar')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl brave-gradient text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Crear plan
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Calendario</h2>
          <p className="text-sm text-muted-foreground">{scheduledItems.length} contenido{scheduledItems.length > 1 ? 's' : ''} programado{scheduledItems.length > 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            <button
              onClick={() => setViewMode('calendario')}
              className={`px-3 py-2 text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'calendario' ? 'brave-gradient text-white' : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendario</span>
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`px-3 py-2 text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'lista' ? 'brave-gradient text-white' : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Listado</span>
            </button>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-1">
            <button onClick={navigatePrev} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium rounded-xl hover:bg-muted/50 transition-colors min-w-[140px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </button>
            <button onClick={navigateNext} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── CALENDAR VIEW ─── */}
      {viewMode === 'calendario' && (
        <div className="brave-glass brave-glow rounded-2xl border border-border/30 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-muted/30">
            {weekDayNames.map(d => (
              <div key={d} className="p-2.5 text-center text-[10px] font-bold text-[#591427] uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, idx) => {
              const items = getItemsForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isToday = isSameDay(date, today)

              return (
                <div
                  key={idx}
                  className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-t border-border/20 ${
                    !isCurrentMonth ? 'bg-muted/10' : ''
                  } ${isToday ? 'bg-[#591427]/5' : ''}`}
                >
                  <div className={`text-xs font-medium mb-1 text-center ${
                    isToday
                      ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-full brave-gradient text-white flex items-center justify-center mx-auto'
                      : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}>
                    {format(date, 'd')}
                  </div>

                  <div className="space-y-0.5">
                    {items.slice(0, 2).map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleOpen(item)}
                        className={`${getTipoColor(item.tipo)} text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:py-1 rounded-lg truncate w-full text-left flex items-center gap-1 hover:opacity-80 transition-opacity font-medium`}
                        title={item.titulo}
                      >
                        {getTipoIcon(item.tipo)}
                        <span className="truncate hidden sm:inline">{item.titulo}</span>
                      </button>
                    ))}
                    {items.length > 2 && (
                      <p className="text-[9px] text-muted-foreground text-center font-medium">
                        +{items.length - 2}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── LIST VIEW ─── */}
      {viewMode === 'lista' && (
        <div className="space-y-2">
          {sortedList.map((item, idx) => {
            const fechaDate = item.fecha ? parseISO(item.fecha) : null
            const isPast = fechaDate && isBefore(fechaDate, startOfDay(today))
            const isTodayItem = fechaDate && isSameDay(fechaDate, today)

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => handleOpen(item)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl brave-glass border border-border/30 brave-glow hover:shadow-md transition-all flex items-center gap-3 group ${
                  isPast ? 'opacity-60' : ''
                } ${isTodayItem ? 'ring-2 ring-[#591427]/30' : ''}`}
              >
                {/* Date */}
                <div className="shrink-0 text-center min-w-[44px]">
                  {fechaDate ? (
                    <>
                      <p className="text-[10px] font-medium text-muted-foreground capitalize">
                        {format(fechaDate, 'EEE', { locale: es })}
                      </p>
                      <p className={`text-lg font-bold ${isTodayItem ? 'text-[#591427]' : 'text-foreground'}`}>
                        {format(fechaDate, 'd')}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`${getTipoColor(item.tipo)} rounded-md px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-0.5`}>
                      {getTipoIcon(item.tipo)}
                      {item.tipo.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">{item.servicio}</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">{item.titulo}</p>
                  {item.descripcion && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.descripcion}</p>
                  )}
                </div>

                {/* Quick actions (visible on hover) */}
                <div className="hidden sm:flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); handleRegenerate(item) }}
                    className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    title="Regenerar"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); removeLibraryItem(item.id) }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Content Modal - opens full content on click */}
      <ContentCardModal
        item={openItem}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={removeLibraryItem}
        showConvertButton={false}
      />
    </div>
  )
}