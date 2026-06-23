'use client'

import { useState, useCallback } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { fetchJSON } from '@/lib/fetch-safe'
import { BravyBot } from './bravy-bot'
import {
  Calendar, Sparkles, Loader2, BookOpen, CalendarPlus,
  RefreshCw, Film, LayoutGrid, ChevronDown, ChevronUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, nextMonday } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

type PlanTipo = 'semanal' | 'mensual'
type PlanView = 'config' | 'resultado'

// ============================================================
// PLANIFICAR — Versión simplificada
// 1. Configura: duración + frecuencia (hasta 5) + objetivo + temáticas
// 2. Ve las ideas propuestas (solo títulos + info esencial)
// 3. Acciones globales: regenerar todas / guardar en biblioteca / mover al calendario
// 4. Opcional: desplegar cada idea para ver detalle
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
  { value: 5, label: '5', desc: 'Muy intenso' },
]

// Temáticas comunes en salones de belleza (además de los servicios del perfil)
const TEMATICAS_BASE = [
  'Balayage', 'Rubios', 'Coloración', 'Cortes', 'Peinado',
  'Alisados', 'Permanente', 'Tratamientos', 'Keratina',
  'Extensiones', 'Canas', 'Decoloración', 'Reflejos',
  'Matizadores', 'Cepillado', 'Recogidos',
  'Mitos del sector', 'Errores comunes', 'Tendencias',
  'Cuidado del cabello', 'Productos profesionales',
  'Antes y después', 'Casos reales', 'Día a día en el salón',
]

