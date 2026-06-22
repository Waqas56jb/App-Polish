'use client'

import { useState, useCallback } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { fetchJSON } from '@/lib/fetch-safe'
import { BravyBot } from './bravy-bot'
import { ContentCardModal } from './content-modal'
import {
  Calendar, Sparkles, Loader2, BookOpen, CalendarPlus,
  RefreshCw, Film, LayoutGrid, ChevronDown, ChevronUp,
  Copy, Check, X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, startOfWeek, nextMonday } from 'date-fns'
import { es } from 'date-fns/locale'

type PlanTipo = 'semanal' | 'mensual'
type PlanView = 'config' | 'resultado'

const OBJETIVOS = [
  { value: 'reservas', label: 'Reservas', emoji: '🎯', desc: 'Conseguir más citas y reservas' },
  { value: 'autoridad', label: 'Autoridad', emoji: '👑', desc: 'Posicionarte como experta' },
  { value: 'visibilidad', label: 'Visibilidad', emoji: '🔥', desc: 'Llegar a más personas' },
]

const FRECUENCIAS = [
  { value: 2, label: '2 por semana', desc: 'Ligero' },
  { value: 3, label: '3 por semana', desc: 'Recomendado' },
  { value: 4, label: '4 por semana', desc: 'Intenso' },
]

