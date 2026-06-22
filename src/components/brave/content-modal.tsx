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
import { Badge } from '@/components/ui/badge'
import {
  Copy, Save, RefreshCw, Trash2, FileText, Film,
  LayoutGrid, Repeat, Check, Loader2
} from 'lucide-react'
import { fetchJSON } from '@/lib/fetch-safe'

interface ContentModalProps {
  item: ContentItem | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: string) => void
  showConvertButton?: boolean
}

export function ContentCardModal({ item, isOpen, onClose, onDelete, showConvertButton = true }: ContentModalProps) {
  const { brandProfile, addLibraryItems, replaceLibraryItem, removeLibraryItem, setIsLoading } = useAppStore()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setCopiedField(null)
      setIsRegenerating(false)
      setIsConverting(false)
    }
  }, [isOpen])

  if (!item) return null

  const copyField = (field: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(field)
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
    setTimeout(() => setCopiedField(null), 2000)
  }

  const saveToLibrary = () => {
    if (!item) return
    addLibraryItems([{ ...item, id: generateId() }])
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
      }
    } catch (error) {
      console.error('Regenerate error:', error)
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
        onClose()
      }
    } catch (error) {
      console.error('Convert error:', error)
    } finally {
      setIsConverting(false)
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    if (!item) return
    if (onDelete) {
      onDelete(item.id)
    } else {
      removeLibraryItem(item.id)
    }
    onClose()
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'reel': return 'bg-[#C1DBE8]'
      case 'carrusel': return 'bg-[#FFF1B5]'
      case 'story': return 'bg-[#591427]'
      default: return 'bg-gray-500'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'reel': return <Film className="w-3 h-3" />
      case 'carrusel': return <LayoutGrid className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0 rounded-3xl">
        {/* Header */}
        <div className="brave-gradient p-5 text-white sticky top-0 z-10">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className={`${getTipoColor(item.tipo)} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
                {getTipoIcon(item.tipo)}
                {item.tipo.toUpperCase()}
              </span>
              {item.objetivo && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full capitalize">
                  {item.objetivo}
                </span>
              )}
              {item.diaSemana && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {item.diaSemana}
                </span>
              )}
              {item.fecha && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {item.fecha}
                </span>
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {item.titulo}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFFBF0] p-3 rounded-xl">
              <p className="text-xs text-muted-foreground">Servicio</p>
              <p className="text-sm font-medium text-[#2A1520]">{item.servicio || '—'}</p>
            </div>
            <div className="bg-[#FFFBF0] p-3 rounded-xl">
              <p className="text-xs text-muted-foreground">Formato</p>
              <p className="text-sm font-medium text-[#2A1520] capitalize">{item.formato || '—'}</p>
            </div>
            <div className="bg-[#FFFBF0] p-3 rounded-xl">
              <p className="text-xs text-muted-foreground">Objetivo</p>
              <p className="text-sm font-medium text-[#2A1520] capitalize">{item.objetivo || '—'}</p>
            </div>
            <div className="bg-[#FFFBF0] p-3 rounded-xl">
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="text-sm font-medium text-[#2A1520] capitalize">{item.tipo || '—'}</p>
            </div>
          </div>

          {/* Descripción */}
          {item.descripcion && (
            <div className="bg-[#FFFBF0] p-3 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Descripción</p>
              <p className="text-sm text-[#2A1520]">{item.descripcion}</p>
            </div>
          )}

          {/* Guión */}
          {item.guion && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#591427]">Guión completo</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyField('guion', item.guion)}
                  className="text-[#C1DBE8] hover:text-[#591427] hover:bg-[#F5F0EB] h-7"
                >
                  {copiedField === 'guion' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedField === 'guion' ? 'Copiado' : 'Copiar guión'}
                </Button>
              </div>
              <div className="bg-[#FFFBF0] p-4 rounded-xl whitespace-pre-line text-sm text-[#2A1520] max-h-[200px] overflow-y-auto">
                {item.guion}
              </div>
            </div>
          )}

          {/* Copy */}
          {item.copy && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#591427]">Copy (descripción del post)</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyField('copy', item.copy)}
                  className="text-[#C1DBE8] hover:text-[#591427] hover:bg-[#F5F0EB] h-7"
                >
                  {copiedField === 'copy' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedField === 'copy' ? 'Copiado' : 'Copiar copy'}
                </Button>
              </div>
              <div className="bg-[#FFFBF0] p-4 rounded-xl text-sm text-[#2A1520]">
                {item.copy}
              </div>
            </div>
          )}

          {/* Hashtags */}
          {item.hashtags && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#591427]">Hashtags</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyField('hashtags', item.hashtags)}
                  className="text-[#C1DBE8] hover:text-[#591427] hover:bg-[#F5F0EB] h-7"
                >
                  {copiedField === 'hashtags' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedField === 'hashtags' ? 'Copiado' : 'Copiar hashtags'}
                </Button>
              </div>
              <div className="bg-[#FFFBF0] p-4 rounded-xl text-sm text-[#C1DBE8]">
                {item.hashtags}
              </div>
            </div>
          )}

          {/* Slides (for carrusel) */}
          {item.slides && item.slides.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#591427]">Slides del carrusel</label>
              <div className="space-y-2">
                {item.slides.map((slide, idx) => (
                  <div key={idx} className="bg-[#FFFBF0] p-3 rounded-xl flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#FFF1B5] flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {slide.numero}
                    </div>
                    <p className="text-sm text-[#2A1520] flex-1">{slide.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#E8DDD5]">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                onClick={copyAll}
                className="bg-[#C1DBE8] hover:bg-[#8BB8D0] text-[#2A1520]"
              >
                {copiedField === 'all' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedField === 'all' ? '¡Todo copiado!' : 'Copiar todo'}
              </Button>
              <Button
                onClick={saveToLibrary}
                className="bg-[#591427] hover:bg-[#7A2A40] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar en biblioteca
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={regenerateContent}
                disabled={isRegenerating}
                variant="outline"
                className="border-[#C1DBE8] text-[#C1DBE8] hover:bg-[#F5F0EB]"
              >
                {isRegenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Regenerar contenido
              </Button>
              {showConvertButton && (
                <Button
                  onClick={convertContent}
                  disabled={isConverting}
                  variant="outline"
                  className="border-[#FFF1B5] text-[#FFF1B5] hover:bg-[#FFFBF0]"
                >
                  {isConverting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Repeat className="w-4 h-4 mr-2" />}
                  {isConverting ? 'Convirtiendo...' : `Convertir a ${item.tipo === 'reel' ? 'carrusel' : 'reel'}`}
                </Button>
              )}
            </div>
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="w-full mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
