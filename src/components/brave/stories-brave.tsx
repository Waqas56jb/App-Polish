'use client'

import { useState } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Instagram,
  RefreshCw,
  Save,
  Copy,
  Check,
  Loader2,
  Trash2,
  Sparkles,
  MessageCircle,
  Shield,
  ArrowRight,
  Lightbulb,
  Type,
  Video,
  ChevronRight,
} from 'lucide-react'

interface BraveStory {
  numero: number
  tipo: string
  texto: string
  sticker: string
  ideaVisual: string
}

interface BraveStoryResult {
  trabajo: string
  problemaCliente: string
  palabraClave: string
  stories: BraveStory[]
  copyCaption: string
  hashtags: string
}

const SERVICIOS_PREDEFINIDOS = [
  'Balayage',
  'Morena iluminada',
  'Alisado',
  'Corrección de color',
  'Recuperación de cabello dañado',
  'Rubio',
  'Mechas',
  'Color global',
  'Corte',
  'Peinado',
  'Tratamiento hidratante',
  'Keratina',
  'Decoloración',
  'Baño de color',
  'Extensiones',
  'Permanente',
  'Otro',
]

const VISTAS_TIPO_STORY = [
  {
    n: 1,
    titulo: 'Problema, intriga o identificación',
    icon: <MessageCircle className="w-4 h-4" />,
    color: 'bg-[#C17C83]',
    descripcion: 'Conseguir que la persona se quede viendo.',
  },
  {
    n: 2,
    titulo: 'Autoridad',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-[#7D2E42]',
    descripcion: 'La más importante. Demuestra experiencia.',
  },
  {
    n: 3,
    titulo: 'Resultado + Acción',
    icon: <ArrowRight className="w-4 h-4" />,
    color: 'bg-[#C9A96E]',
    descripcion: 'Mostrar beneficio y provocar conversación.',
  },
]

// Extracts the CTA keyword from the last story (usually Story 3 contains "escribe KEYWORD")
function extractKeywordFromStories(stories: BraveStory[]): string {
  if (!stories || stories.length === 0) return ''
  const lastStory = stories[stories.length - 1]
  const match = (lastStory.texto || '').match(/escribe\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{1,20})/i)
  if (match) return match[1].trim().toUpperCase()
  return ''
}

