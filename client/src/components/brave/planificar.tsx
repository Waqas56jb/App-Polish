'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { fetchJSON } from '@/lib/fetch-safe'
import { BravyBot } from './bravy-bot'
import {
  Calendar, Sparkles, Loader2, BookOpen, CalendarPlus,
  RefreshCw, Film, LayoutGrid, ChevronDown, ChevronUp,
  Save, Copy, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, addWeeks, nextMonday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

type PlanTipo = 'semanal' | 'mensual'
type PlanView = 'config' | 'resultado'
type TipoContenido = 'reels' | 'carruseles' | 'mezcla'

// ============================================================
// PLANIFICAR — Versión mejorada
// Config:
//   1. Duración (semanal/mensual)
//   2. Frecuencia (2, 3, 4, 5)
//   3. Objetivo (Autoridad / Venta / Viralidad)
//   4. Tipo de contenido (Reels / Carruseles / Mixto — mayoría reels)
//   5. Temáticas (máximo 3)
// Resultado:
//   - Lista de ideas con botones visibles (Regenerar / Biblioteca / Calendario)
//   - Clic en idea → modal con ficha COMPLETA (genera guion bajo demanda)
//   - Días repartidos proporcionalmente (Mar, Jue, Dom preferidos)
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

const TIPOS_CONTENIDO = [
  { value: 'reels' as TipoContenido, label: 'Solo Reels', desc: 'Todos los contenidos serán Reels' },
  { value: 'carruseles' as TipoContenido, label: 'Solo Carruseles', desc: 'Todos los contenidos serán Carruseles' },
  { value: 'mezcla' as TipoContenido, label: 'Mixto', desc: 'Mayoría Reels (70%) + algunos Carruseles' },
]

const TEMATICAS_BASE = [
  'Balayage', 'Rubios', 'Coloración', 'Cortes', 'Peinado',
  'Alisados', 'Permanente', 'Tratamientos', 'Keratina',
  'Extensiones', 'Canas', 'Decoloración', 'Reflejos',
  'Matizadores', 'Cepillado', 'Recogidos',
  'Mitos del sector', 'Errores comunes', 'Tendencias',
  'Cuidado del cabello', 'Productos profesionales',
  'Antes y después', 'Casos reales', 'Día a día en el salón',
]

// ─── Días preferidos para publicar (en orden de prioridad) ──────
// Basado en engagement típico: martes, jueves y domingo son los mejores.
// Lunes, viernes y sábado son menos exitosos.
const DIAS_PREFERIDOS = [
  2,  // Martes
  4,  // Jueves
  0,  // Domingo
  3,  // Miércoles
  6,  // Sábado (mejor que lunes/viernes)
  1,  // Lunes
  5,  // Viernes
]

// Devuelve N fechas repartidas proporcionalmente en una semana
// empezando desde fechaInicio. Evita lunes/viernes si es posible.
function repartirFechasSemana(fechaInicio: Date, numPublicaciones: number): { fecha: string; diaSemana: string }[] {
  const diasSemanaNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const resultados: { fecha: string; diaSemana: string }[] = []

  // Si hay más publicaciones que días preferidos, ampliamos el reparto a varias semanas
  // pero dentro de una semana de planificación, repartimos lo mejor posible.
  const diasAUsar = DIAS_PREFERIDOS.slice(0, Math.max(numPublicaciones, 3))

  // Encontrar el domingo más cercano antes de fechaInicio + 7 días
  // para asegurarnos de cubrir una semana completa
  const semanaInicio = new Date(fechaInicio)

  // Para cada publicación, encontrar el próximo día preferido disponible
  const fechasUsadas = new Set<string>()
  let cursorFecha = new Date(semanaInicio)

  for (let i = 0; i < numPublicaciones; i++) {
    const diaObjetivo = diasAUsar[i % diasAUsar.length]

    // Avanzar hasta encontrar ese día de la semana
    let intentos = 0
    while (cursorFecha.getDay() !== diaObjetivo && intentos < 14) {
      cursorFecha = addDays(cursorFecha, 1)
      intentos++
    }

    // Si ya está usada esta fecha, buscar el próximo día con mismo weekday (semana siguiente)
    let fechaStr = format(cursorFecha, 'yyyy-MM-dd')
    let contadorSemanas = 0
    while (fechasUsadas.has(fechaStr) && contadorSemanas < 5) {
      cursorFecha = addWeeks(cursorFecha, 1)
      fechaStr = format(cursorFecha, 'yyyy-MM-dd')
      contadorSemanas++
    }

    fechasUsadas.add(fechaStr)
    resultados.push({
      fecha: fechaStr,
      diaSemana: diasSemanaNombres[cursorFecha.getDay()],
    })

    // Avanzar al menos 1 día para la siguiente búsqueda
    cursorFecha = addDays(cursorFecha, 1)
  }

  // Ordenar por fecha
  resultados.sort((a, b) => a.fecha.localeCompare(b.fecha))
  return resultados
}

export function Planificar() {
  const { brandProfile, libraryItems, addLibraryItems, setIsLoading, setActiveModule } = useAppStore()

  // ─── Config ───
  const [planTipo, setPlanTipo] = useState<PlanTipo>('semanal')
  const [frecuencia, setFrecuencia] = useState(3)
  const [objetivo, setObjetivo] = useState('autoridad')
  const [tipoContenido, setTipoContenido] = useState<TipoContenido>('mezcla')
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

  // ─── Modal de ficha completa ───
  const [openItem, setOpenItem] = useState<ContentItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [generandoScript, setGenerandoScript] = useState(false)
  const [scriptModal, setScriptModal] = useState<any>(null)

  // ─── Conflict dialog ───
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)

  const totalSemanas = planTipo === 'semanal' ? 1 : 4
  const totalItems = frecuencia * totalSemanas

  const calendarioItems = libraryItems.filter(i => i.estado === 'programado')
  const hasCalendarioContent = calendarioItems.length > 0

  // ─── Estado: diálogo de confirmación al reactivar módulo ───
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ─── Escuchar evento: clic en módulo activo → preguntar antes de reset ───
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.module === 'planificar') {
        // Si hay items generados y estamos en vista resultado, preguntar antes de borrar
        if (view === 'resultado' && items.length > 0) {
          setShowResetConfirm(true)
        } else {
          // Si no hay nada que perder, reset directo
          setView('config')
          setItems([])
          setExpandedIdx(null)
        }
      }
    }
    window.addEventListener('module-reactivate', handler)
    return () => window.removeEventListener('module-reactivate', handler)
  }, [view, items])

  // ─── Confirmar reset: sí, perder el avance ───
  const confirmReset = () => {
    setShowResetConfirm(false)
    setView('config')
    setItems([])
    setExpandedIdx(null)
  }

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const tematicasDisponibles = Array.from(new Set([
    ...(brandProfile?.servicios || []),
    ...TEMATICAS_BASE,
  ]))

  const toggleTematica = (t: string) => {
    setTematicas(prev => {
      if (prev.includes(t)) {
        return prev.filter(x => x !== t)
      }
      // Máximo 3 temáticas
      if (prev.length >= 3) {
        toast.info('Máximo 3 temáticas. Quita una para añadir otra.')
        return prev
      }
      return [...prev, t]
    })
  }

  // ─── Generar plan ───
  const generatePlan = useCallback(async () => {
    if (tematicas.length === 0) {
      toast.error('Selecciona al menos una temática')
      return
    }
    setGenerando(true)
    setIsLoading(true, 'Creando tu plan con las mejores ideas...')
    try {
      const fechaInicio = nextMonday(new Date())
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
            tipoContenido,
            fechaInicio: format(fechaInicio, 'yyyy-MM-dd'),
          },
        }),
        timeoutMs: 120000,
      })
      if (error) { toast.error(error); return }
      let raw = data?.result
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw) } catch { raw = [] }
      }
      if (Array.isArray(raw) && raw.length > 0) {
        // Repartir fechas proporcionalmente según frecuencia
        const fechasRepartidas = repartirFechasSemana(fechaInicio, raw.length)

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
          fecha: fechasRepartidas[i]?.fecha || r.fecha || '',
          diaSemana: fechasRepartidas[i]?.diaSemana || r.diaSemana || '',
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
        toast.error('No se pudo generar el plan')
      }
    } catch (e) {
      console.error('Plan generation error:', e)
      toast.error('Error inesperado')
    } finally {
      setGenerando(false)
      setIsLoading(false)
    }
  }, [planTipo, frecuencia, objetivo, tipoContenido, tematicas, brandProfile, setIsLoading])

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
      if (error) { toast.error('No se pudo regenerar'); return }
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

  // ─── Guardar UNA idea en biblioteca ───
  const saveItemToBiblioteca = (index: number) => {
    const item = items[index]
    if (!item) return
    addLibraryItems([{ ...item, id: generateId(), estado: 'aprobado' as const }])
    // Permanecemos en Planificar para que la usuaria siga revisando las demás ideas
    toast.success(`"${item.titulo}" guardada en tu Biblioteca`, {
      description: 'Puedes seguir revisando las demás ideas',
      duration: 3500,
    })
  }

  // ─── Guardar UNA idea en calendario ───
  const saveItemToCalendario = (index: number) => {
    const item = items[index]
    if (!item) return
    addLibraryItems([{ ...item, id: generateId(), estado: 'programado' as const }])
    toast.success(`"${item.titulo}" añadida al calendario`, {
      description: `${item.diaSemana} ${item.fecha} · sigue revisando las demás`,
      duration: 3500,
    })
  }

  // ─── Guardar TODO en Biblioteca ───
  const saveAllToBiblioteca = () => {
    addLibraryItems(items.map(item => ({ ...item, id: generateId(), estado: 'aprobado' as const })))
    toast.success(`${items.length} ideas guardadas en tu Biblioteca`, {
      duration: 3500,
    })
  }

  // ─── Mover TODO al Calendario ───
  const sendAllToCalendario = () => {
    if (hasCalendarioContent) {
      setShowCalendarDialog(true)
    } else {
      confirmSendAllToCalendar('add')
    }
  }

  const confirmSendAllToCalendar = (action: 'replace' | 'add') => {
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
      toast.success('Plan añadido a tu Calendario', { duration: 3500 })
    }
    // Permanecemos en Planificar — la usuaria puede seguir revisando
  }

  // ─── Abrir ficha completa (genera guion bajo demanda) ───
  const openFicha = async (item: ContentItem) => {
    setOpenItem(item)
    setScriptModal(null)
    setModalOpen(true)

    // Si ya tiene guion, mostrarlo
    if (item.guion) {
      setScriptModal({ guion: item.guion, copy: item.copy, textoPortada: item.textoPortada })
      return
    }

    // Generar guion bajo demanda
    setGenerandoScript(true)
    setIsLoading(true, 'Generando guion completo...')
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
      if (!error && data?.result && !data.result.raw) {
        setScriptModal(data.result)
        // Actualizar el item en la lista para que no se regenere si se vuelve a abrir
        setItems(prev => prev.map(it => it.id === item.id ? {
          ...it,
          guion: data.result.guion || '',
          copy: data.result.copy || '',
          textoPortada: data.result.textoPortada || it.textoPortada,
        } : it))
      } else {
        toast.error('No se pudo generar el guion')
      }
    } catch (e) {
      console.error('Script error:', e)
      toast.error('Error al generar guion')
    } finally {
      setGenerandoScript(false)
      setIsLoading(false)
    }
  }

  // ─── Helpers ───
  const getTipoColor = (tipo: string) => tipo === 'carrusel' ? 'bg-[#E8D5B0] text-[#8BAF8D]' : 'bg-[#C8DEC9] text-[#2A2A28]'
  const getTipoIcon = (tipo: string) => tipo === 'carrusel' ? <LayoutGrid className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />
  const getTipoLabel = (tipo: string) => tipo === 'carrusel' ? 'Carrusel' : 'Reel'

  const formatDate = (fecha: string) => {
    if (!fecha) return ''
    try {
      return format(parseISO(fecha + 'T12:00:00'), 'd MMM', { locale: es })
    } catch {
      return fecha
    }
  }

  // ════════════════════════════════════════════════════════════
  // VISTA DE CONFIGURACIÓN
  // ════════════════════════════════════════════════════════════
  if (view === 'config') {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-5">
            <div className="brave-float inline-block mb-2">
              <BravyBot size={48} expression="excited" animate />
            </div>
            <h2 className="font-serif text-3xl font-light text-[#2A2A28]">Planificar contenido</h2>
            <p className="text-sm text-muted-foreground mt-1">
              En 5 pasos te doy las mejores ideas para tu salón
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
                      ? 'border-[#8BAF8D] bg-[#8BAF8D]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#8BAF8D]/30'
                  }`}
                >
                  <p className={`font-bold text-sm ${planTipo === opt.value ? 'text-[#8BAF8D]' : 'text-foreground'}`}>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FRECUENCIAS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFrecuencia(f.value)}
                  className={`relative p-2.5 rounded-2xl border-2 text-center transition-all ${
                    frecuencia === f.value
                      ? 'border-[#8BAF8D] bg-[#8BAF8D]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#8BAF8D]/30'
                  }`}
                >
                  {f.desc === 'Recomendado' && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#E8D5B0] text-[#8BAF8D] text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      TOP
                    </span>
                  )}
                  <p className={`font-bold text-lg ${frecuencia === f.value ? 'text-[#8BAF8D]' : 'text-foreground'}`}>
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
                      ? 'border-[#8BAF8D] bg-[#8BAF8D]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#8BAF8D]/30'
                  }`}
                >
                  <span className="text-xl">{o.emoji}</span>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${objetivo === o.value ? 'text-[#8BAF8D]' : 'text-foreground'}`}>
                      {o.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─── 4. Tipo de contenido ─── */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-foreground mb-2 block">
              4. ¿Qué tipo de contenido?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIPOS_CONTENIDO.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTipoContenido(t.value)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    tipoContenido === t.value
                      ? 'border-[#8BAF8D] bg-[#8BAF8D]/5 shadow-md'
                      : 'border-border bg-card hover:border-[#8BAF8D]/30'
                  }`}
                >
                  <p className={`font-bold text-xs ${tipoContenido === t.value ? 'text-[#8BAF8D]' : 'text-foreground'}`}>
                    {t.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── 5. Temáticas (máximo 3) ─── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">
                5. ¿De qué temáticas quieres hablar?
              </label>
              <span className={`text-xs font-medium ${tematicas.length === 3 ? 'text-[#8BAF8D]' : 'text-muted-foreground'}`}>
                {tematicas.length}/3
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Recomendado: elige máximo 3 temáticas para enfocar bien tu contenido
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1">
              {tematicasDisponibles.map(t => {
                const sel = tematicas.includes(t)
                const disabled = !sel && tematicas.length >= 3
                return (
                  <button
                    key={t}
                    onClick={() => toggleTematica(t)}
                    disabled={disabled}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      sel
                        ? 'brave-gradient text-white shadow-sm'
                        : disabled
                          ? 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
                          : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {sel && '✓ '}{t}
                  </button>
                )
              })}
            </div>
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
        </motion.div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // VISTA DE RESULTADO — botones visibles en cada ficha
  // ════════════════════════════════════════════════════════════
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-2xl font-light text-[#2A2A28]">
              Tu plan {planTipo === 'semanal' ? 'semanal' : 'mensual'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} ideas · toca cualquier idea para ver el guion completo
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Empezar de nuevo
          </button>
        </div>

        {/* ─── Lista de ideas con botones visibles ─── */}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              className="brave-glass rounded-2xl border border-border/50 p-3"
            >
              {/* Fila principal clicable */}
              <button
                onClick={() => openFicha(item)}
                className="w-full flex items-center gap-3 text-left mb-2"
              >
                {/* Tipo badge */}
                <span className={`shrink-0 ${getTipoColor(item.tipo)} rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1`}>
                  {getTipoIcon(item.tipo)}
                  {getTipoLabel(item.tipo)}
                </span>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {item.fecha && (
                      <span className="text-[10px] font-semibold text-[#8BAF8D] bg-[#E8D5B0]/60 px-2 py-0.5 rounded-full">
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
                  {item.descripcion && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.descripcion}</p>
                  )}
                </div>
              </button>

              {/* Botones visibles (siempre) */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-border/30">
                <button
                  onClick={() => regenerateItem(idx)}
                  disabled={regenerandoIdx === idx}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-medium border border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {regenerandoIdx === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Regenerar
                </button>
                <button
                  onClick={() => saveItemToBiblioteca(idx)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-medium border border-[#C8DEC9]/50 text-[#8BAF8D] hover:bg-[#C8DEC9]/10 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Guardar en biblioteca
                </button>
                <button
                  onClick={() => saveItemToCalendario(idx)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-medium border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Añadir en calendario
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── CTA final: guardar todo ─── */}
        <div className="mt-5 grid grid-cols-2 gap-2 sticky bottom-4 z-10">
          <button
            onClick={saveAllToBiblioteca}
            className="py-3.5 rounded-2xl bg-white border-2 border-[#C8DEC9] text-[#8BAF8D] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#C8DEC9]/10 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Guardar todo en biblioteca
          </button>
          <button
            onClick={sendAllToCalendario}
            className="py-3.5 rounded-2xl brave-gradient text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            Añadir todo al calendario
          </button>
        </div>

        {/* ─── Diálogo de confirmación: perder avance ─── */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowResetConfirm(false)}
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
                    ¿Volver a empezar?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tienes {items.length} ideas generadas. Si vuelves a la configuración, perderás este plan (a menos que ya lo hayas guardado en tu Biblioteca o Calendario).
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={confirmReset}
                    className="w-full p-3.5 rounded-2xl border-2 border-red-300 text-red-700 text-left hover:bg-red-50 transition-colors"
                  >
                    <p className="font-bold text-sm">Sí, volver a empezar</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pierdo las ideas no guardadas
                    </p>
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="w-full p-3.5 rounded-2xl border-2 border-[#C8DEC9] text-[#8BAF8D] text-left hover:bg-[#C8DEC9]/10 transition-colors"
                  >
                    <p className="font-bold text-sm">No, seguir aquí</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Continúo revisando mis ideas
                    </p>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    onClick={() => confirmSendAllToCalendar('replace')}
                    className="w-full p-3.5 rounded-2xl border-2 border-[#8BAF8D] text-left hover:bg-[#8BAF8D]/5 transition-colors"
                  >
                    <p className="font-bold text-sm text-[#8BAF8D]">Sustituir lo que ya tenía</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Borra el calendario actual y pone este plan
                    </p>
                  </button>
                  <button
                    onClick={() => confirmSendAllToCalendar('add')}
                    className="w-full p-3.5 rounded-2xl border-2 border-[#C8DEC9] text-left hover:bg-[#C8DEC9]/10 transition-colors"
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

        {/* ─── Modal de ficha completa con guion ─── */}
        {modalOpen && openItem && (
          <FichaCompletaModal
            item={openItem}
            script={scriptModal}
            isGenerating={generandoScript}
            onClose={() => { setModalOpen(false); setOpenItem(null); setScriptModal(null) }}
            onSaveToBiblioteca={() => {
              const idx = items.findIndex(it => it.id === openItem.id)
              if (idx >= 0) saveItemToBiblioteca(idx)
              setModalOpen(false)
              setOpenItem(null)
              setScriptModal(null)
            }}
            onSaveToCalendario={() => {
              const idx = items.findIndex(it => it.id === openItem.id)
              if (idx >= 0) saveItemToCalendario(idx)
              setModalOpen(false)
              setOpenItem(null)
              setScriptModal(null)
            }}
          />
        )}
      </motion.div>
    </div>
  )
}

// ─── Modal: ficha completa con guion ──────────────────────
function FichaCompletaModal({
  item, script, isGenerating, onClose, onSaveToBiblioteca, onSaveToCalendario,
}: {
  item: ContentItem
  script: any
  isGenerating: boolean
  onClose: () => void
  onSaveToBiblioteca: () => void
  onSaveToCalendario: () => void
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copy = (field: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copiado')
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-background rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
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

        <div className="p-5 space-y-4">
          {/* Info rápida */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-muted/50 px-3 py-1 rounded-full">
              <strong className="text-foreground">{item.servicio || 'General'}</strong>
            </span>
            <span className="bg-muted/50 px-3 py-1 rounded-full capitalize">{item.objetivo}</span>
            <span className="bg-muted/50 px-3 py-1 rounded-full">{item.tipo}</span>
          </div>

          {/* Descripción */}
          {item.descripcion && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-foreground leading-relaxed">{item.descripcion}</p>
            </div>
          )}

          {/* Generando guion */}
          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#8BAF8D] mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generando guion completo...</p>
            </div>
          )}

          {/* Guion completo */}
          {!isGenerating && script?.guion && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Guion completo</label>
                <button
                  onClick={() => copy('guion', script.guion)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {copiedField === 'guion' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'guion' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-sm text-foreground whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                {script.guion}
              </div>
            </div>
          )}

          {/* Copy + Hashtags */}
          {!isGenerating && script?.copy && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">Copy + Hashtags</label>
                <button
                  onClick={() => copy('copy', script.copy)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {copiedField === 'copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'copy' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-sm text-foreground whitespace-pre-line leading-relaxed">
                {script.copy}
              </div>
            </div>
          )}

          {/* Acciones */}
          {!isGenerating && script && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <button
                onClick={onSaveToBiblioteca}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border border-[#C8DEC9]/50 text-[#8BAF8D] hover:bg-[#C8DEC9]/10 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Guardar en biblioteca
              </button>
              <button
                onClick={onSaveToCalendario}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                Añadir en calendario
              </button>
            </div>
          )}

          {!isGenerating && !script && (
            <p className="text-xs text-center text-muted-foreground py-4">
              No se pudo generar el guion. Cierra e inténtalo de nuevo.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
