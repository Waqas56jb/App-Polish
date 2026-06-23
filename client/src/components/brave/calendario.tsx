'use client'

import { useState, useMemo, useCallback } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { ContentCardModal } from './content-modal'
import { BravyBot } from './bravy-bot'
import {
  ChevronLeft, ChevronRight, Film, LayoutGrid,
  MessageSquare, Trash2, List, Calendar as CalIcon,
  GripVertical, Calendar,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, addWeeks, subWeeks,
  isSameMonth, isSameDay, parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  sortableKeyboardCoordinates, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type ViewMode = 'calendario' | 'lista'

// ============================================================
// CALENDARIO — Versión con drag & drop
// - Vista calendario: drag idea a otro día
// - Vista lista: reordenar con drag (cambia fecha)
// - Modal: opción de cambiar fecha manualmente
// ============================================================

export function CalendarioView() {
  const { libraryItems, removeLibraryItem, replaceLibraryItem, updateLibraryItem, setIsLoading, brandProfile, setActiveModule } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('calendario')
  const [openItem, setOpenItem] = useState<ContentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)

  // Scheduled items memoizado
  const scheduledItems = useMemo(
    () => libraryItems.filter(i => i.estado === 'programado' && i.fecha),
    [libraryItems]
  )

  const getItemsForDate = useCallback((date: Date) => {
    return scheduledItems.filter(item => {
      if (!item.fecha) return false
      try { return isSameDay(parseISO(item.fecha), date) } catch { return false }
    })
  }, [scheduledItems])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days: Date[] = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentDate])

  const sortedList = useMemo(
    () => [...scheduledItems].sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '')),
    [scheduledItems]
  )

  const navigatePrev = useCallback(() => {
    setCurrentDate(viewMode === 'calendario' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))
  }, [viewMode, currentDate])
  const navigateNext = useCallback(() => {
    setCurrentDate(viewMode === 'calendario' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))
  }, [viewMode, currentDate])
  const goToToday = useCallback(() => setCurrentDate(new Date()), [])

  const handleOpen = useCallback((item: ContentItem) => {
    const current = libraryItems.find(c => c.id === item.id) || item
    setOpenItem(current)
    setModalOpen(true)
  }, [libraryItems])

  // ─── Drag and drop en calendario (HTML5) ───
  const handleDragStart = (itemId: string) => {
    setDraggedItemId(itemId)
  }
  const handleDragEnd = () => {
    setDraggedItemId(null)
  }
  const handleDropOnDay = (date: Date, e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-emerald-400')
    if (!draggedItemId) return
    const item = libraryItems.find(i => i.id === draggedItemId)
    if (!item) return
    const newDate = format(date, 'yyyy-MM-dd')
    if (item.fecha === newDate) return
    updateLibraryItem(item.id, {
      fecha: newDate,
      diaSemana: format(date, 'EEEE', { locale: es }),
    })
    toast.success(`Movido al ${format(date, "d 'de' MMMM", { locale: es })}`)
    setDraggedItemId(null)
  }

  // ─── DnD-kit para vista lista ───
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleSortEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortedList.findIndex(i => i.id === active.id)
    const newIndex = sortedList.findIndex(i => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    // Reasignar fechas manteniendo el orden cronológico
    const reordered = arrayMove(sortedList, oldIndex, newIndex)
    // Las fechas se mantienen en orden: el item movido toma la fecha de su nueva posición
    reordered.forEach((item, idx) => {
      const targetDate = sortedList[idx].fecha
      const targetDiaSemana = sortedList[idx].diaSemana
      if (item.fecha !== targetDate) {
        updateLibraryItem(item.id, { fecha: targetDate, diaSemana: targetDiaSemana })
      }
    })
    toast.success('Orden actualizado')
  }

  const getTipoColor = useCallback((tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C8DEC9] text-[#2A2A28]'
      case 'carrusel': return 'bg-[#E8D5B0] text-[#8BAF8D]'
      case 'story': return 'bg-[#8BAF8D] text-white'
      default: return 'bg-gray-200 text-gray-700'
    }
  }, [])

  const getTipoIcon = useCallback((tipo: string) => {
    switch (tipo) {
      case 'reel': return <Film className="w-3 h-3" />
      case 'carrusel': return <LayoutGrid className="w-3 h-3" />
      case 'story': return <MessageSquare className="w-3 h-3" />
      default: return null
    }
  }, [])

  const weekDayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const today = new Date()

  // ─── Estado vacío ───
  if (scheduledItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="brave-float inline-block mb-4">
          <BravyBot size={72} expression="happy" animate />
        </div>
        <h2 className="font-serif text-3xl font-light text-[#2A2A28] mb-2">Tu Calendario está vacío</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
          Cuando generes un plan o agendes ideas, aparecerán aquí. Podrás arrastrarlas para cambiar de día.
        </p>
        <button
          onClick={() => setActiveModule('planificar')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl brave-gradient text-white text-sm font-semibold shadow-md"
        >
          <CalIcon className="w-4 h-4" />
          Ir a Planificar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="font-serif text-3xl font-light text-[#2A2A28] tracking-tight">Calendario</h2>
        <p className="text-sm text-muted-foreground">
          {scheduledItems.length} contenidos programados · arrastra para cambiar de día
        </p>
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center justify-between gap-2">
        {/* View toggle */}
        <div className="flex gap-1 bg-card rounded-2xl p-1 shadow-sm border border-border">
          <button
            onClick={() => setViewMode('calendario')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'calendario' ? 'brave-gradient text-white shadow-sm' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <CalIcon className="w-3.5 h-3.5" />
            Calendario
          </button>
          <button
            onClick={() => setViewMode('lista')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'lista' ? 'brave-gradient text-white shadow-sm' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lista
          </button>
        </div>

        {/* Navegación */}
        <div className="flex items-center gap-2">
          <button onClick={navigatePrev} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goToToday} className="text-xs font-semibold text-foreground px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            Hoy
          </button>
          <p className="text-sm font-semibold text-foreground min-w-[140px] text-center">
            {viewMode === 'calendario'
              ? format(currentDate, 'MMMM yyyy', { locale: es })
              : `Semana del ${format(currentDate, "d 'de' MMM", { locale: es })}`
            }
          </p>
          <button onClick={navigateNext} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══ VISTA CALENDARIO con drag-and-drop ═══ */}
      {viewMode === 'calendario' && (
        <div>
          {/* Nombres de días */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDayNames.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">
                {d}
              </div>
            ))}
          </div>
          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const items = getItemsForDate(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, today)
              return (
                <div
                  key={idx}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.add('ring-2', 'ring-emerald-400')
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('ring-2', 'ring-emerald-400')
                  }}
                  onDrop={(e) => handleDropOnDay(day, e)}
                  className={`min-h-[80px] sm:min-h-[100px] p-1 rounded-xl border transition-all ${
                    !isCurrentMonth ? 'bg-muted/20 border-transparent opacity-40' : 'bg-card border-border'
                  } ${isToday ? 'ring-1 ring-[#E8D5B0]' : ''}`}
                >
                  <p className={`text-[10px] font-bold mb-1 ${isToday ? 'text-[#8BAF8D]' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-1">
                    {items.map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpen(item)}
                        className={`cursor-grab active:cursor-grabbing text-[9px] px-1.5 py-1 rounded-md font-medium ${getTipoColor(item.tipo)} hover:opacity-80 transition-opacity truncate`}
                        title={item.titulo}
                      >
                        <span className="flex items-center gap-0.5">
                          {getTipoIcon(item.tipo)}
                          <span className="truncate">{item.titulo}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Arrastra cualquier contenido a otro día para cambiarlo de fecha
          </p>
        </div>
      )}

      {/* ═══ VISTA LISTA con drag-and-drop para reordenar ═══ */}
      {viewMode === 'lista' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Arrastra las tarjetas para reordenar el orden de publicación (se ajustan las fechas)
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSortEnd}
          >
            <div className="space-y-2">
              {sortedList.map((item, idx) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  onOpen={() => handleOpen(item)}
                  getTipoColor={getTipoColor}
                  getTipoIcon={getTipoIcon}
                />
              ))}
            </div>
          </DndContext>
        </div>
      )}

      {/* ─── Modal ─── */}
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

// ─── Sortable item para vista lista ──────────────────────
function SortableItem({
  item, idx, onOpen, getTipoColor, getTipoIcon,
}: {
  item: ContentItem
  idx: number
  onOpen: () => void
  getTipoColor: (tipo: string) => string
  getTipoIcon: (tipo: string) => React.ReactNode
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  let fechaDisplay = item.fecha
  try {
    fechaDisplay = format(parseISO(item.fecha + 'T12:00:00'), "EEE d 'de' MMM", { locale: es })
  } catch {}

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`brave-glass rounded-2xl border border-border/50 p-3 flex items-center gap-3 ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 shrink-0"
        aria-label="Arrastrar"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Contenido clicable */}
      <button onClick={onOpen} className="flex-1 flex items-center gap-3 text-left min-w-0">
        <span className={`shrink-0 ${getTipoColor(item.tipo)} rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1`}>
          {getTipoIcon(item.tipo)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground capitalize mb-0.5">{fechaDisplay}</p>
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1">{item.titulo}</h3>
        </div>
      </button>
    </div>
  )
}
