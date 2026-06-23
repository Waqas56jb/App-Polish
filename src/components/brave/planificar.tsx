'use client'

import { useState, useCallback } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { fetchJSON } from '@/lib/fetch-safe'
import { BravyBot } from './bravy-bot'
import { ContentCardModal } from './content-modal'
import {
  Calendar, Sparkles, Loader2, BookOpen, CalendarPlus,
  RefreshCw, Film, LayoutGrid, ChevronDown, ChevronUp,
  ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, nextMonday } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

type PlanTipo = 'semanal' | 'mensual'
type PlanView = 'config' | 'resultado'

// ============================================================
// PLANIFICAR — Versión simplificada
// 1. Configura duración + frecuencia + objetivo (3 clics)
// 2. Ve las mejores ideas propuestas
// 3. Regenera las que no le gusten (individualmente)
// 4. Confirma: guarda en Biblioteca o mueve al Calendario
// ============================================================

const OBJETIVOS = [
  { value: 'autoridad', label: 'Autoridad', emoji: '👑', desc: 'Educar y posicionarte como experta' },
  { value: 'venta', label: 'Venta', emoji: '🎯', desc: 'Conseguir reservas y citas' },
  { value: 'viralidad', label: 'Viralidad', emoji: '🔥', desc: 'Llegar a más personas' },
]

const FRECUENCIAS = [
  { value: 2, label: '2', desc: 'Suave' },
  { value: 3, label: '3', desc: 'Recomendado' },
  { value: 4, label: '4', desc: 'Intenso' },
]

