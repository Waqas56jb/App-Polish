'use client'

import { useState } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { BravyBot } from '@/components/brave/bravy-bot'
import {
  PenTool, Film, LayoutGrid, BookOpen, Sparkles,
  RefreshCw, Save, Copy, FileText, CheckCircle2,
  ArrowRight, MessageSquare
} from 'lucide-react'
import { fetchJSON } from '@/lib/fetch-safe'

const OBJETIVOS_REEL = [
  { value: 'autoridad', label: 'Autoridad' },
  { value: 'educación', label: 'Educación' },
  { value: 'venta', label: 'Venta' },
  { value: 'deseo', label: 'Deseo' },
  { value: 'objeción', label: 'Objeción' },
  { value: 'caso de éxito', label: 'Caso de éxito' },
]

const FORMATOS = [
  { value: 'hablando a cámara', label: 'Hablando a cámara' },
  { value: 'voz en off', label: 'Voz en off' },
  { value: 'antes y después', label: 'Antes y después' },
]

type CrearSubModule = 'reels' | 'stories' | 'carruseles'

export function Crear() {
  const { brandProfile, addLibraryItems, setActiveModule, setIsLoading, isLoading, setBrandProfile } = useAppStore()
  const [subModule, setSubModule] = useState<CrearSubModule>('reels')

  // Reels state
  const [reelServicio, setReelServicio] = useState('')
  const [reelObjetivo, setReelObjetivo] = useState('')
  const [reelFormato, setReelFormato] = useState('')
  const [reelIdeas, setReelIdeas] = useState<any[]>([])
  const [selectedIdeas, setSelectedIdeas] = useState<Set<number>>(new Set())
  const [showReelScript, setShowReelScript] = useState(false)
  const [currentScript, setCurrentScript] = useState<any>(null)

  // Stories state
  const [storyServicio, setStoryServicio] = useState('')
  const [storyObjetivo, setStoryObjetivo] = useState('')
  const [storyResult, setStoryResult] = useState<any>(null)

  // Carousel state
  const [carouselServicio, setCarouselServicio] = useState('')
  const [carouselObjetivo, setCarouselObjetivo] = useState('')
  const [carouselSlides, setCarouselSlides] = useState(3)
  const [carouselResult, setCarouselResult] = useState<any>(null)

  const servicios = brandProfile?.serviciosPrioritarios?.length
    ? brandProfile.serviciosPrioritarios
    : brandProfile?.servicios?.length
      ? brandProfile.servicios
      : ['Balayage', 'Mechas', 'Tinte', 'Corte', 'Peinado', 'Alisado', 'Permanente', 'Tratamientos', 'Keratina', 'Extensiones', 'Canas', 'Decoloración', 'Reflejos', 'Matizadores', 'Cepillado', 'Recogidos']

  if (!brandProfile) {
    // Show banner encouraging completion, but allow continuing
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-3xl font-bold text-[#2A1520]">Crear</h2>
          <p className="text-muted-foreground text-base">Genera contenidos individuales para tu Instagram</p>
        </div>

        <Card className="border-l-4 border-l-[#FFF1B5] bg-[#FFFBF0] shadow-md brave-glass brave-card-hover brave-glow rounded-3xl">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F5F0EB] shrink-0">
              <PenTool className="w-6 h-6 text-[#C1DBE8]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#2A1520] mb-1">Personaliza tu contenido</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Aunque puedes crear contenido sin tu Marca BRÄVE, completarla hará que las ideas sean mucho más personalizadas para tu salón.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setActiveModule('marca')} size="sm" className="bg-[#591427] hover:bg-[#7A2A40] text-white rounded-2xl">
                  Crear Mi Marca BRÄVE
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
                  className="border-[#C1DBE8] text-[#C1DBE8] hover:bg-[#F5F0EB] rounded-2xl"
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

  // REELS
  const generateReelIdeas = async () => {
    if (!reelServicio || !reelObjetivo) return
    setIsLoading(true, 'Generando ideas de Reel...')
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
    return ideas.map((titulo, i) => ({
      titulo,
      objetivo: reelObjetivo,
      servicio: reelServicio,
      formato: reelFormato || 'hablando a cámara',
    }))
  }

  const generateScript = async (idea: any) => {
    setIsLoading(true, 'Creando guión...')
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
        setCurrentScript(data.result)
      } else {
        setCurrentScript(generateFallbackScript(idea))
      }
    } catch {
      setCurrentScript(generateFallbackScript(idea))
    } finally {
      setIsLoading(false)
      setShowReelScript(true)
    }
  }

  const generateFallbackScript = (idea: any) => ({
    guion: `GANCHO: "${idea.titulo}" — ¿Sabías que esto pasa más de lo que crees?\n\nCONTEXTO: Muchas clientas vienen a mi salón después de haber tenido malas experiencias con ${idea.servicio || reelServicio}. Y no es su culpa, es que nadie les explicó cómo cuidar su pelo correctamente.\n\nSOLUCIÓN: Por eso en ${brandProfile?.salon || 'mi salón'} siempre hacemos una consulta personalizada antes de empezar. Así nos aseguramos de que el resultado sea exactamente lo que buscas.\n\nCTA: Si estás pensando en cambiar tu look, escríbeme por DM y te asesoro sin compromiso.`,
    copy: `${idea.titulo}\n\n¿Lista para un cambio? Reserva tu cita en ${brandProfile?.salon || 'mi salón'} 💇‍♀️\n\n📍 ${brandProfile?.ciudad || ''}`,
    hashtags: `#${(brandProfile?.salon || 'salon').replace(/\s/g, '')} #${(idea.servicio || reelServicio).replace(/\s/g, '')} #peluqueria #cabellosano #estilista`,
    textoPortada: idea.titulo,
  })

  // STORIES
  const generateStories = async () => {
    if (!storyServicio) return
    setIsLoading(true, 'Generando Stories...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'stories',
          brandProfile,
          context: { servicio: storyServicio, objetivo: storyObjetivo || 'reservas' },
        }),
      })
      if (data?.result?.stories) {
        setStoryResult(data.result)
      } else {
        setStoryResult(generateFallbackStories())
      }
    } catch {
      setStoryResult(generateFallbackStories())
    } finally {
      setIsLoading(false)
    }
  }

  const generateFallbackStories = () => ({
    stories: [
      {
        numero: 1,
        texto: `¿Alguna vez has tenido un desastre con tu ${storyServicio.toLowerCase()}? 😱`,
        sticker: 'Encuesta: SÍ / NO',
        ideaVisual: 'Foto tuya con expresión de sorpresa',
      },
      {
        numero: 2,
        texto: `El problema número 1 que veo: las clientas no cuidan su ${storyServicio.toLowerCase()} después de hacerlo. Te cuento mi secreto para que dure más...`,
        sticker: 'Caja de texto con consejo',
        ideaVisual: 'Video corto mostrando el proceso',
      },
      {
        numero: 3,
        texto: `¿Quieres un ${storyServicio.toLowerCase()} que realmente te favorezca? Escríbeme y te asesoro 💬`,
        sticker: 'Sticker "Reservar"',
        ideaVisual: 'Antes y después con tu logo',
      },
    ],
  })

  // CAROUSEL
  const generateCarousel = async () => {
    if (!carouselServicio) return
    setIsLoading(true, 'Generando Carrusel...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'carousel',
          brandProfile,
          context: { servicio: carouselServicio, objetivo: carouselObjetivo || 'educación', numSlides: carouselSlides },
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
    const slides = []
    for (let i = 1; i <= carouselSlides; i++) {
      if (i === 1) {
        slides.push({ numero: i, texto: `${carouselSlides} cosas que debes saber sobre ${carouselServicio}` })
      } else if (i === carouselSlides) {
        slides.push({ numero: i, texto: `¿Lista para probar? Reserva tu cita en ${brandProfile?.salon || 'mi salón'} 💬` })
      } else {
        const tips = [
          `Consejo #${i - 1}: Siempre consulta con una profesional antes de hacer un ${carouselServicio.toLowerCase()}`,
          `Consejo #${i - 1}: El mantenimiento es tan importante como el servicio本身`,
          `Consejo #${i - 1}: Usa productos específicos para ${carouselServicio.toLowerCase()}`,
        ]
        slides.push({ numero: i, texto: tips[(i - 2) % tips.length] })
      }
    }
    return {
      slides,
      copy: `Todo lo que necesitas saber sobre ${carouselServicio} 💇‍♀️ Desliza para ver los consejos →`,
      hashtags: `#${(carouselServicio || '').replace(/\s/g, '')} #peluqueria #consejosdecabello #estilista`,
      cta: '¿Lista para un cambio? Escríbeme por DM',
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const saveToLibrary = (item: ContentItem) => {
    addLibraryItems([item])
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold text-[#2A1520]">Crear</h2>
        <p className="text-muted-foreground text-base">Genera contenidos individuales para tu Instagram</p>
        <BravyBot />
      </div>

      {/* Sub-module tabs */}
      <div className="flex gap-2 justify-center mb-6">
        {([
          { key: 'reels' as CrearSubModule, label: 'Reels', icon: <Film className="w-4 h-4" /> },
          { key: 'stories' as CrearSubModule, label: 'Stories', icon: <MessageSquare className="w-4 h-4" /> },
          { key: 'carruseles' as CrearSubModule, label: 'Carruseles', icon: <LayoutGrid className="w-4 h-4" /> },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubModule(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              subModule === tab.key
                ? 'bg-[#C1DBE8] text-[#2A1520] shadow-md'
                : 'bg-white/60 border border-[#E8DDD5] text-[#2A1520] hover:border-[#C1DBE8] hover:bg-[#C1DBE8]/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* REELS SUBMODULE */}
      {subModule === 'reels' && !showReelScript && (
        <>
          <Card className="border-none shadow-md brave-glass brave-card-hover brave-glow rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2A1520] flex items-center gap-2">
                <Film className="w-5 h-5 text-[#C1DBE8]" />
                Crear Reel
              </CardTitle>
              <CardDescription>Configura tu Reel y genera ideas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2A1520]">Servicio</label>
                <div className="flex flex-wrap gap-2">
                  {servicios.map((s) => (
                    <button
                      key={s}
                      onClick={() => setReelServicio(s)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        reelServicio === s
                          ? 'bg-[#591427] text-white shadow-md'
                          : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2A1520]">Objetivo</label>
                <div className="flex flex-wrap gap-2">
                  {OBJETIVOS_REEL.map((obj) => (
                    <button
                      key={obj.value}
                      onClick={() => setReelObjetivo(obj.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        reelObjetivo === obj.value
                          ? 'bg-[#C1DBE8] text-[#2A1520] shadow-md'
                          : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                      }`}
                    >
                      {obj.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2A1520]">Formato</label>
                <div className="flex flex-wrap gap-2">
                  {FORMATOS.map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => setReelFormato(fmt.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        reelFormato === fmt.value
                          ? 'bg-[#FFF1B5] text-[#2A1520] shadow-md'
                          : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={generateReelIdeas}
              disabled={isLoading || !reelServicio || !reelObjetivo}
              className="px-8 py-6 text-base font-bold rounded-2xl shadow-lg bg-gradient-to-r from-[#591427] to-[#C1DBE8] hover:from-[#7A2A40] hover:to-[#8BB8D0] text-white disabled:opacity-50"
            >
              {isLoading ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Generando ideas...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" />GENERAR IDEAS</>
              )}
            </Button>
          </div>

          {/* Ideas list */}
          {reelIdeas.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="text-lg font-bold text-[#2A1520]">10 Ideas de Reel</h3>
              {reelIdeas.map((idea, idx) => (
                <Card key={idx} className={`brave-glass brave-card-hover brave-glow border-none shadow-md rounded-3xl ${selectedIdeas.has(idx) ? 'ring-2 ring-[#591427]' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => {
                            const next = new Set(selectedIdeas)
                            if (next.has(idx)) next.delete(idx)
                            else next.add(idx)
                            setSelectedIdeas(next)
                          }}
                          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedIdeas.has(idx) ? 'bg-[#591427] border-[#591427]' : 'border-[#E8DDD5]'
                          }`}
                        >
                          {selectedIdeas.has(idx) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                        <div>
                          <p className="font-medium text-[#2A1520]">{idea.titulo}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="bg-[#F5F0EB] text-[#2A1520] text-xs">{idea.objetivo}</Badge>
                            <Badge variant="secondary" className="bg-[#F5F0EB] text-[#2A1520] text-xs">{idea.formato}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReelIdeas([])
                            generateScript(idea)
                          }}
                          className="text-[#C1DBE8] hover:text-[#591427] hover:bg-[#F5F0EB]"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedIdeas.size > 0 && (
                <div className="flex gap-3 justify-center pt-2">
                  <Button
                    onClick={() => {
                      const items = Array.from(selectedIdeas).map(idx => ({
                        id: generateId(),
                        tipo: 'reel' as const,
                        titulo: reelIdeas[idx].titulo,
                        objetivo: reelIdeas[idx].objetivo || reelObjetivo,
                        servicio: reelIdeas[idx].servicio || reelServicio,
                        guion: '',
                        copy: '',
                        hashtags: '',
                        textoPortada: '',
                        formato: reelIdeas[idx].formato || reelFormato,
                        estado: 'borrador' as const,
                        fecha: '',
                        slides: [],
                        storiesData: [],
                        planId: '',
                        createdAt: new Date().toISOString(),
                      }))
                      addLibraryItems(items)
                      setSelectedIdeas(new Set())
                    }}
                    className="bg-[#591427] hover:bg-[#7A2A40] text-white rounded-2xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar {selectedIdeas.size} ideas
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* REEL SCRIPT */}
      {subModule === 'reels' && showReelScript && currentScript && (
        <Card className="border-none shadow-md border-l-4 border-l-[#591427] brave-glass brave-card-hover brave-glow rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg text-[#2A1520] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C1DBE8]" />
              Guión del Reel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#591427]">GUIÓN</label>
              <div className="bg-[#FFFBF0] p-4 rounded-xl whitespace-pre-line text-sm text-[#2A1520]">
                {currentScript.guion}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#591427]">COPY (Descripción)</label>
              <div className="bg-[#FFFBF0] p-4 rounded-xl text-sm text-[#2A1520]">
                {currentScript.copy}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#591427]">HASHTAGS</label>
              <div className="bg-[#FFFBF0] p-4 rounded-xl text-sm text-[#C1DBE8]">
                {currentScript.hashtags}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#591427]">TEXTO PORTADA</label>
              <div className="bg-[#FFFBF0] p-4 rounded-xl text-sm text-[#2A1520] font-medium">
                {currentScript.textoPortada}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => copyToClipboard(currentScript.guion + '\n\n' + currentScript.copy + '\n\n' + currentScript.hashtags)}
                className="bg-[#C1DBE8] hover:bg-[#8BB8D0] text-[#2A1520] rounded-2xl"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar todo
              </Button>
              <Button
                onClick={() => {
                  saveToLibrary({
                    id: generateId(),
                    tipo: 'reel',
                    titulo: currentScript.textoPortada || 'Reel',
                    objetivo: reelObjetivo,
                    servicio: reelServicio,
                    guion: currentScript.guion,
                    copy: currentScript.copy,
                    hashtags: currentScript.hashtags,
                    textoPortada: currentScript.textoPortada,
                    formato: reelFormato,
                    estado: 'borrador',
                    fecha: '',
                    slides: [],
                    storiesData: [],
                    planId: '',
                    createdAt: new Date().toISOString(),
                  })
                }}
                className="bg-[#591427] hover:bg-[#7A2A40] text-white rounded-2xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReelScript(false)
                  setCurrentScript(null)
                }}
                className="border-[#E8DDD5] rounded-2xl"
              >
                Volver a ideas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STORIES SUBMODULE */}
      {subModule === 'stories' && (
        <>
          <Card className="border-none shadow-md brave-glass brave-card-hover brave-glow rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2A1520] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C1DBE8]" />
                Crear Stories
              </CardTitle>
              <CardDescription>Genera una secuencia de 3 stories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2A1520]">Servicio</label>
                <div className="flex flex-wrap gap-2">
                  {servicios.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStoryServicio(s)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        storyServicio === s
                          ? 'bg-[#591427] text-white shadow-md'
                          : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2A1520]">Objetivo</label>
                <div className="flex flex-wrap gap-2">
                  {['autoridad', 'reservas', 'educación', 'venta'].map((obj) => (
                    <button
                      key={obj}
                      onClick={() => setStoryObjetivo(obj)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                        storyObjetivo === obj
                          ? 'bg-[#C1DBE8] text-[#2A1520] shadow-md'
                          : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                      }`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={generateStories}
              disabled={isLoading || !storyServicio}
              className="px-8 py-6 text-base font-bold rounded-2xl shadow-lg bg-gradient-to-r from-[#591427] to-[#C1DBE8] hover:from-[#7A2A40] hover:to-[#8BB8D0] text-white disabled:opacity-50"
            >
              {isLoading ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Generando...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" />GENERAR STORIES</>
              )}
            </Button>
          </div>

          {storyResult && (
            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-bold text-[#2A1520]">Tu Secuencia de Stories</h3>
              {storyResult.stories.map((story: any, idx: number) => (
                <Card key={idx} className="brave-glass brave-card-hover brave-glow border-none shadow-md rounded-3xl">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#591427] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {story.numero}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="font-medium text-[#2A1520]">{story.texto}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-[#FFF1B5] text-[#2A1520] text-xs">
                            Sticker: {story.sticker}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic">Idea visual: {story.ideaVisual}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(story.texto)}
                        className="text-[#C1DBE8] hover:text-[#591427]"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex gap-3 justify-center pt-2">
                <Button
                  onClick={() => copyToClipboard(storyResult.stories.map((s: any) => `Story ${s.numero}: ${s.texto}\nSticker: ${s.sticker}`).join('\n\n'))}
                  className="bg-[#C1DBE8] hover:bg-[#8BB8D0] text-[#2A1520] rounded-2xl"
                >
                  <Copy className="w-4 h-4 mr-2" />Copiar todo
                </Button>
                <Button
                  onClick={() => saveToLibrary({
                    id: generateId(),
                    tipo: 'story',
                    titulo: `Stories: ${storyServicio}`,
                    objetivo: storyObjetivo,
                    servicio: storyServicio,
                    guion: storyResult.stories.map((s: any) => s.texto).join('\n\n'),
                    copy: '',
                    hashtags: '',
                    textoPortada: '',
                    formato: '',
                    estado: 'borrador',
                    fecha: '',
                    slides: [],
                    storiesData: storyResult.stories,
                    planId: '',
                    createdAt: new Date().toISOString(),
                  })}
                  className="bg-[#591427] hover:bg-[#7A2A40] text-white rounded-2xl"
                >
                  <Save className="w-4 h-4 mr-2" />Guardar
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* CAROUSEL SUBMODULE */}
      {subModule === 'carruseles' && (
        <>
          <Card className="border-none shadow-md brave-glass brave-card-hover brave-glow rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2A1520] flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#C1DBE8]" />
                Crear Carrusel
              </CardTitle>
              <CardDescription>Genera contenido para carruseles de Instagram</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2A1520]">Servicio</label>
                <div className="flex flex-wrap gap-2">
                  {servicios.map((s) => (
                    <button
                      key={s}
                      onClick={() => setCarouselServicio(s)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        carouselServicio === s
                          ? 'bg-[#591427] text-white shadow-md'
                          : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2A1520]">Objetivo</label>
                <div className="flex flex-wrap gap-2">
                  {['autoridad', 'educación', 'venta', 'visibilidad'].map((obj) => (
                    <button
                      key={obj}
                      onClick={() => setCarouselObjetivo(obj)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                        carouselObjetivo === obj
                          ? 'bg-[#C1DBE8] text-[#2A1520] shadow-md'
                          : 'bg-[#F5F0EB] text-[#2A1520] hover:bg-[#E8DDD5]'
                      }`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2A1520]">Número de slides</label>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCarouselSlides(n)}
                      className={`p-3 rounded-2xl text-center font-bold transition-all ${
                        carouselSlides === n
                          ? 'bg-[#FFF1B5] text-[#2A1520] shadow-md'
                          : 'bg-white border-2 border-[#E8DDD5] text-[#2A1520] hover:border-[#FFF1B5]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={generateCarousel}
              disabled={isLoading || !carouselServicio}
              className="px-8 py-6 text-base font-bold rounded-2xl shadow-lg bg-gradient-to-r from-[#591427] to-[#C1DBE8] hover:from-[#7A2A40] hover:to-[#8BB8D0] text-white disabled:opacity-50"
            >
              {isLoading ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Generando...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" />GENERAR CARRUSEL</>
              )}
            </Button>
          </div>

          {carouselResult && (
            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-bold text-[#2A1520]">Tu Carrusel</h3>
              {carouselResult.slides.map((slide: any, idx: number) => (
                <Card key={idx} className="brave-glass brave-card-hover brave-glow border-none shadow-md rounded-3xl">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF1B5] flex items-center justify-center text-[#2A1520] font-bold text-sm shrink-0">
                        {slide.numero}
                      </div>
                      <p className="font-medium text-[#2A1520] flex-1">{slide.texto}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(slide.texto)}
                        className="text-[#C1DBE8] hover:text-[#591427]"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {carouselResult.copy && (
                <Card className="border-none shadow-md bg-[#FFFBF0] brave-glass brave-card-hover brave-glow rounded-3xl">
                  <CardContent className="p-4">
                    <label className="text-sm font-bold text-[#591427]">COPY</label>
                    <p className="text-sm text-[#2A1520] mt-1">{carouselResult.copy}</p>
                  </CardContent>
                </Card>
              )}

              {carouselResult.hashtags && (
                <Card className="border-none shadow-md bg-[#FFFBF0] brave-glass brave-card-hover brave-glow rounded-3xl">
                  <CardContent className="p-4">
                    <label className="text-sm font-bold text-[#591427]">HASHTAGS</label>
                    <p className="text-sm text-[#C1DBE8] mt-1">{carouselResult.hashtags}</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 justify-center pt-2">
                <Button
                  onClick={() => copyToClipboard(
                    carouselResult.slides.map((s: any) => `Slide ${s.numero}: ${s.texto}`).join('\n\n') +
                    '\n\nCopy: ' + carouselResult.copy +
                    '\n\nHashtags: ' + carouselResult.hashtags
                  )}
                  className="bg-[#C1DBE8] hover:bg-[#8BB8D0] text-[#2A1520] rounded-2xl"
                >
                  <Copy className="w-4 h-4 mr-2" />Copiar todo
                </Button>
                <Button
                  onClick={() => saveToLibrary({
                    id: generateId(),
                    tipo: 'carrusel',
                    titulo: `Carrusel: ${carouselServicio}`,
                    objetivo: carouselObjetivo,
                    servicio: carouselServicio,
                    guion: '',
                    copy: carouselResult.copy || '',
                    hashtags: carouselResult.hashtags || '',
                    textoPortada: '',
                    formato: '',
                    estado: 'borrador',
                    fecha: '',
                    slides: carouselResult.slides,
                    storiesData: [],
                    planId: '',
                    createdAt: new Date().toISOString(),
                  })}
                  className="bg-[#591427] hover:bg-[#7A2A40] text-white rounded-2xl"
                >
                  <Save className="w-4 h-4 mr-2" />Guardar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