export function StoriesBrave() {
  const { brandProfile, addLibraryItems, setIsLoading, isLoading } = useAppStore()

  // Input state
  const [servicio, setServicio] = useState('')
  const [trabajoRealizado, setTrabajoRealizado] = useState('')
  const [descripcionExtra, setDescripcionExtra] = useState('')
  const [modo, setModo] = useState<'texto' | 'camara'>('texto')

  // Output state
  const [resultado, setResultado] = useState<BraveStoryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [savedToLibrary, setSavedToLibrary] = useState(false)

  const copyField = (field: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleGenerate = async () => {
    setError(null)
    if (!servicio && !trabajoRealizado) {
      setError('Cuéntanos qué trabajo realizaste hoy para crear tus Stories BRÄVE.')
      return
    }

    setIsLoading(true, 'Creando tus Stories BRÄVE...')
    setSavedToLibrary(false)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'stories-brave',
          brandProfile,
          context: {
            trabajoRealizado: trabajoRealizado || servicio,
            servicio,
            modo,
            descripcionExtra,
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        const r = data.result
        if (Array.isArray(r) && r.length > 0 && r[0].numero) {
          // Model returned only the stories array — wrap it
          setResultado({
            trabajo: servicio || trabajoRealizado || 'trabajo de hoy',
            problemaCliente: '',
            palabraClave: extractKeywordFromStories(r),
            stories: r,
            copyCaption: '',
            hashtags: '',
          })
        } else if (r && r.stories && Array.isArray(r.stories)) {
          setResultado(r as BraveStoryResult)
        } else if (r?.raw) {
          setError('No se pudo procesar la respuesta. Intenta de nuevo.')
        } else {
          setError('Formato inesperado. Intenta de nuevo.')
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error generando stories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveToLibrary = () => {
    if (!resultado) return
    const item: ContentItem = {
      id: generateId(),
      tipo: 'story',
      titulo: `Stories BRÄVE — ${servicio || resultado.trabajo || 'trabajo de hoy'}`,
      objetivo: 'reservas',
      servicio: servicio || '',
      guion: resultado.stories.map(s => `STORY ${s.numero} — ${s.tipo}\n${s.texto}\n\nVisual: ${s.ideaVisual}\nSticker: ${s.sticker}`).join('\n\n---\n\n'),
      copy: resultado.copyCaption || '',
      hashtags: resultado.hashtags || '',
      textoPortada: resultado.problemaCliente || '',
      formato: modo === 'camara' ? 'hablando a cámara' : 'texto',
      estado: 'aprobado',
      fecha: '',
      diaSemana: '',
      slides: [],
      storiesData: resultado.stories.map(s => ({
        numero: s.numero,
        texto: s.texto,
        sticker: s.sticker,
        ideaVisual: s.ideaVisual,
      })),
      descripcion: resultado.problemaCliente || '',
      planId: '',
      createdAt: new Date().toISOString(),
    }
    addLibraryItems([item])
    setSavedToLibrary(true)
    setTimeout(() => setSavedToLibrary(false), 2500)
  }

  const handleCopyAll = () => {
    if (!resultado) return
    const lines: string[] = [
      `STORIES BRÄVE — ${servicio || resultado.trabajo || 'trabajo de hoy'}`,
      ``,
      `Problema del cliente: ${resultado.problemaCliente}`,
      `Palabra clave: ${resultado.palabraClave}`,
      ``,
    ]
    resultado.stories.forEach(s => {
      lines.push(`━━━━━━━━━━━━━━━━━━━━`)
      lines.push(`STORY ${s.numero} — ${s.tipo}`)
      lines.push(`━━━━━━━━━━━━━━━━━━━━`)
      lines.push(s.texto)
      lines.push(``)
      lines.push(`Visual: ${s.ideaVisual}`)
      lines.push(`Sticker: ${s.sticker}`)
      lines.push(``)
    })
    lines.push(`Copy: ${resultado.copyCaption}`)
    lines.push(resultado.hashtags)
    copyField('all', lines.join('\n'))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="brave-gradient rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Instagram className="w-7 h-7" />
          <h1 className="text-2xl font-bold">Stories BRÄVE</h1>
        </div>
        <p className="text-white/80 text-sm max-w-2xl">
          Convierte el trabajo de hoy en una secuencia de 3 historias que termina en una posible reserva.
          La estilista solo cuenta lo que ha ocurrido. BRÄVE lo transforma automáticamente en una conversación que vende.
        </p>
      </div>

      {/* Methodology callout */}
      <Card className="border-[#E0D5D1] bg-[#FBF7F5]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C9A96E] flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#7D2E42] mb-1">Metodología BRÄVE</p>
              <p className="text-sm text-[#2D1F22]/80 mb-3">
                Las Stories BRÄVE no se construyen alrededor del servicio. Se construyen alrededor de la clienta.
                Las clientas no reservan porque vean un balayage bonito. Reservan porque se identifican con un problema
                y entienden que existe una solución para ellas.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {VISTAS_TIPO_STORY.map(v => (
                  <div key={v.n} className="bg-white rounded-lg p-2 border border-[#E0D5D1]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-5 h-5 rounded-full ${v.color} text-white text-[10px] font-bold flex items-center justify-center`}>
                        {v.n}
                      </span>
                      <span className="font-semibold text-[#2D1F22] truncate">{v.titulo}</span>
                    </div>
                    <p className="text-[#2D1F22]/70 text-[11px] leading-tight">{v.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input form */}
      <Card className="border-[#E0D5D1]">
        <CardHeader>
          <CardTitle className="text-[#7D2E42]">Cuéntanos qué hiciste hoy</CardTitle>
          <CardDescription>
            Solo necesitas decir lo que hiciste en el salón. BRÄVE se encarga del resto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Service selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D1F22]">¿Qué trabajo realizaste hoy?</label>
            <div className="flex flex-wrap gap-2">
              {SERVICIOS_PREDEFINIDOS.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setServicio(s)
                    if (!trabajoRealizado) setTrabajoRealizado(s)
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    servicio === s
                      ? 'bg-[#7D2E42] text-white shadow-md'
                      : 'bg-[#FBF7F5] text-[#2D1F22] border border-[#E0D5D1] hover:border-[#C17C83]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Free text describing the work */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D1F22]">Cuéntalo con tus palabras (opcional)</label>
            <Textarea
              value={trabajoRealizado}
              onChange={e => setTrabajoRealizado(e.target.value)}
              placeholder="Ej: Hoy vino una clienta que llevaba meses sin tocar su color. Le hicimos un balayage suave para devolverle luz sin pasar por rubia."
              className="min-h-[80px] resize-none border-[#E0D5D1] focus:border-[#C17C83]"
            />
          </div>

          {/* Extra details */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D1F22]">Algún detalle más (opcional)</label>
            <Input
              value={descripcionExtra}
              onChange={e => setDescripcionExtra(e.target.value)}
              placeholder="Ej: la clienta quería poco mantenimiento / transición marcada / cabello dañado"
              className="border-[#E0D5D1] focus:border-[#C17C83]"
            />
          </div>

          {/* Mode selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2D1F22]">Modo de creación</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModo('texto')}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  modo === 'texto'
                    ? 'border-[#7D2E42] bg-[#FBF7F5] shadow-md'
                    : 'border-[#E0D5D1] bg-white hover:border-[#C17C83]'
                }`}
              >
                <Type className="w-5 h-5 text-[#7D2E42] mb-2" />
                <p className="font-semibold text-[#2D1F22] text-sm">Modo Texto</p>
                <p className="text-xs text-[#2D1F22]/70 mt-1">Textos listos para copiar y pegar en la Story.</p>
              </button>
              <button
                onClick={() => setModo('camara')}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  modo === 'camara'
                    ? 'border-[#7D2E42] bg-[#FBF7F5] shadow-md'
                    : 'border-[#E0D5D1] bg-white hover:border-[#C17C83]'
                }`}
              >
                <Video className="w-5 h-5 text-[#7D2E42] mb-2" />
                <p className="font-semibold text-[#2D1F22] text-sm">Hablando a cámara</p>
                <p className="text-xs text-[#2D1F22]/70 mt-1">Guion conversacional listo para grabar.</p>
              </button>
            </div>
          </div>

          {/* Brand profile soft banner */}
          {!brandProfile && (
            <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-xl p-3">
              <p className="text-xs text-[#7D2E42]">
                💡 Sin perfil de marca las Stories serán genéricas. Configura tu marca en "Mi Marca" para personalizarlas.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || (!servicio && !trabajoRealizado)}
            className="w-full brave-gradient text-white hover:opacity-90 h-12 text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creando tus Stories BRÄVE...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Crear Stories BRÄVE
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {resultado && (
        <div className="space-y-5">
          {/* Summary card */}
          <Card className="border-[#C9A96E] bg-gradient-to-br from-[#FBF7F5] to-[#F3E8E5]">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Trabajo realizado</p>
                  <p className="text-sm font-medium text-[#2D1F22]">{resultado.trabajo || servicio || 'Trabajo de hoy'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Problema de la clienta</p>
                  <p className="text-sm font-medium text-[#2D1F22]">
                    {resultado.problemaCliente || 'Identificado en las Stories abajo'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Palabra clave del CTA</p>
                  {resultado.palabraClave ? (
                    <Badge className="bg-[#C9A96E] hover:bg-[#C9A96E] text-white text-sm">
                      {resultado.palabraClave}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Three stories */}
          <div className="space-y-4">
            {resultado.stories.map((story, idx) => {
              const vista = VISTAS_TIPO_STORY[idx]
              if (!vista) return null
              return (
                <Card key={story.numero} className="border-[#E0D5D1] overflow-hidden">
                  <div className={`${vista.color} p-3 flex items-center gap-3`}>
                    <span className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-sm">
                      {story.numero}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm flex items-center gap-2">
                        {vista.icon}
                        {vista.titulo}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyField(`story-${story.numero}`, story.texto)}
                      className="text-white hover:bg-white/20 hover:text-white h-8"
                    >
                      {copiedField === `story-${story.numero}` ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiedField === `story-${story.numero}` ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    {/* Story text */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide">
                        Texto de la Story {modo === 'camara' ? '(guion para grabar)' : '(listo para pegar)'}
                      </p>
                      <div className="bg-[#FBF7F5] p-4 rounded-xl whitespace-pre-line text-sm text-[#2D1F22] leading-relaxed border border-[#E0D5D1]">
                        {story.texto}
                      </div>
                    </div>

                    {/* Sticker recommendation */}
                    {story.sticker && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-[#7D2E42] mt-0.5">🏷️ Sticker:</span>
                        <span className="text-sm text-[#2D1F22] flex-1">{story.sticker}</span>
                      </div>
                    )}

                    {/* Visual idea */}
                    {story.ideaVisual && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-[#7D2E42] mt-0.5">🎨 Visual:</span>
                        <span className="text-sm text-[#2D1F22] flex-1">{story.ideaVisual}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Caption + hashtags */}
          {(resultado.copyCaption || resultado.hashtags) && (
            <Card className="border-[#E0D5D1]">
              <CardContent className="p-5 space-y-3">
                {resultado.copyCaption && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-[#7D2E42]">Copy para acompañar</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyField('caption', resultado.copyCaption)}
                        className="text-[#C17C83] hover:bg-[#F3E8E5] h-7"
                      >
                        {copiedField === 'caption' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-[#FBF7F5] p-3 rounded-xl text-sm text-[#2D1F22]">
                      {resultado.copyCaption}
                    </div>
                  </div>
                )}
                {resultado.hashtags && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-[#7D2E42]">Hashtags</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyField('hashtags', resultado.hashtags)}
                        className="text-[#C17C83] hover:bg-[#F3E8E5] h-7"
                      >
                        {copiedField === 'hashtags' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        Copiar
                      </Button>
                    </div>
                    <div className="bg-[#FBF7F5] p-3 rounded-xl text-sm text-[#C17C83]">
                      {resultado.hashtags}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <Card className="border-[#E0D5D1]">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleCopyAll}
                  className="bg-[#C17C83] hover:bg-[#B06B74] text-white h-11"
                >
                  {copiedField === 'all' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedField === 'all' ? '¡Todo copiado!' : 'Copiar todo'}
                </Button>
                <Button
                  onClick={handleSaveToLibrary}
                  className="bg-[#7D2E42] hover:bg-[#933A54] text-white h-11"
                >
                  {savedToLibrary ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {savedToLibrary ? '¡Guardado!' : 'Guardar en biblioteca'}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  variant="outline"
                  className="border-[#C9A96E] text-[#C9A96E] hover:bg-[#FBF7F5] h-11"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Regenerar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
