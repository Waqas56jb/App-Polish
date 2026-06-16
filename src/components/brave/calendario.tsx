'use client'

import { useState, useMemo } from 'react'
import { useAppStore, ContentItem } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft, ChevronRight, Film, LayoutGrid,
  MessageSquare, Trash2, Edit3, Calendar as CalendarIcon
} from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, addWeeks, subWeeks,
  isSameMonth, isSameDay, parseISO, isValid
} from 'date-fns'
import { es } from 'date-fns/locale'

type ViewMode = 'mes' | 'semana'

export function CalendarioView() {
  const { libraryItems, removeLibraryItem, updateLibraryItem } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('mes')

  const scheduledItems = libraryItems.filter(
    (item) => item.estado === 'programado' || item.estado === 'aprobado'
  )

  const getItemsForDate = (date: Date) => {
    return scheduledItems.filter((item) => {
      if (!item.fecha) return false
      try {
        const itemDate = parseISO(item.fecha)
        return isValid(itemDate) && isSameDay(itemDate, date)
      } catch {
        return false
      }
    })
  }

  // Monthly view
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

  // Weekly view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C17C83]'
      case 'carrusel': return 'bg-[#C9A96E]'
      case 'story': return 'bg-[#7D2E42]'
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-4">
        <h2 className="text-3xl font-bold text-[#2D1F22]">Calendario</h2>
        <p className="text-muted-foreground text-base">
          {scheduledItems.length} contenidos programados
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev} className="border-[#E0D5D1] hover:bg-[#F3E8E5]">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-bold text-[#2D1F22] min-w-[200px] text-center capitalize">
            {viewMode === 'mes'
              ? format(currentDate, 'MMMM yyyy', { locale: es })
              : `Semana del ${format(weekStart, 'd MMM', { locale: es })}`
            }
          </h3>
          <Button variant="outline" size="sm" onClick={navigateNext} className="border-[#E0D5D1] hover:bg-[#F3E8E5]">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-[#C17C83] text-[#C17C83] hover:bg-[#F3E8E5]"
          >
            Hoy
          </Button>
          <div className="flex rounded-xl overflow-hidden border-2 border-[#E0D5D1]">
            <button
              onClick={() => setViewMode('mes')}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                viewMode === 'mes' ? 'bg-[#7D2E42] text-white' : 'bg-white text-[#2D1F22]'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                viewMode === 'semana' ? 'bg-[#7D2E42] text-white' : 'bg-white text-[#2D1F22]'
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#C17C83]"></span> Reel</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#C9A96E]"></span> Carrusel</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#7D2E42]"></span> Story</span>
      </div>

      {/* Monthly View */}
      {viewMode === 'mes' && (
        <Card className="border-none shadow-md overflow-hidden">
          {/* Week day headers */}
          <div className="grid grid-cols-7 bg-[#F3E8E5]">
            {weekDayNames.map((d) => (
              <div key={d} className="p-3 text-center text-xs font-bold text-[#7D2E42] uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, idx) => {
              const items = getItemsForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isToday = isSameDay(date, new Date())

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-2 border border-[#F3E8E5] ${
                    !isCurrentMonth ? 'bg-[#FBF7F5]/50' : 'bg-white'
                  } ${isToday ? 'bg-[#F3E8E5]/30' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'w-7 h-7 rounded-full bg-[#7D2E42] text-white flex items-center justify-center'
                      : isCurrentMonth
                        ? 'text-[#2D1F22]'
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

      {/* Weekly View */}
      {viewMode === 'semana' && (
        <div className="space-y-3">
          {weekDays.map((date, idx) => {
            const items = getItemsForDate(date)
            const isToday = isSameDay(date, new Date())

            return (
              <Card key={idx} className={`border-none shadow-md ${isToday ? 'ring-2 ring-[#7D2E42]' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`text-center min-w-[60px] ${isToday ? 'text-[#7D2E42]' : 'text-[#2D1F22]'}`}>
                      <div className="text-xs font-medium capitalize">{format(date, 'EEE', { locale: es })}</div>
                      <div className={`text-2xl font-bold ${isToday ? 'bg-[#7D2E42] text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto' : ''}`}>
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
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/70 hover:text-white hover:bg-white/20 h-7 w-7 p-0"
                                onClick={() => removeLibraryItem(item.id)}
                              >
                                <Trash2 className="w-3 h-3" />
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
            <h3 className="text-base font-bold text-[#2D1F22] mb-4">Todos los Contenidos Programados</h3>
            <div className="space-y-2">
              {scheduledItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#FBF7F5] hover:bg-[#F3E8E5] transition-colors"
                >
                  <div className={`${getTipoColor(item.tipo)} text-white p-2 rounded-lg`}>
                    {getTipoIcon(item.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#2D1F22] truncate">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">{item.servicio} · {item.objetivo}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {item.fecha && (
                      <span className="text-xs text-muted-foreground">{item.fecha}</span>
                    )}
                    <Badge className={`${getTipoColor(item.tipo)} text-white text-xs`}>
                      {item.tipo}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
