'use client'

import { useState } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BravyBot } from '@/components/brave/bravy-bot'
import {
  PenTool, Film, LayoutGrid, Sparkles,
  RefreshCw, Save, Copy, FileText,
  ArrowRight, Loader2, ChevronDown, ChevronUp, Check, Calendar,
} from 'lucide-react'
import { fetchJSON } from '@/lib/fetch-safe'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// ============================================================
// CREAR — Versión simplificada
// - Solo Reels y Carruseles (Stories tiene su propia sección)
// - Objetivos: Autoridad, Venta, Viralidad
// - Formatos: hablando a cámara / voz en off
// - Reels: 10 ideas, tarjetas clicables, al desplegar muestra:
//   generar guion / guardar / agendar
// - Carruseles: estructura gancho/contexto/solución/CTA
//   cada slide corto, copiar individual o todo
// - Copy + Hashtags siempre juntos en un bloque
// - Guiones separados por párrafos: GANCHO / CONTEXTO / SOLUCIÓN / CTA
// ============================================================

const OBJETIVOS = [
  { value: 'autoridad', label: 'Autoridad', desc: 'Educar y posicionarte como experta' },
  { value: 'venta', label: 'Venta', desc: 'Conseguir reservas y citas' },
  { value: 'viralidad', label: 'Viralidad', desc: 'Llegar a más personas' },
]

const FORMATOS = [
  { value: 'hablando a cámara', label: 'Hablando a cámara' },
  { value: 'voz en off', label: 'Voz en off' },
]

type CrearSubModule = 'reels' | 'carruseles'