export function Planificar() {
  const { brandProfile, libraryItems, addLibraryItems, setIsLoading, setActiveModule } = useAppStore()

  // ─── Config ───
  const [planTipo, setPlanTipo] = useState<PlanTipo>('semanal')
  const [frecuencia, setFrecuencia] = useState(3)
  const [objetivo, setObjetivo] = useState('autoridad')

  // ─── Resultado ───
  const [view, setView] = useState<PlanView>('config')
  const [items, setItems] = useState<ContentItem[]>([])
  const [generando, setGenerando] = useState(false)
  const [regenerandoIdx, setRegenerandoIdx] = useState<number | null>(null)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [planError, setPlanError] = useState('')

  // ─── Modal ───
  const [openItem, setOpenItem] = useState<ContentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // ─── Conflict dialog ───
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)

  const totalSemanas = planTipo === 'semanal' ? 1 : 4
  const totalItems = frecuencia * totalSemanas

  const calendarioItems = libraryItems.filter(i => i.estado === 'programado')
  const hasCalendarioContent = calendarioItems.length > 0

  // ─── Generar plan ───
  const generatePlan = useCallback(async () => {
    setGenerando(true)
    setPlanError('')
    setIsLoading(true, 'Creando tu plan con las mejores ideas...')
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
        toast.success(`¡Plan con ${parsed.length} ideas listo!`)
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

  // ─── Regenerar idea individual ───
  const regenerateItem = async (index: number) => {
    const item = items[index]
    if (!item) return
    setRegenerandoIdx(index)
    setIsLoading(true, 'Buscando otra idea mejor...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'reel-ideas',
          brandProfile,
          context: {
            servicio: item.servicio,
            objetivo: item.objetivo,
            formato: item.formato,
          },
        }),
        timeoutMs: 60000,
      })
      if (error) {
        toast.error('No se pudo regenerar. Intenta otra vez.')
        return
      }
      let raw = data?.result
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw) } catch { raw = [] }
      }
      if (Array.isArray(raw) && raw.length > 0) {
        // Tomar la primera idea nueva
        const nueva = raw[0]
        setItems(prev => prev.map((it, i) => i === index ? {
          ...it,
          titulo: nueva.titulo || it.titulo,
          descripcion: nueva.descripcion || it.descripcion,
          servicio: nueva.servicio || it.servicio,
        } : it))
        toast.success('Nueva idea generada')
      }
    } catch (e) {
      console.error('Regenerate error:', e)
      toast.error('No se pudo regenerar.')
    } finally {
      setRegenerandoIdx(null)
      setIsLoading(false)
    }
  }

  // ─── Guardar en Biblioteca (sin calendario) ───
  const saveToBiblioteca = () => {
    addLibraryItems(items.map(item => ({ ...item, id: generateId(), estado: 'aprobado' as const })))
    toast.success(`${items.length} ideas guardadas en tu Biblioteca`)
    setActiveModule('biblioteca')
  }

  // ─── Mover al Calendario ───
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
      const oldIds = libraryItems.filter(i => i.estado === 'programado').map(i => i.id)
      oldIds.forEach(id => useAppStore.getState().removeLibraryItem(id))
      addLibraryItems(items.map(item => ({ ...item, id: generateId(), estado: 'programado' as const })))
      toast.success('Plan enviado al Calendario')
    } else {
      const existingDates = new Set(
        libraryItems.filter(i => i.estado === 'programado' && i.fecha).map(i => i.fecha)
      )
      const shifted = items.map(item => {
        let fecha = item.fecha
        if (fecha && existingDates.has(fecha)) {
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
      toast.success('Plan añadido a tu Calendario')
    }

    setActiveModule('calendario')
  }

  // ─── Helpers ───
  const getTipoColor = (tipo: string) => tipo === 'carrusel' ? 'bg-[#FFF1B5] text-[#591427]' : 'bg-[#C1DBE8] text-[#2A1520]'
  const getTipoIcon = (tipo: string) => tipo === 'carrusel' ? <LayoutGrid className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />
  const getTipoLabel = (tipo: string) => tipo === 'carrusel' ? 'Carrusel' : 'Reel'

  const formatDate = (fecha: string) => {
    if (!fecha) return ''
    try {
      return format(new Date(fecha + 'T12:00:00'), 'd MMM', { locale: es })
    } catch {
      return fecha
    }
  }

  // ════════════════════════════════════════════════════════════
  // VISTA DE CONFIGURACIÓN
  // ════════════════════════════════════════════════════════════
  if (view === 'config') {
    return (
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="brave-float inline-block mb-3">
              <BravyBot size={56} expression="excited" animate />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Planificar contenido</h2>
            <p className="text-sm text-muted-foreground mt-1">
              En 3 clics te doy las mejores ideas para tu salón
            </p>
          </div>

          {/* ─── Duración ─── */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              1. ¿Cuánto tiempo quieres planificar?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'semanal' as PlanTipo, label: '1 semana', desc: `${frecuencia} publicaciones` },
                { value: 'mensual' as PlanTipo, label: '1 mes', desc: `${frecuencia * 4} publicaciones` },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPlanTipo(opt.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
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

          {/* ─── Frecuencia ─── */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              2. ¿Cuántas publicaciones por semana?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FRECUENCIAS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFrecuencia(f.value)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    frecuencia === f.value
                      ? 'border-[#591427] bg-[#591427]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#591427]/30'
                  }`}
                >
                  <p className={`font-bold text-lg ${frecuencia === f.value ? 'text-[#591427]' : 'text-foreground'}`}>
                    {f.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Objetivo ─── */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              3. ¿Qué quieres conseguir?
            </label>
            <div className="space-y-2">
              {OBJETIVOS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setObjetivo(o.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                    objetivo === o.value
                      ? 'border-[#591427] bg-[#591427]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#591427]/30'
                  }`}
                >
                  <span className="text-xl">{o.emoji}</span>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${objetivo === o.value ? 'text-[#591427]' : 'text-foreground'}`}>
                      {o.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Botón principal ─── */}
          <button
            onClick={generatePlan}
            disabled={generando || !brandProfile}
            className="w-full py-4 rounded-2xl brave-gradient text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {generando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {generando ? 'Generando...' : `Crear plan de ${totalItems} ideas`}
          </button>

          {planError && (
            <p className="text-xs text-center text-red-500 mt-3">{planError}</p>
          )}

          {!brandProfile && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <p className="text-xs text-amber-800">
                Configura primero tu marca para personalizar el plan
              </p>
              <button
                onClick={() => setActiveModule('marca')}
                className="text-xs text-amber-900 font-semibold underline mt-1"
              >
                Ir a Mi Marca →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // VISTA DE RESULTADO
  // ════════════════════════════════════════════════════════════
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Tu plan {planTipo === 'semanal' ? 'semanal' : 'mensual'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} ideas · revisa y regenera las que quieras
            </p>
          </div>
          <button
            onClick={() => { setView('config'); setItems([]) }}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Empezar de nuevo
          </button>
        </div>

        {/* ─── Lista de tarjetas ─── */}
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const isExpanded = expandedIdx === idx
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                className="brave-glass rounded-2xl border border-border/50 overflow-hidden"
              >
                {/* Header clickable */}
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  {/* Tipo badge */}
                  <span className={`shrink-0 mt-0.5 ${getTipoColor(item.tipo)} rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1`}>
                    {getTipoIcon(item.tipo)}
                    {getTipoLabel(item.tipo)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {item.fecha && (
                        <span className="text-[10px] font-semibold text-[#591427] bg-[#FFF1B5]/60 px-2 py-0.5 rounded-full">
                          {item.diaSemana} {formatDate(item.fecha)}
                        </span>
                      )}
                      {item.servicio && (
                        <span className="text-[10px] text-muted-foreground">{item.servicio}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground leading-snug">{item.titulo}</h3>
                    {item.descripcion && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.descripcion}</p>
                    )}
                  </div>

                  <div className="shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded: acciones */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
                        <p className="text-xs text-foreground/70 leading-relaxed">
                          {item.descripcion}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); regenerateItem(idx) }}
                            disabled={regenerandoIdx === idx}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
                          >
                            {regenerandoIdx === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Regenerar idea
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenItem(item); setModalOpen(true) }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#C1DBE8]/50 text-[#591427] hover:bg-[#C1DBE8]/10 transition-colors"
                          >
                            Ver ficha completa
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

        {/* ─── CTA final fijo abajo ─── */}
        <div className="mt-6 grid grid-cols-2 gap-3 sticky bottom-4 z-10">
          <button
            onClick={saveToBiblioteca}
            className="py-3.5 rounded-2xl bg-white border-2 border-[#C1DBE8] text-[#591427] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#C1DBE8]/10 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Guardar en Biblioteca
          </button>
          <button
            onClick={sendToCalendario}
            className="py-3.5 rounded-2xl brave-gradient text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            Mover al Calendario
          </button>
        </div>

        {/* ─── Tip ─── */}
        <p className="text-xs text-center text-muted-foreground mt-3">
          Si una idea no te convence, ábrela y pulsa "Regenerar idea"
        </p>

        {/* ─── Diálogo de conflicto de calendario ─── */}
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
                  <h3 className="font-bold text-foreground text-base">
                    Ya tienes contenido en el calendario
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tienes {calendarioItems.length} contenido{calendarioItems.length > 1 ? 's' : ''} programado{calendarioItems.length > 1 ? 's' : ''}. ¿Qué prefieres?
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => confirmSendToCalendar('replace')}
                    className="w-full p-3.5 rounded-2xl border-2 border-[#591427] text-left hover:bg-[#591427]/5 transition-colors"
                  >
                    <p className="font-bold text-sm text-[#591427]">Sustituir lo que ya tenía</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Borra el calendario actual y pone este plan
                    </p>
                  </button>
                  <button
                    onClick={() => confirmSendToCalendar('add')}
                    className="w-full p-3.5 rounded-2xl border-2 border-[#C1DBE8] text-left hover:bg-[#C1DBE8]/10 transition-colors"
                  >
                    <p className="font-bold text-sm text-foreground">Añadir a continuación</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Si hay días ocupados, los pone en semanas siguientes
                    </p>
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

        {/* ─── Modal de ficha completa ─── */}
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
