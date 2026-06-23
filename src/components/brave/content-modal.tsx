'use client'

import { useState, useEffect } from 'react'
import { ContentItem, useAppStore, generateId } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Copy, Save, RefreshCw, Trash2, FileText, Film,
  LayoutGrid, Repeat, Check, Loader2, Calendar, ChevronDown
} from 'lucide-react'
import { fetchJSON } from '@/lib/fetch-safe'
import { toast } from 'sonner'

interface ContentModalProps {
  item: ContentItem | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: string) => void
  showConvertButton?: boolean
}

// ============================================================
// MODAL DE CONTENIDO — Versión simplificada
// Acciones claras y grandes: Copiar / Agendar / Regenerar
// ============================================================

export function ContentCardModal({ item, isOpen, onClose, onDelete, showConvertButton = true }: ContentModalProps) {
  const { brandProfile, addLibraryItems, replaceLibraryItem, removeLibraryItem, scheduleContentItem, setIsLoading, setActiveModule } = useAppStore()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    if (!isOpen) {
      setCopiedField(null)
      setIsRegenerating(false)
      setIsConverting(false)
      setShowSchedule(false)
      setSelectedDate('')
    } else if (item?.fecha) {
      setSelectedDate(item.fecha)
    }
  }, [isOpen, item])

  if (!item) return null

  const copyField = (field: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const copyAll = () => {
    if (!item) return
    const all = [
      `🎬 ${item.titulo}`,
      ``,
      `📋 GUIÓN:`,
      item.guion,
      ``,
      `📝 COPY:`,
      item.copy,
      ``,
      `#️⃣ HASHTAGS:`,
      item.hashtags,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(all)
    setCopiedField('all')
    toast.success('Todo el contenido copiado')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const saveToLibrary = () => {
    if (!item) return
    addLibraryItems([{ ...item, id: generateId() }])
    toast.success('Guardado en tu Biblioteca')
    onClose()
  }

  const regenerateContent = async () => {
    if (!item) return
    setIsRegenerating(true)
    setIsLoading(true, 'Regenerando contenido...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
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
      if (data?.result && !data.result.raw) {
        const updated: ContentItem = {
          ...item,
          guion: data.result.guion || item.guion,
          copy: data.result.copy || item.copy,
          hashtags: data.result.hashtags || item.hashtags,
          textoPortada: data.result.textoPortada || item.textoPortada,
        }
        replaceLibraryItem(item.id, updated)
        toast.success('Contenido regenerado')
      }
    } catch (error) {
      console.error('Regenerate error:', error)
      toast.error('No se pudo regenerar. Intenta de nuevo.')
    } finally {
      setIsRegenerating(false)
      setIsLoading(false)
    }
  }

  const convertContent = async () => {
    if (!item) return
    const fromTipo = item.tipo
    const toTipo = item.tipo === 'reel' ? 'carrusel' : 'reel'
    setIsConverting(true)
    setIsLoading(true, `Convirtiendo a ${toTipo}...`)
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'convert-content',
          brandProfile,
          context: {
            titulo: item.titulo,
            objetivo: item.objetivo,
            servicio: item.servicio,
            formato: item.formato,
            fromTipo,
            toTipo,
            guion: item.guion,
            copy: item.copy,
            hashtags: item.hashtags,
          },
        }),
      })
      if (data?.result && !data.result.raw) {
        const converted: ContentItem = {
          ...item,
          id: generateId(),
          tipo: toTipo,
          titulo: data.result.titulo || item.titulo,
          guion: data.result.guion || '',
          copy: data.result.copy || '',
          hashtags: data.result.hashtags || '',
          textoPortada: data.result.textoPortada || '',
          slides: toTipo === 'carrusel' && data.result.slides ? data.result.slides : [],
          createdAt: new Date().toISOString(),
        }
        addLibraryItems([converted])
        toast.success(`Convertido a ${toTipo} y guardado`)
        onClose()
      }
    } catch (error) {
      console.error('Convert error:', error)
      toast.error('No se pudo convertir. Intenta de nuevo.')
    } finally {
      setIsConverting(false)
      setIsLoading(false)
    }
  }

  const handleSchedule = () => {
    if (!item || !selectedDate) {
      toast.error('Elige una fecha primero')
      return
    }
    scheduleContentItem(item.id, selectedDate)
    toast.success(`Agendado para el ${selectedDate}`)
    onClose()
  }

  const handleGoToCalendar = () => {
    onClose()
    setActiveModule('calendario')
  }

  const handleDelete = () => {
    if (!item) return
    if (onDelete) {
      onDelete(item.id)
    } else {
      removeLibraryItem(item.id)
    }
    toast.success('Eliminado')
    onClose()
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C1DBE8] text-[#2A1520]'
      case 'carrusel': return 'bg-[#FFF1B5] text-[#591427]'
      case 'story': return 'bg-[#591427] text-white'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'reel': return <Film className="w-3 h-3" />
      case 'carrusel': return <LayoutGrid className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'reel': return 'Reel'
      case 'carrusel': return 'Carrusel'
      case 'story': return 'Story'
      default: return 'Contenido'
    }
  }

  // Fecha sugerida: 3 días desde hoy
  const today = new Date()
  const suggestedDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0 rounded-3xl">
        {/* ── Header ── */}
        <div className="brave-gradient p-5 text-white sticky top-0 z-10">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold ${getTipoColor(item.tipo)}`}>
                {getTipoIcon(item.tipo)}
                {getTipoLabel(item.tipo)}
              </span>
              {item.objetivo && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full capitalize">
                  {item.objetivo}
                </span>
              )}
              {item.fecha && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.fecha}
                </span>
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-white leading-snug">
              {item.titulo}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {/* ── Info rápida ── */}
          <div className="flex flex-wrap gap-2 text-xs">
            {item.servicio && (
              <span className="bg-muted/50 px-3 py-1 rounded-full">
                <strong className="text-foreground">{item.servicio}</strong>
              </span>
            )}
            {item.formato && (
              <span className="bg-muted/50 px-3 py-1 rounded-full capitalize">
                {item.formato}
              </span>
            )}
          </div>

          {/* ── Descripción ── */}
          {item.descripcion && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-foreground leading-relaxed">{item.descripcion}</p>
            </div>
          )}

          {/* ── Guión ── */}
          {item.guion && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Guion completo</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyField('guion', item.guion)}
                  className="h-7 text-xs gap-1"
                >
                  {copiedField === 'guion' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'guion' ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl whitespace-pre-line text-sm text-foreground max-h-[200px] overflow-y-auto leading-relaxed">
                {item.guion}
              </div>
            </div>
          )}

          {/* ── Copy ── */}
          {item.copy && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Copy del post</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyField('copy', item.copy)}
                  className="h-7 text-xs gap-1"
                >
                  {copiedField === 'copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'copy' ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl text-sm text-foreground whitespace-pre-line">
                {item.copy}
              </div>
            </div>
          )}

          {/* ── Hashtags ── */}
          {item.hashtags && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Hashtags</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyField('hashtags', item.hashtags)}
                  className="h-7 text-xs gap-1"
                >
                  {copiedField === 'hashtags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'hashtags' ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl text-sm text-[#C1DBE8]">
                {item.hashtags}
              </div>
            </div>
          )}

          {/* ── Slides (carrusel) — copiar individual + copiar todo ── */}
          {item.slides && item.slides.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Slides del carrusel</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const all = item.slides.map(s => `Slide ${s.numero}: ${s.texto}`).join('\n\n')
                    copyField('slides-all', all)
                  }}
                  className="h-7 text-xs gap-1"
                >
                  {copiedField === 'slides-all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar todo
                </Button>
              </div>
              <div className="space-y-2">
                {item.slides.map((slide, idx) => (
                  <div key={idx} className="bg-muted/40 p-3 rounded-xl flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#FFF1B5] flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {slide.numero}
                    </div>
                    <p className="text-sm text-foreground flex-1">{slide.texto}</p>
                    <button
                      onClick={() => copyField(`slide-${slide.numero}`, slide.texto)}
                      className="text-muted-foreground hover:text-foreground p-1 shrink-0"
                      aria-label={`Copiar slide ${slide.numero}`}
                    >
                      {copiedField === `slide-${slide.numero}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Stories — copiar texto individual de cada story + copiar todo ── */}
          {item.storiesData && item.storiesData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Texto de cada Story</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const all = item.storiesData.map(s => `Story ${s.numero}: ${s.texto}`).join('\n\n')
                    copyField('stories-all', all)
                  }}
                  className="h-7 text-xs gap-1"
                >
                  {copiedField === 'stories-all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copiar todo
                </Button>
              </div>
              <div className="space-y-2">
                {item.storiesData.map((story, idx) => (
                  <div key={idx} className="bg-muted/40 p-3 rounded-xl flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#591427] flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {story.numero}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{story.texto}</p>
                      {story.sticker && (
                        <p className="text-xs text-muted-foreground mt-1">Sticker: {story.sticker}</p>
                      )}
                    </div>
                    <button
                      onClick={() => copyField(`story-${story.numero}`, story.texto)}
                      className="text-muted-foreground hover:text-foreground p-1 shrink-0"
                      aria-label={`Copiar story ${story.numero}`}
                    >
                      {copiedField === `story-${story.numero}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA principal: Agendar ── */}
          {item.estado === 'borrador' && !showSchedule && (
            <Button
              onClick={() => {
                setSelectedDate(suggestedDate)
                setShowSchedule(true)
              }}
              className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm gap-2 shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              Agendar en calendario
            </Button>
          )}

          {/* ── Selector de fecha inline ── */}
          {showSchedule && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                ¿Para qué fecha lo agendamos?
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today.toISOString().split('T')[0]}
                className="w-full h-11 px-3 rounded-xl border border-emerald-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSchedule}
                  disabled={!selectedDate}
                  className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm gap-1"
                >
                  <Check className="w-4 h-4" />
                  Confirmar fecha
                </Button>
                <Button
                  onClick={() => setShowSchedule(false)}
                  variant="outline"
                  className="h-10 rounded-xl text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* ── Si ya está agendado, ir al calendario ── */}
          {item.estado === 'programado' && (
            <Button
              onClick={handleGoToCalendar}
              variant="outline"
              className="w-full h-11 rounded-2xl text-sm gap-2"
            >
              <Calendar className="w-4 h-4" />
              Ver en el Calendario
            </Button>
          )}

          {/* ── Acciones secundarias ── */}
          <div className="pt-3 border-t border-border space-y-2">
            <Button
              onClick={copyAll}
              variant="outline"
              className="w-full h-10 rounded-xl text-sm gap-2"
            >
              {copiedField === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedField === 'all' ? '¡Todo copiado!' : 'Copiar todo (guion + copy + hashtags)'}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={regenerateContent}
                disabled={isRegenerating}
                variant="outline"
                className="h-10 rounded-xl text-xs gap-1.5"
              >
                {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Regenerar
              </Button>
              {showConvertButton && (
                <Button
                  onClick={convertContent}
                  disabled={isConverting}
                  variant="outline"
                  className="h-10 rounded-xl text-xs gap-1.5"
                >
                  {isConverting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Repeat className="w-3.5 h-3.5" />}
                  {item.tipo === 'reel' ? 'A carrusel' : 'A reel'}
                </Button>
              )}
            </div>

            <Button
              onClick={handleDelete}
              variant="ghost"
              className="w-full h-10 text-red-500 hover:text-red-700 hover:bg-red-50 text-sm gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar de la Biblioteca
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