export function Planificar() {
  const { brandProfile, libraryItems, addLibraryItems, setIsLoading, setActiveModule } = useAppStore()

  // Config state
  const [planTipo, setPlanTipo] = useState<PlanTipo>('mensual')
  const [frecuencia, setFrecuencia] = useState(3)
  const [objetivo, setObjetivo] = useState('reservas')

  // Result state
  const [view, setView] = useState<PlanView>('config')
  const [items, setItems] = useState<ContentItem[]>([])
  const [generando, setGenerando] = useState(false)
  const [regenerandoIdx, setRegenerandoIdx] = useState<number | null>(null)
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null)

  // Modal
  const [openItem, setOpenItem] = useState<ContentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Expanded card
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  // Calendar conflict dialog
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)

  const totalSemanas = planTipo === 'semanal' ? 1 : 4
  const totalItems = frecuencia * totalSemanas

  // Check if calendar already has content
  const calendarioItems = libraryItems.filter(i => i.estado === 'programado')
  const hasCalendarioContent = calendarioItems.length > 0

  const [planError, setPlanError] = useState('')

  const generatePlan = useCallback(async () => {
    setGenerando(true)
    setPlanError('')
    setIsLoading(true, 'Generando tu plan de contenido...')
    try {
      const fechaInicio = format(nextMonday(new Date()), 'yyyy-MM-dd')
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'plan',
          brandProfile,
          context: {
            tipo: planTipo,
            servicios: brandProfile?.serviciosPrioritarios?.length ? brandProfile.serviciosPrioritarios : brandProfile?.servicios,
            frecuencia,
            objetivo,
            fechaInicio,
          },
        }),
        timeoutMs: 90000,
      })
      if (error) { setPlanError(error); return }
      let raw = data?.result
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw) } catch { raw = [] }
      }
      if (Array.isArray(raw) && raw.length > 0) {
        const parsed: ContentItem[] = raw.map((r: any, i: number) => ({
          id: `plan-${Date.now()}-${i}`,
          tipo: r.tipo || 'reel',
          titulo: r.titulo || `Contenido ${i + 1}`,
          objetivo: r.objetivo || objetivo,
          servicio: r.servicio || '',
          guion: '',
          copy: '',
          hashtags: '',
          textoPortada: r.titulo || '',
          formato: r.tipo === 'carrusel' ? 'carrusel' : 'hablando a cámara',
          estado: 'aprobado' as const,
          fecha: r.fecha || '',
          diaSemana: r.diaSemana || '',
          slides: [],
          storiesData: [],
          descripcion: r.descripcion || '',
          planId: `plan-${Date.now()}`,
          createdAt: new Date().toISOString(),
        }))
        setItems(parsed)
        setView('resultado')
      } else {
        setPlanError('No se pudo generar el plan. Intenta de nuevo.')
      }
    } catch (e) {
      console.error('Plan generation error:', e)
      setPlanError('Error inesperado. Intenta de nuevo.')
    } finally {
      setGenerando(false)
      setIsLoading(false)
    }
  }, [planTipo, frecuencia, objetivo, brandProfile, setIsLoading])

  const regenerateItem = async (index: number) => {
    const item = items[index]
    if (!item) return
    setRegenerandoIdx(index)
    setIsLoading(true, 'Generando contenido completo...')
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
        timeoutMs: 60000,
      })
      if (error) { console.error('Regenerate error:', error); return }
      if (data?.result && !data.result.raw) {
        setItems(prev => prev.map((it, i) => i === index ? {
          ...it,
          guion: data.result.guion || it.guion,
          copy: data.result.copy || it.copy,
          hashtags: data.result.hashtags || it.hashtags,
          textoPortada: data.result.textoPortada || it.textoPortada,
        } : it))
      }
    } catch (e) {
      console.error('Regenerate error:', e)
    } finally {
      setRegenerandoIdx(null)
      setIsLoading(false)
    }
  }

  const copyItem = (index: number) => {
    const item = items[index]
    const text = `${item.titulo}\n\n${item.guion}\n\n${item.copy}\n\n${item.hashtags}`
    navigator.clipboard.writeText(text)
    setCopiadoIdx(index)
    setTimeout(() => setCopiadoIdx(null), 2000)
  }

  const handleOpenItem = (item: ContentItem) => {
    setOpenItem(item)
    setModalOpen(true)
  }

  // Save to Biblioteca (without calendar)
  const saveToBiblioteca = () => {
    addLibraryItems(items.map(item => ({ ...item, id: generateId(), estado: 'aprobado' as const })))
  }

  // Send to Calendario
  const sendToCalendario = () => {
    if (hasCalendarioContent) {
      setShowCalendarDialog(true)
    } else {
      confirmSendToCalendar('add')
    }
  }

  const confirmSendToCalendar = (action: 'replace' | 'add') => {
    setShowCalendarDialog(false)

    if (action === 'replace') {
      // Remove old scheduled items, add new ones
      const oldIds = libraryItems.filter(i => i.estado === 'programado').map(i => i.id)
      oldIds.forEach(id => useAppStore.getState().removeLibraryItem(id))
      addLibraryItems(items.map(item => ({ ...item, id: generateId(), estado: 'programado' as const })))
    } else {
      // Add new items, pushing dates if overlap
      const existingDates = new Set(
        libraryItems.filter(i => i.estado === 'programado' && i.fecha).map(i => i.fecha)
      )
      const shifted = items.map(item => {
        let fecha = item.fecha
        if (fecha && existingDates.has(fecha)) {
          // Push to next available day
          let d = new Date(fecha)
          for (let i = 0; i < 30; i++) {
            d = addDays(d, 1)
            const ds = format(d, 'yyyy-MM-dd')
            if (!existingDates.has(ds)) break
          }
          fecha = format(d, 'yyyy-MM-dd')
          existingDates.add(fecha)
        } else if (fecha) {
          existingDates.add(fecha)
        }
        return { ...item, id: generateId(), estado: 'programado' as const, fecha }
      })
      addLibraryItems(shifted)
    }

    setActiveModule('calendario')
  }

  const getTipoColor = (tipo: string) => tipo === 'carrusel' ? 'bg-[#FFF1B5] text-[#591427]' : 'bg-[#C1DBE8] text-[#2A1520]'
  const getTipoIcon = (tipo: string) => tipo === 'carrusel' ? <LayoutGrid className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />

  // ─── CONFIG VIEW ───
  if (view === 'config') {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="brave-float inline-block mb-3">
              <BravyBot size={64} expression="excited" animate speechBubble="Planifiquemos tu contenido!" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Planificar contenido</h2>
            <p className="text-sm text-muted-foreground mt-1">Elige y genera tu plan en un clic</p>
          </div>

          {/* Tipo: Semanal / Mensual */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-foreground mb-2 block">Duración</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'semanal' as PlanTipo, label: '1 Semana', desc: `${frecuencia} publicaciones` },
                { value: 'mensual' as PlanTipo, label: '1 Mes', desc: `${frecuencia * 4} publicaciones` },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPlanTipo(opt.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    planTipo === opt.value
                      ? 'border-[#591427] bg-[#591427]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#591427]/30'
                  }`}
                >
                  <p className={`font-bold text-sm ${planTipo === opt.value ? 'text-[#591427]' : 'text-foreground'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Frecuencia */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-foreground mb-2 block">Publicaciones por semana</label>
            <div className="grid grid-cols-3 gap-2">
              {FRECUENCIAS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFrecuencia(f.value)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all duration-200 ${
                    frecuencia === f.value
                      ? 'border-[#591427] bg-[#591427]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#591427]/30'
                  }`}
                >
                  <p className={`font-bold text-lg ${frecuencia === f.value ? 'text-[#591427]' : 'text-foreground'}`}>
                    {f.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{f.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Objetivo */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-foreground mb-2 block">Objetivo principal</label>
            <div className="space-y-2">
              {OBJETIVOS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setObjetivo(o.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    objetivo === o.value
                      ? 'border-[#591427] bg-[#591427]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#591427]/30'
                  }`}
                >
                  <span className="text-xl">{o.emoji}</span>
                  <div>
                    <p className={`font-bold text-sm ${objetivo === o.value ? 'text-[#591427]' : 'text-foreground'}`}>{o.label}</p>
                    <p className="text-xs text-muted-foreground">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generatePlan}
            disabled={generando || !brandProfile}
            className="w-full py-4 rounded-2xl brave-gradient text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50"
          >
            {generando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {generando ? 'Generando plan...' : `Generar plan de ${totalItems} contenidos`}
          </button>

          {planError && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-center text-red-500 mt-3 max-w-sm mx-auto"
            >
              {planError}
            </motion.p>
          )}

          {!brandProfile && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Configura tu marca primero para personalizar el plan
            </p>
          )}
        </motion.div>
      </div>
    )
  }

  // ─── RESULT VIEW ───
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Plan {planTipo === 'semanal' ? 'semanal' : 'mensual'}
            </h2>
            <p className="text-sm text-muted-foreground">{items.length} contenidos listos</p>
          </div>
          <button
            onClick={() => { setView('config'); setItems([]) }}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Nuevo plan
          </button>
        </div>

        {/* Cards list */}
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const isExpanded = expandedIdx === idx
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="brave-glass rounded-2xl border border-border/50 overflow-hidden brave-glow"
              >
                {/* Card header - clickable to expand/open */}
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  {/* Type badge */}
                  <span className={`shrink-0 mt-0.5 ${getTipoColor(item.tipo)} rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1`}>
                    {getTipoIcon(item.tipo)}
                    {item.tipo.toUpperCase()}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {item.fecha && (
                        <span className="text-[10px] font-semibold text-[#591427] bg-[#FFF1B5]/60 px-2 py-0.5 rounded-full">
                          {item.diaSemana} {item.fecha && format(new Date(item.fecha + 'T12:00:00'), 'd MMM', { locale: es })}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{item.servicio}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground leading-snug">{item.titulo}</h3>
                    {item.descripcion && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.descripcion}</p>
                    )}
                  </div>

                  <div className="shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                        {/* Guion */}
                        {item.guion && (
                          <div>
                            <p className="text-[10px] font-bold text-[#591427] uppercase tracking-wide mb-1">Guión</p>
                            <div className="bg-muted/50 rounded-xl p-3 text-xs text-foreground/80 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                              {item.guion}
                            </div>
                          </div>
                        )}

                        {/* Copy */}
                        {item.copy && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-bold text-[#591427] uppercase tracking-wide">Copy</p>
                              <button onClick={() => copyItem(idx)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                                {copiadoIdx === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copiadoIdx === idx ? 'Copiado' : 'Copiar'}
                              </button>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-3 text-xs text-foreground/80 leading-relaxed">
                              {item.copy}
                            </div>
                          </div>
                        )}

                        {/* Hashtags */}
                        {item.hashtags && (
                          <div>
                            <p className="text-[10px] font-bold text-[#591427] uppercase tracking-wide mb-1">Hashtags</p>
                            <p className="text-xs text-[#7EC8E3]">{item.hashtags}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); regenerateItem(idx) }}
                            disabled={regenerandoIdx === idx}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
                          >
                            {regenerandoIdx === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Regenerar
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenItem(item) }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#C1DBE8]/50 text-[#591427] hover:bg-[#C1DBE8]/10 transition-colors"
                          >
                            Abrir ficha
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="mt-6 grid grid-cols-2 gap-3 sticky bottom-4 z-10">
          <button
            onClick={saveToBiblioteca}
            className="py-3.5 rounded-2xl bg-white border-2 border-[#C1DBE8] text-[#591427] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#C1DBE8]/10 transition-all brave-card-hover"
          >
            <BookOpen className="w-4 h-4" />
            Guardar en biblioteca
          </button>
          <button
            onClick={sendToCalendario}
            className="py-3.5 rounded-2xl brave-gradient text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            Enviar al calendario
          </button>
        </div>

        {/* Calendar conflict dialog */}
        <AnimatePresence>
          {showCalendarDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowCalendarDialog(false)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="brave-glass-strong rounded-3xl shadow-2xl p-6 max-w-sm w-full"
              >
                <div className="text-center mb-4">
                  <div className="brave-float inline-block mb-2">
                    <BravyBot size={48} expression="thinking" animate />
                  </div>
                  <h3 className="font-bold text-foreground text-base">Ya tienes contenido en el calendario</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tienes {calendarioItems.length} contenido{calendarioItems.length > 1 ? 's' : ''} programado{calendarioItems.length > 1 ? 's' : ''}. ¿Qué quieres hacer?
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => confirmSendToCalendar('replace')}
                    className="w-full p-3.5 rounded-2xl border-2 border-[#591427] text-left hover:bg-[#591427]/5 transition-colors"
                  >
                    <p className="font-bold text-sm text-[#591427]">Sustituir plan actual</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Elimina lo anterior y pone el nuevo plan</p>
                  </button>
                  <button
                    onClick={() => confirmSendToCalendar('add')}
                    className="w-full p-3.5 rounded-2xl border-2 border-[#C1DBE8] text-left hover:bg-[#C1DBE8]/10 transition-colors"
                  >
                    <p className="font-bold text-sm text-foreground">Añadir a continuación</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Si hay días ocupados, los pone en las semanas siguientes</p>
                  </button>
                  <button
                    onClick={() => setShowCalendarDialog(false)}
                    className="w-full p-3 rounded-2xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Modal */}
        <ContentCardModal
          item={openItem}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          showConvertButton={false}
        />
      </motion.div>
    </div>
  )
}