export function Crear() {
  const { brandProfile, addLibraryItems, setActiveModule, setIsLoading, isLoading, setBrandProfile, scheduleContentItem } = useAppStore()
  const [subModule, setSubModule] = useState<CrearSubModule>('reels')

  // Reels state
  const [reelServicio, setReelServicio] = useState('')
  const [reelObjetivo, setReelObjetivo] = useState('')
  const [reelFormato, setReelFormato] = useState('')
  const [reelIdeas, setReelIdeas] = useState<any[]>([])
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null)
  const [ideaScripts, setIdeaScripts] = useState<Record<number, any>>({})
  const [generatingScriptFor, setGeneratingScriptFor] = useState<number | null>(null)
  const [showScheduleFor, setShowScheduleFor] = useState<number | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')

  // Carousel state
  const [carouselServicio, setCarouselServicio] = useState('')
  const [carouselObjetivo, setCarouselObjetivo] = useState('')
  const [carouselSlides, setCarouselSlides] = useState(5)
  const [carouselResult, setCarouselResult] = useState<any>(null)

  const servicios = brandProfile?.serviciosPrioritarios?.length
    ? brandProfile.serviciosPrioritarios
    : brandProfile?.servicios?.length
      ? brandProfile.servicios
      : ['Balayage', 'Mechas', 'Tinte', 'Corte', 'Peinado', 'Alisado', 'Permanente', 'Tratamientos', 'Keratina', 'Extensiones', 'Canas', 'Decoloración', 'Reflejos', 'Matizadores', 'Cepillado', 'Recogidos']

  if (!brandProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-light text-[#2A2A28]">Crear</h2>
          <p className="text-sm text-muted-foreground">Genera contenido para tu Instagram</p>
        </div>
        <Card className="border-l-4 border-l-[#E8D5B0] bg-[#EEF4EE] shadow-md brave-glass rounded-3xl">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F2ECE3] shrink-0">
              <PenTool className="w-6 h-6 text-[#C8DEC9]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Personaliza tu contenido</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Completa tu Marca para que las ideas sean mucho más personalizadas para tu salón.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setActiveModule('marca')} size="sm" className="bg-[#8BAF8D] hover:bg-[#759E77] text-white rounded-2xl">
                  Crear Mi Marca
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  onClick={() => {
                    setBrandProfile({
                      nombre: '', salon: '', ciudad: '', instagram: '',
                      experiencia: '', servicios: [], serviciosPrioritarios: [],
                      objetivos: '', clientaIdeal: '', preguntasFrecuentes: '',
                      erroresFrecuentes: '', nivelCamara: '', facturacion: '',
                    })
                  }}
                  variant="outline"
                  size="sm"
                  className="border-[#C8DEC9] text-[#C8DEC9] hover:bg-[#F2ECE3] rounded-2xl"
                >
                  Continuar sin marca
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // REELS — Generar 10 ideas
  // ════════════════════════════════════════════════════════════
  const generateReelIdeas = async () => {
    if (!reelServicio || !reelObjetivo) return
    setIsLoading(true, 'Generando 10 ideas de Reel...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'reel-ideas',
          brandProfile,
          context: { servicio: reelServicio, objetivo: reelObjetivo, formato: reelFormato },
        }),
      })
      if (!error && Array.isArray(data?.result)) {
        setReelIdeas(data.result)
        setIdeaScripts({})
        setExpandedIdea(null)
      } else {
        setReelIdeas(generateFallbackReelIdeas())
      }
    } catch {
      setReelIdeas(generateFallbackReelIdeas())
    } finally {
      setIsLoading(false)
    }
  }

  const generateFallbackReelIdeas = () => {
    const ideas = [
      `3 errores que arruinan tu ${reelServicio.toLowerCase()}`,
      `Por qué tu ${reelServicio.toLowerCase()} no dura`,
      `El secreto que nadie te cuenta sobre ${reelServicio.toLowerCase()}`,
      `Antes y después: transformación completa de ${reelServicio.toLowerCase()}`,
      `Lo que tu estilista debería decirte sobre ${reelServicio.toLowerCase()}`,
      `Respondo lo que más me preguntan sobre ${reelServicio.toLowerCase()}`,
      `Tutorial rápido: cómo mantener tu ${reelServicio.toLowerCase()}`,
      `Mi clienta no creía el resultado - ${reelServicio.toLowerCase()}`,
      `5 señales de que necesitas un buen ${reelServicio.toLowerCase()}`,
      `Esto es lo que pasa cuando haces ${reelServicio.toLowerCase()} con una experta`,
    ]
    return ideas.map((titulo) => ({
      titulo,
      objetivo: reelObjetivo,
      servicio: reelServicio,
      formato: reelFormato || 'hablando a cámara',
    }))
  }

  // ════════════════════════════════════════════════════════════
  // Generar guion para una idea específica
  // ════════════════════════════════════════════════════════════
  const generateScript = async (idea: any, idx: number) => {
    setGeneratingScriptFor(idx)
    setIsLoading(true, 'Creando guion completo...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'script',
          brandProfile,
          context: {
            titulo: idea.titulo,
            tipo: 'reel',
            objetivo: idea.objetivo || reelObjetivo,
            servicio: idea.servicio || reelServicio,
            formato: idea.formato || reelFormato,
          },
        }),
      })
      if (!error && data?.result && !data.result.raw) {
        setIdeaScripts(prev => ({ ...prev, [idx]: data.result }))
      } else {
        setIdeaScripts(prev => ({ ...prev, [idx]: generateFallbackScript(idea) }))
      }
    } catch {
      setIdeaScripts(prev => ({ ...prev, [idx]: generateFallbackScript(idea) }))
    } finally {
      setGeneratingScriptFor(null)
      setIsLoading(false)
    }
  }

  const generateFallbackScript = (idea: any) => ({
    guion: `GANCHO\n"${idea.titulo}" — ¿Sabías que esto pasa más de lo que crees?\n\nCONTEXTO\nMuchas clientas vienen a mi salón después de haber tenido malas experiencias con ${idea.servicio || reelServicio}. Y no es su culpa, es que nadie les explicó cómo cuidar su pelo correctamente.\n\nSOLUCIÓN\nPor eso en ${brandProfile?.salon || 'mi salón'} siempre hacemos una consulta personalizada antes de empezar. Así nos aseguramos de que el resultado sea exactamente lo que buscas.\n\nLLAMADA A LA ACCIÓN\nSi estás pensando en cambiar tu look, escríbeme por DM y te asesoro sin compromiso.`,
    copy: `${idea.titulo}\n\n¿Lista para un cambio? Reserva tu cita en ${brandProfile?.salon || 'mi salón'} 💇‍♀️\n\n📍 ${brandProfile?.ciudad || ''}\n\n${['#' + (brandProfile?.salon || 'salon').replace(/\s/g, ''), '#' + (idea.servicio || reelServicio).replace(/\s/g, ''), '#peluqueria', '#cabellosano', '#estilista'].join(' ')}`,
    textoPortada: idea.titulo,
  })

  // ════════════════════════════════════════════════════════════
  // Guardar idea en biblioteca (con o sin guion)
  // ════════════════════════════════════════════════════════════
  const saveIdeaToLibrary = (idea: any, idx: number) => {
    const script = ideaScripts[idx]
    const item: ContentItem = {
      id: generateId(),
      tipo: 'reel',
      titulo: idea.titulo,
      objetivo: idea.objetivo || reelObjetivo,
      servicio: idea.servicio || reelServicio,
      guion: script?.guion || '',
      copy: script?.copy || '',
      hashtags: '', // viene integrado en copy
      textoPortada: script?.textoPortada || idea.titulo,
      formato: idea.formato || reelFormato,
      estado: 'borrador',
      fecha: '',
      slides: [],
      storiesData: [],
      planId: '',
      createdAt: new Date().toISOString(),
    }
    addLibraryItems([item])
    toast.success('Guardado en tu Biblioteca')
  }

  // ════════════════════════════════════════════════════════════
  // Agendar idea al calendario
  // ════════════════════════════════════════════════════════════
  const scheduleIdea = (idea: any, idx: number, fecha: string) => {
    if (!fecha) {
      toast.error('Elige una fecha primero')
      return
    }
    const script = ideaScripts[idx]
    const item: ContentItem = {
      id: generateId(),
      tipo: 'reel',
      titulo: idea.titulo,
      objetivo: idea.objetivo || reelObjetivo,
      servicio: idea.servicio || reelServicio,
      guion: script?.guion || '',
      copy: script?.copy || '',
      hashtags: '',
      textoPortada: script?.textoPortada || idea.titulo,
      formato: idea.formato || reelFormato,
      estado: 'programado',
      fecha,
      slides: [],
      storiesData: [],
      planId: '',
      createdAt: new Date().toISOString(),
    }
    addLibraryItems([item])
    toast.success(`Agendado para el ${fecha}`)
    setShowScheduleFor(null)
    setScheduleDate('')
  }

  // ════════════════════════════════════════════════════════════
  // CARRUSEL — estructura gancho/contexto/solución/CTA
  // ════════════════════════════════════════════════════════════
  const generateCarousel = async () => {
    if (!carouselServicio) return
    setIsLoading(true, 'Generando Carrusel...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'carousel',
          brandProfile,
          context: { servicio: carouselServicio, objetivo: carouselObjetivo || 'autoridad', numSlides: carouselSlides },
        }),
      })
      if (data?.result?.slides) {
        setCarouselResult(data.result)
      } else {
        setCarouselResult(generateFallbackCarousel())
      }
    } catch {
      setCarouselResult(generateFallbackCarousel())
    } finally {
      setIsLoading(false)
    }
  }

  const generateFallbackCarousel = () => {
    const slides = [
      { numero: 1, texto: `${carouselServicio}: lo que nadie te explica`, tipo: 'gancho' },
      { numero: 2, texto: `El problema: muchas clientas llegan con dudas y miedos porque nadie les explicó bien el proceso.`, tipo: 'contexto' },
      { numero: 3, texto: `La solución: consulta personalizada + productos adecuados + mantenimiento correcto.`, tipo: 'solución' },
      { numero: 4, texto: `Cuida tu ${carouselServicio.toLowerCase()} con estos 3 hábitos simples.`, tipo: 'solución' },
      { numero: 5, texto: `¿Lista para un ${carouselServicio.toLowerCase()} que te encante? Escríbeme por DM 💬`, tipo: 'cta' },
    ]
    return {
      slides: slides.slice(0, carouselSlides),
      copy: `Todo lo que necesitas saber sobre ${carouselServicio} 💇‍♀️ Desliza → ${['#' + (carouselServicio || '').replace(/\s/g, ''), '#peluqueria', '#consejosdecabello'].join(' ')}`,
    }
  }

  const copyToClipboard = (text: string, msg = 'Copiado') => {
    navigator.clipboard.writeText(text)
    toast.success(msg)
  }

  const saveCarouselToLibrary = () => {
    addLibraryItems([{
      id: generateId(),
      tipo: 'carrusel',
      titulo: `Carrusel: ${carouselServicio}`,
      objetivo: carouselObjetivo,
      servicio: carouselServicio,
      guion: '',
      copy: carouselResult.copy || '',
      hashtags: '',
      textoPortada: '',
      formato: '',
      estado: 'borrador',
      fecha: '',
      slides: carouselResult.slides,
      storiesData: [],
      planId: '',
      createdAt: new Date().toISOString(),
    }])
    toast.success('Carrusel guardado en tu Biblioteca')
  }

  // ─── Render ───
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="font-serif text-3xl font-light text-[#2A2A28]">Crear</h2>
        <p className="text-sm text-muted-foreground">Genera contenido para tu Instagram</p>
        <BravyBot size={36} expression="happy" animate />
      </div>

      {/* Sub-module tabs */}
      <div className="flex gap-2 justify-center">
        {([
          { key: 'reels' as CrearSubModule, label: 'Reels', icon: <Film className="w-4 h-4" /> },
          { key: 'carruseles' as CrearSubModule, label: 'Carruseles', icon: <LayoutGrid className="w-4 h-4" /> },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubModule(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-sm transition-all ${
              subModule === tab.key
                ? 'brave-gradient text-white shadow-md'
                : 'bg-white border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════ REELS ════════ */}
      {subModule === 'reels' && (
        <>
          {/* Config */}
          <Card className="brave-glass rounded-2xl border-none shadow-md">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Servicio</label>
                <div className="flex flex-wrap gap-2">
                  {servicios.map(s => (
                    <button
                      key={s}
                      onClick={() => setReelServicio(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        reelServicio === s ? 'brave-gradient text-white shadow-sm' : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Objetivo</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {OBJETIVOS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setReelObjetivo(o.value)}
                      className={`p-3 rounded-xl text-center border-2 transition-all ${
                        reelObjetivo === o.value ? 'border-[#8BAF8D] bg-[#8BAF8D]/5' : 'border-border bg-white hover:border-[#8BAF8D]/30'
                      }`}
                    >
                      <p className={`text-sm font-bold ${reelObjetivo === o.value ? 'text-[#8BAF8D]' : 'text-foreground'}`}>{o.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Formato</label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMATOS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setReelFormato(f.value)}
                      className={`p-3 rounded-xl text-center border-2 transition-all ${
                        reelFormato === f.value ? 'border-[#C9A96E] bg-[#E8D5B0]/20' : 'border-border bg-white hover:border-[#C9A96E]/50'
                      }`}
                    >
                      <p className="text-sm font-semibold">{f.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={generateReelIdeas}
            disabled={isLoading || !reelServicio || !reelObjetivo}
            className="w-full h-12 rounded-2xl brave-gradient text-white font-semibold text-sm gap-2 shadow-lg"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? 'Generando...' : 'Generar 10 ideas'}
          </Button>

          {/* Lista de ideas */}
          {reelIdeas.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Toca cualquier idea para ver opciones (generar guion, guardar, agendar)
              </p>
              {reelIdeas.map((idea, idx) => {
                const isExpanded = expandedIdea === idx
                const script = ideaScripts[idx]
                const isGenerating = generatingScriptFor === idx
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="brave-glass rounded-2xl overflow-hidden"
                  >
                    {/* Header clicable */}
                    <button
                      onClick={() => setExpandedIdea(isExpanded ? null : idx)}
                      className="w-full p-4 text-left flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#C8DEC9] text-[#2A2A28] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug">{idea.titulo}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full capitalize">{idea.objetivo || reelObjetivo}</span>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{idea.formato || reelFormato || 'hablando a cámara'}</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                    </button>

                    {/* Contenido expandido */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
                            {/* Si no hay guion → botón generar */}
                            {!script ? (
                              <Button
                                onClick={() => generateScript(idea, idx)}
                                disabled={isGenerating}
                                className="w-full h-10 rounded-xl brave-gradient text-white text-sm gap-2"
                              >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {isGenerating ? 'Generando guion...' : 'Generar guion completo'}
                              </Button>
                            ) : (
                              <>
                                {/* Guion con párrafos separados */}
                                {script.guion && (
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-xs font-bold text-foreground uppercase tracking-wide">Guion</label>
                                      <button
                                        onClick={() => copyToClipboard(script.guion, 'Guion copiado')}
                                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                      >
                                        <Copy className="w-3 h-3" /> Copiar
                                      </button>
                                    </div>
                                    <div className="bg-muted/40 rounded-xl p-3 text-sm text-foreground whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                                      {script.guion}
                                    </div>
                                  </div>
                                )}

                                {/* Copy + Hashtags en un solo bloque */}
                                {script.copy && (
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-xs font-bold text-foreground uppercase tracking-wide">Copy + Hashtags</label>
                                      <button
                                        onClick={() => copyToClipboard(script.copy, 'Copy copiado')}
                                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                      >
                                        <Copy className="w-3 h-3" /> Copiar
                                      </button>
                                    </div>
                                    <div className="bg-muted/40 rounded-xl p-3 text-sm text-foreground whitespace-pre-line leading-relaxed">
                                      {script.copy}
                                    </div>
                                  </div>
                                )}

                                {/* Acciones */}
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => saveIdeaToLibrary(idea, idx)}
                                    variant="outline"
                                    className="flex-1 h-10 rounded-xl text-xs gap-1.5"
                                  >
                                    <Save className="w-3.5 h-3.5" /> Guardar
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setShowScheduleFor(showScheduleFor === idx ? null : idx)
                                      setScheduleDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0])
                                    }}
                                    variant="outline"
                                    className="flex-1 h-10 rounded-xl text-xs gap-1.5"
                                  >
                                    <Calendar className="w-3.5 h-3.5" /> Agendar
                                  </Button>
                                </div>

                                {/* Inline date picker */}
                                {showScheduleFor === idx && (
                                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                                    <label className="text-xs font-semibold text-foreground">¿Para qué fecha?</label>
                                    <input
                                      type="date"
                                      value={scheduleDate}
                                      onChange={(e) => setScheduleDate(e.target.value)}
                                      min={new Date().toISOString().split('T')[0]}
                                      className="w-full h-9 px-3 rounded-lg border border-emerald-300 bg-white text-sm"
                                    />
                                    <Button
                                      onClick={() => scheduleIdea(idea, idx, scheduleDate)}
                                      className="w-full h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1.5"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Confirmar
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Siempre se puede guardar la idea sola */}
                            {!script && (
                              <Button
                                onClick={() => saveIdeaToLibrary(idea, idx)}
                                variant="outline"
                                className="w-full h-10 rounded-xl text-xs gap-1.5"
                              >
                                <Save className="w-3.5 h-3.5" /> Guardar solo la idea (sin guion)
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ════════ CARRUSELES ════════ */}
      {subModule === 'carruseles' && (
        <>
          <Card className="brave-glass rounded-2xl border-none shadow-md">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Servicio</label>
                <div className="flex flex-wrap gap-2">
                  {servicios.map(s => (
                    <button
                      key={s}
                      onClick={() => setCarouselServicio(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        carouselServicio === s ? 'brave-gradient text-white shadow-sm' : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Objetivo</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {OBJETIVOS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setCarouselObjetivo(o.value)}
                      className={`p-3 rounded-xl text-center border-2 transition-all ${
                        carouselObjetivo === o.value ? 'border-[#8BAF8D] bg-[#8BAF8D]/5' : 'border-border bg-white hover:border-[#8BAF8D]/30'
                      }`}
                    >
                      <p className={`text-sm font-bold ${carouselObjetivo === o.value ? 'text-[#8BAF8D]' : 'text-foreground'}`}>{o.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Número de slides</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[3, 4, 5, 6, 7].map(n => (
                    <button
                      key={n}
                      onClick={() => setCarouselSlides(n)}
                      className={`p-2.5 rounded-xl text-center font-bold text-sm transition-all ${
                        carouselSlides === n ? 'bg-[#E8D5B0] text-[#8BAF8D] shadow-sm' : 'bg-white border border-border text-foreground hover:border-[#C9A96E]/50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={generateCarousel}
            disabled={isLoading || !carouselServicio}
            className="w-full h-12 rounded-2xl brave-gradient text-white font-semibold text-sm gap-2 shadow-lg"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? 'Generando...' : 'Generar Carrusel'}
          </Button>

          {/* Resultado carrusel */}
          {carouselResult && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Estructura: gancho → contexto → solución → llamada a la acción. Cada slide tiene su botón de copiar.
              </p>

              {carouselResult.slides.map((slide: any, idx: number) => (
                <div
                  key={idx}
                  className="brave-glass rounded-2xl p-4 flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#E8D5B0] flex items-center justify-center text-[#8BAF8D] font-bold text-sm shrink-0">
                    {slide.numero}
                  </div>
                  <div className="flex-1 min-w-0">
                    {slide.tipo && (
                      <span className="inline-block text-[10px] bg-muted px-2 py-0.5 rounded-full capitalize mb-1">
                        {slide.tipo}
                      </span>
                    )}
                    <p className="text-sm text-foreground leading-snug">{slide.texto}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(slide.texto, `Slide ${slide.numero} copiado`)}
                    className="text-muted-foreground hover:text-foreground p-1.5 shrink-0"
                    aria-label="Copiar slide"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Copy + Hashtags en un bloque */}
              {carouselResult.copy && (
                <div className="brave-glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wide">Copy + Hashtags</label>
                    <button
                      onClick={() => copyToClipboard(carouselResult.copy, 'Copy copiado')}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-line">{carouselResult.copy}</p>
                </div>
              )}

              {/* Acciones finales */}
              <div className="grid grid-cols-2 gap-2 sticky bottom-4">
                <Button
                  onClick={() => copyToClipboard(
                    carouselResult.slides.map((s: any) => `Slide ${s.numero}: ${s.texto}`).join('\n\n') +
                    '\n\n' + (carouselResult.copy || ''),
                    'Todo copiado'
                  )}
                  variant="outline"
                  className="h-11 rounded-xl text-xs gap-2"
                >
                  <Copy className="w-4 h-4" /> Copiar todo
                </Button>
                <Button
                  onClick={saveCarouselToLibrary}
                  className="h-11 rounded-xl brave-gradient text-white text-xs gap-2"
                >
                  <Save className="w-4 h-4" /> Guardar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
