'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ContentItem } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GripVertical, RefreshCw, Trash2, Maximize2, Save,
  Film, LayoutGrid, MessageSquare, Calendar, Repeat
} from 'lucide-react'
import { useState } from 'react'

interface DraggableCardProps {
  item: ContentItem
  onOpen: (item: ContentItem) => void
  onRegenerate: (item: ContentItem) => void
  onDelete: (id: string) => void
  onSave: (item: ContentItem) => void
  onConvert?: (item: ContentItem) => void
  onAssignDay?: (id: string, diaSemana: string) => void
  onAssignDate?: (id: string, fecha: string) => void
}

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function DraggableCard({
  item, onOpen, onRegenerate, onDelete, onSave, onConvert, onAssignDay, onAssignDate
}: DraggableCardProps) {
  const [showDateControls, setShowDateControls] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C17C83]'
      case 'carrusel': return 'bg-[#C9A96E]'
      case 'story': return 'bg-[#7D2E42]'
      default: return 'bg-gray-500'
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-md border border-[#E0D5D1] overflow-hidden ${isDragging ? 'shadow-2xl ring-2 ring-[#C17C83]' : ''}`}
    >
      <div className="flex items-stretch">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="bg-[#F3E8E5] hover:bg-[#E0D5D1] px-2 flex items-center cursor-grab active:cursor-grabbing touch-none transition-colors"
          title="Arrastra para reordenar"
        >
          <GripVertical className="w-4 h-4 text-[#7D2E42]" />
        </button>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`${getTipoColor(item.tipo)} text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold`}>
                  {getTipoIcon(item.tipo)}
                  {item.tipo.toUpperCase()}
                </span>
                {item.objetivo && (
                  <span className="bg-[#F3E8E5] text-[#7D2E42] text-[10px] px-2 py-0.5 rounded-full capitalize">
                    {item.objetivo}
                  </span>
                )}
                {item.servicio && (
                  <span className="bg-white border border-[#E0D5D1] text-[#2D1F22] text-[10px] px-2 py-0.5 rounded-full">
                    {item.servicio}
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-[#2D1F22] text-sm leading-tight">{item.titulo}</h4>
              {item.descripcion && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.descripcion}</p>
              )}

              {/* Day/Date badges */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {item.diaSemana && (
                  <Badge variant="outline" className="text-[10px] border-[#C9A96E] text-[#7D2E42]">
                    <Calendar className="w-2.5 h-2.5 mr-1" />
                    {item.diaSemana}
                  </Badge>
                )}
                {item.fecha && (
                  <Badge variant="outline" className="text-[10px] border-[#C17C83] text-[#7D2E42]">
                    <Calendar className="w-2.5 h-2.5 mr-1" />
                    {item.fecha}
                  </Badge>
                )}
                {item.guion && (
                  <Badge variant="outline" className="text-[10px] border-green-500 text-green-700">
                    Guión listo
                  </Badge>
                )}
              </div>

              {/* Date controls */}
              {showDateControls && (onAssignDay || onAssignDate) && (
                <div className="mt-3 p-3 bg-[#FBF7F5] rounded-lg space-y-2">
                  {onAssignDay && (
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Día de la semana</label>
                      <select
                        value={item.diaSemana || ''}
                        onChange={(e) => onAssignDay(item.id, e.target.value)}
                        className="w-full text-xs border border-[#E0D5D1] rounded-md px-2 py-1.5 bg-white"
                      >
                        {DIAS_SEMANA.map(d => (
                          <option key={d} value={d}>{d || 'Sin asignar'}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {onAssignDate && (
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Fecha exacta</label>
                      <input
                        type="date"
                        value={item.fecha || ''}
                        onChange={(e) => onAssignDate(item.id, e.target.value)}
                        className="w-full text-xs border border-[#E0D5D1] rounded-md px-2 py-1.5 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-[#F3E8E5]">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpen(item)}
              className="text-[#7D2E42] hover:text-[#933A54] hover:bg-[#F3E8E5] h-7 px-2 text-xs"
              title="Abrir contenido"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRegenerate(item)}
              className="text-[#C17C83] hover:text-[#7D2E42] hover:bg-[#F3E8E5] h-7 px-2 text-xs"
              title="Regenerar idea"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            {onConvert && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onConvert(item)}
                className="text-[#C9A96E] hover:text-[#7D2E42] hover:bg-[#FBF7F5] h-7 px-2 text-xs"
                title={`Convertir a ${item.tipo === 'reel' ? 'carrusel' : 'reel'}`}
              >
                <Repeat className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSave(item)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 px-2 text-xs"
              title="Guardar en biblioteca"
            >
              <Save className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 px-2 text-xs"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            {(onAssignDay || onAssignDate) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDateControls(!showDateControls)}
                className={`h-7 px-2 text-xs ml-auto ${showDateControls ? 'bg-[#F3E8E5] text-[#7D2E42]' : 'text-[#7D2E42] hover:bg-[#F3E8E5]'}`}
                title="Asignar fecha"
              >
                <Calendar className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