export function Planificar() {
  const { brandProfile, libraryItems, addLibraryItems, setIsLoading, setActiveModule } = useAppStore()

  // ─── Config ───
  const [planTipo, setPlanTipo] = useState<PlanTipo>('semanal')
  const [frecuencia, setFrecuencia] = useState(3)
  const [objetivo, setObjetivo] = useState('autoridad')
  const [tematicas, setTematicas] = useState<string[]>(
    brandProfile?.serviciosPrioritarios?.length
      ? brandProfile.serviciosPrioritarios.slice(0, 3)
      : brandProfile?.servicios?.length
        ? brandProfile.servicios.slice(0, 3)
        : ['Balayage', 'Cortes', 'Tratamientos']
  )

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

  // Temáticas disponibles = combinación de servicios del perfil + temáticas base, sin duplicados
  const tematicasDisponibles = Array.from(new Set([
    ...(brandProfile?.servicios || []),
    ...TEMATICAS_BASE,
  ]))

  const toggleTematica = (t: string) => {
    setTematicas(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  // ─── Generar plan ───
  const generatePlan = useCallback(async () => {
    if (tematicas.length === 0) {
      toast.error('Selecciona al menos una temática')
      return
    }
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
            servicios: tematicas,
            frecuencia,
            objetivo,
            fechaInicio,
          },
        }),
        timeoutMs: 120000,
      })
      if (error) { setPlanError(error); toast.error(error); return }
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
        setExpandedIdx(null)
        toast.success(`¡${parsed.length} ideas listas!`)
      } else {
        setPlanError('No se pudo generar el plan. Intenta de nuevo.')
        toast.error('No se pudo generar el plan')
      }
    } catch (e) {
      console.error('Plan generation error:', e)
      setPlanError('Error inesperado. Intenta de nuevo.')
      toast.error('Error inesperado')
    } finally {
      setGenerando(false)
      setIsLoading(false)
    }
  }, [planTipo, frecuencia, objetivo, tematicas, brandProfile, setIsLoading])

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
        toast.error('No se pudo regenerar')
        return
      }
      let raw = data?.result
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw) } catch { raw = [] }
      }
      if (Array.isArray(raw) && raw.length > 0) {
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
      toast.error('No se pudo regenerar')
    } finally {
      setRegenerandoIdx(null)
      setIsLoading(false)
    }
  }

  // ─── Guardar en Biblioteca ───
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
          <div className="text-center mb-5">
            <div className="brave-float inline-block mb-2">
              <BravyBot size={48} expression="excited" animate />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Planificar contenido</h2>
            <p className="text-sm text-muted-foreground mt-1">
              En 4 clics te doy las mejores ideas para tu salón
            </p>
          </div>

          {/* ─── 1. Duración ─── */}
          <div className="mb-4">
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
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
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

          {/* ─── 2. Frecuencia ─── */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              2. ¿Cuántas publicaciones por semana?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FRECUENCIAS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFrecuencia(f.value)}
                  className={`relative p-2.5 rounded-2xl border-2 text-center transition-all ${
                    frecuencia === f.value
                      ? 'border-[#591427] bg-[#591427]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#591427]/30'
                  }`}
                >
                  {f.desc === 'Recomendado' && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FFF1B5] text-[#591427] text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      TOP
                    </span>
                  )}
                  <p className={`font-bold text-lg ${frecuencia === f.value ? 'text-[#591427]' : 'text-foreground'}`}>
                    {f.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── 3. Objetivo ─── */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              3. ¿Qué quieres conseguir?
            </label>
            <div className="space-y-2">
              {OBJETIVOS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setObjetivo(o.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
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

          {/* ─── 4. Temáticas de servicios ─── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">
                4. ¿De qué temáticas quieres hablar?
              </label>
              <span className="text-xs text-muted-foreground">
                {tematicas.length} seleccionada{tematicas.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1">
              {tematicasDisponibles.map(t => {
                const sel = tematicas.includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => toggleTematica(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      sel
                        ? 'brave-gradient text-white shadow-sm'
                        : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Selecciona los servicios o temas sobre los que quieres crear contenido
            </p>
          </div>

          {/* ─── Botón principal ─── */}
          <button
            onClick={generatePlan}
            disabled={generando || tematicas.length === 0}
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
        </motion.div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // VISTA DE RESULTADO — Simplificada
  // Lista simple de ideas, cada una con acciones inline.
  // Expandir opcional para ver descripción.
  // ════════════════════════════════════════════════════════════
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Tu plan {planTipo === 'semanal' ? 'semanal' : 'mensual'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} ideas · revisa y elige qué hacer
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

        {/* ─── Lista simple de ideas ─── */}
        <div className="space-y-2">
          {items.map((item, idx) => {
            const isExpanded = expandedIdx === idx
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                className="brave-glass rounded-2xl border border-border/50"
              >
                {/* Fila principal clicable */}
                <div className="p-3 flex items-center gap-3">
                  {/* Tipo badge */}
                  <span className={`shrink-0 ${getTipoColor(item.tipo)} rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1`}>
                    {getTipoIcon(item.tipo)}
                    {getTipoLabel(item.tipo)}
                  </span>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      {item.fecha && (
                        <span className="text-[10px] font-semibold text-[#591427] bg-[#FFF1B5]/60 px-2 py-0.5 rounded-full">
                          {item.diaSemana} {formatDate(item.fecha)}
                        </span>
                      )}
                      {item.servicio && (
                        <span className="text-[10px] text-muted-foreground">{item.servicio}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1">
                      {item.titulo}
                    </h3>
                  </div>

                  {/* Botón expandir */}
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Ver detalle"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Descripción (expandible) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-3 border-t border-border/30 pt-3">
                        {item.descripcion && (
                          <p className="text-xs text-foreground/70 leading-relaxed">{item.descripcion}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => regenerateItem(idx)}
                            disabled={regenerandoIdx === idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
                          >
                            {regenerandoIdx === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Regenerar
                          </button>
                          <button
                            onClick={() => { setOpenItem(item); setModalOpen(true) }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#C1DBE8]/50 text-[#591427] hover:bg-[#C1DBE8]/10 transition-colors"
                          >
                            Ver ficha
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
        <div className="mt-5 grid grid-cols-2 gap-2 sticky bottom-4 z-10">
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
          Toca cualquier idea para ver más opciones. Para regenerar todas, pulsa "Empezar de nuevo".
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
        {modalOpen && openItem && (
          <SimpleItemModal
            item={openItem}
            onClose={() => { setModalOpen(false); setOpenItem(null) }}
          />
        )}
      </motion.div>
    </div>
  )
}

// ─── Modal simple para ver ficha rápida ──────────────────────
function SimpleItemModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-background rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="brave-gradient p-5 text-white sticky top-0 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70 uppercase tracking-wide font-semibold mb-1">
                {item.diaSemana} {item.fecha && `· ${item.fecha}`}
              </p>
              <h3 className="text-lg font-bold leading-snug">{item.titulo}</h3>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none shrink-0">×</button>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-muted/50 px-3 py-1 rounded-full">
              <strong className="text-foreground">{item.servicio || 'General'}</strong>
            </span>
            <span className="bg-muted/50 px-3 py-1 rounded-full capitalize">{item.objetivo}</span>
            <span className="bg-muted/50 px-3 py-1 rounded-full">{item.tipo}</span>
          </div>
          {item.descripcion && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-foreground leading-relaxed">{item.descripcion}</p>
            </div>
          )}
          {!item.guion && !item.copy && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-800">
                Esta es una propuesta de idea. Para generar guion completo, guárdala en tu Biblioteca y luego ábrela para regenerar.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
