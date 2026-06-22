'use client'

import { useState, useRef, useEffect } from 'react'
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
  Sparkles,
  MessageCircle,
  Shield,
  ArrowRight,
  Lightbulb,
  Type,
  Video,
  Mic,
  Square,
  Trash2,
  HelpCircle,
  Plus,
  X,
} from 'lucide-react'

interface BraveEncuesta {
  pregunta: string
  respuestas: string[]
}

interface BraveStory {
  numero: number
  tipo: string
  texto: string
  sticker: string
  ideaVisual: string
  encuesta?: BraveEncuesta | null
}

interface BraveStoryResult {
  trabajo: string
  problemaCliente: string
  palabraClave: string
  stories: BraveStory[]
  hashtags: string
}

interface CajaPregunta {
  id: number
  servicio: string
  pregunta: string
  respuesta: string
  modo: string
}

interface CajaPreguntasResult {
  servicios: string[]
  preguntas: CajaPregunta[]
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
    color: 'bg-[#C1DBE8]',
    descripcion: 'Conseguir que la persona se quede viendo.',
  },
  {
    n: 2,
    titulo: 'Autoridad',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-[#591427]',
    descripcion: 'La más importante. Demuestra experiencia.',
  },
  {
    n: 3,
    titulo: 'Resultado + Acción',
    icon: <ArrowRight className="w-4 h-4" />,
    color: 'bg-[#FFF1B5]',
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

function getStoryTipoVista(story: BraveStory, totalStories: number) {
  if (story.numero === 1) return VISTAS_TIPO_STORY[0]
  if (story.numero === totalStories) return VISTAS_TIPO_STORY[2]
  return VISTAS_TIPO_STORY[1]
}

export function StoriesBrave() {
  const { brandProfile, addLibraryItems, setIsLoading, isLoading } = useAppStore()
  const [tab, setTab] = useState<'secuencia' | 'caja'>('secuencia')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="brave-gradient rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Instagram className="w-7 h-7" />
          <h1 className="text-2xl font-bold">Stories BRÄVE</h1>
        </div>
        <p className="text-white/80 text-sm max-w-2xl">
          Convierte el trabajo de hoy en Stories que terminan en reserva, o prepara respuestas
          para tu caja de preguntas. La estilista solo cuenta lo que ha ocurrido. BRÄVE lo transforma en conversación.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTab('secuencia')}
          className={`p-4 rounded-xl text-left transition-all border-2 ${
            tab === 'secuencia'
              ? 'border-[#591427] bg-[#FFFBF0] shadow-md'
              : 'border-[#E8DDD5] bg-white hover:border-[#C1DBE8]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Instagram className="w-4 h-4 text-[#591427]" />
            <p className="font-semibold text-[#2A1520] text-sm">Secuencia de Stories</p>
          </div>
          <p className="text-xs text-[#2A1520]/70">
            Transforma un trabajo de hoy en una secuencia de Stories que vende.
          </p>
        </button>
        <button
          onClick={() => setTab('caja')}
          className={`p-4 rounded-xl text-left transition-all border-2 ${
            tab === 'caja'
              ? 'border-[#591427] bg-[#FFFBF0] shadow-md'
              : 'border-[#E8DDD5] bg-white hover:border-[#C1DBE8]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4 text-[#591427]" />
            <p className="font-semibold text-[#2A1520] text-sm">Caja de Preguntas</p>
          </div>
          <p className="text-xs text-[#2A1520]/70">
            Genera preguntas de clientas y respuestas para tu caja de preguntas.
          </p>
        </button>
      </div>

      {tab === 'secuencia' ? (
        <SecuenciaStories />
      ) : (
        <CajaDePreguntas />
      )}
    </div>
  )
}

/* ====================================================================== */
/* SECuencia de Stories                                                   */
/* ====================================================================== */

function SecuenciaStories() {
  const { brandProfile, addLibraryItems, setIsLoading, isLoading } = useAppStore()

  // Input state
  const [servicio, setServicio] = useState('')
  const [trabajoRealizado, setTrabajoRealizado] = useState('')
  const [descripcionExtra, setDescripcionExtra] = useState('')
  const [modo, setModo] = useState<'texto' | 'camara'>('texto')
  const [numStories, setNumStories] = useState<number>(3)

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioBlobUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch (e: any) {
      setError('No se pudo acceder al micrófono: ' + e.message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlobUrl) return
    setIsTranscribing(true)
    setError(null)
    try {
      const response = await fetch(audioBlobUrl)
      const blob = await response.blob()
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string
          // Strip data URL prefix
          resolve(result.split(',')[1])
        }
        reader.readAsDataURL(blob)
      })

      const res = await fetch('/api/asr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64 }),
      })
      const data = await res.json()
      if (data.error) {
        setError('Error transcribiendo audio: ' + data.error)
      } else if (data.text) {
        setTrabajoRealizado(prev => prev ? prev + ' ' + data.text : data.text)
      } else {
        setError('No se pudo transcribir el audio.')
      }
    } catch (e: any) {
      setError('Error transcribiendo: ' + e.message)
    } finally {
      setIsTranscribing(false)
    }
  }

  const clearAudio = () => {
    if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl)
    setAudioBlobUrl(null)
    audioChunksRef.current = []
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl)
    }
  }, [audioBlobUrl])

  const handleGenerate = async () => {
    setError(null)
    if (!servicio && !trabajoRealizado) {
      setError('Cuéntanos qué trabajo realizaste hoy para crear tus Stories BRÄVE.')
      return
    }

    setIsLoading(true, `Creando tus ${numStories} Stories BRÄVE...`)
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
            numStories,
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        const r = data.result
        if (Array.isArray(r) && r.length > 0 && r[0].numero) {
          setResultado({
            trabajo: servicio || trabajoRealizado || 'trabajo de hoy',
            problemaCliente: '',
            palabraClave: extractKeywordFromStories(r),
            stories: r,
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
      guion: resultado.stories.map(s => {
        let out = `STORY ${s.numero} — ${s.tipo}\n${s.texto}`
        if (s.encuesta) {
          out += `\n\n📊 Encuesta: ${s.encuesta.pregunta}\n   Opciones: ${s.encuesta.respuestas.join(' / ')}`
        }
        out += `\n\nVisual: ${s.ideaVisual}\nSticker: ${s.sticker}`
        return out
      }).join('\n\n---\n\n'),
      copy: '',
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
    ]
    resultado.stories.forEach(s => {
      lines.push(`━━━━━━━━━━━━━━━━━━━━`)
      lines.push(`STORY ${s.numero} — ${s.tipo}`)
      lines.push(`━━━━━━━━━━━━━━━━━━━━`)
      lines.push(s.texto)
      if (s.encuesta) {
        lines.push(``)
        lines.push(`Encuesta: ${s.encuesta.pregunta}`)
        lines.push(`Opciones: ${s.encuesta.respuestas.map((r, i) => `${i + 1}. ${r}`).join('  |  ')}`)
      }
      lines.push(``)
      lines.push(`Visual: ${s.ideaVisual}`)
      lines.push(`Sticker: ${s.sticker}`)
      lines.push(``)
    })
    if (resultado.hashtags) lines.push(resultado.hashtags)
    copyField('all', lines.join('\n'))
  }

  return (
    <div className="space-y-6">
      {/* Methodology callout */}
      <Card className="border-[#E8DDD5] bg-[#FFFBF0]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF1B5] flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#591427] mb-1">Metodología BRÄVE</p>
              <p className="text-sm text-[#2A1520]/80 mb-3">
                Las Stories BRÄVE no se construyen alrededor del servicio. Se construyen alrededor de la clienta.
                Las clientas no reservan porque vean un balayage bonito. Reservan porque se identifican con un problema
                y entienden que existe una solución para ellas.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {VISTAS_TIPO_STORY.map(v => (
                  <div key={v.n} className="bg-white rounded-lg p-2 border border-[#E8DDD5]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-5 h-5 rounded-full ${v.color} text-white text-[10px] font-bold flex items-center justify-center`}>
                        {v.n}
                      </span>
                      <span className="font-semibold text-[#2A1520] truncate">{v.titulo}</span>
                    </div>
                    <p className="text-[#2A1520]/70 text-[11px] leading-tight">{v.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input form */}
      <Card className="border-[#E8DDD5]">
        <CardHeader>
          <CardTitle className="text-[#591427]">Cuéntanos qué hiciste hoy</CardTitle>
          <CardDescription>
            Solo necesitas decir lo que hiciste en el salón. BRÄVE se encarga del resto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Service selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520]">¿Qué trabajo realizaste hoy?</label>
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
                      ? 'bg-[#591427] text-white shadow-md'
                      : 'bg-[#FFFBF0] text-[#2A1520] border border-[#E8DDD5] hover:border-[#C1DBE8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Free text describing the work */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520]">Cuéntalo con tus palabras (opcional)</label>
            <Textarea
              value={trabajoRealizado}
              onChange={e => setTrabajoRealizado(e.target.value)}
              placeholder="Ej: Hoy vino una clienta que llevaba meses sin tocar su color. Le hicimos un balayage suave para devolverle luz sin pasar por rubia."
              className="min-h-[80px] resize-none border-[#E8DDD5] focus:border-[#C1DBE8]"
            />
          </div>

          {/* Audio input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520]">O cuéntalo en voz alta (opcional)</label>
            <div className="bg-[#FFFBF0] border border-[#E8DDD5] rounded-xl p-4">
              {!isRecording && !audioBlobUrl && (
                <Button
                  onClick={startRecording}
                  variant="outline"
                  className="border-[#C1DBE8] text-[#C1DBE8] hover:bg-[#F5F0EB]"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Grabar audio
                </Button>
              )}
              {isRecording && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 text-sm text-red-600">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    Grabando...
                  </span>
                  <Button
                    onClick={stopRecording}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Detener
                  </Button>
                </div>
              )}
              {audioBlobUrl && !isRecording && (
                <div className="space-y-3">
                  <audio src={audioBlobUrl} controls className="w-full" />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={transcribeAudio}
                      disabled={isTranscribing}
                      size="sm"
                      className="bg-[#591427] hover:bg-[#7A2A40] text-white"
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Transcribiendo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Transcribir a texto
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={startRecording}
                      size="sm"
                      variant="outline"
                      className="border-[#C1DBE8] text-[#C1DBE8] hover:bg-[#F5F0EB]"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Grabar de nuevo
                    </Button>
                    <Button
                      onClick={clearAudio}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Borrar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Al transcribir, el texto se añadirá al campo "Cuéntalo con tus palabras".
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Extra details */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520]">Algún detalle más (opcional)</label>
            <Input
              value={descripcionExtra}
              onChange={e => setDescripcionExtra(e.target.value)}
              placeholder="Ej: la clienta quería poco mantenimiento / transición marcada / cabello dañado"
              className="border-[#E8DDD5] focus:border-[#C1DBE8]"
            />
          </div>

          {/* Number of stories */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520] flex items-center gap-2">
              ¿Cuántas Stories quieres crear?
              <Badge className="bg-[#FFF1B5] hover:bg-[#FFF1B5] text-white text-[10px]">
                Recomendado: 3
              </Badge>
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={10}
                value={numStories}
                onChange={e => setNumStories(Math.min(Math.max(parseInt(e.target.value) || 3, 1), 10))}
                className="w-24 border-[#E8DDD5] focus:border-[#C1DBE8]"
              />
              <div className="flex gap-1 flex-wrap">
                {[2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumStories(n)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      numStories === n
                        ? 'bg-[#591427] text-white shadow-md'
                        : 'bg-[#FFFBF0] text-[#2A1520] border border-[#E8DDD5] hover:border-[#C1DBE8]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              3 es la cantidad ideal según la metodología BRÄVE: Problema → Autoridad → Resultado + Acción.
            </p>
          </div>

          {/* Mode selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520]">Modo de creación</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModo('texto')}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  modo === 'texto'
                    ? 'border-[#591427] bg-[#FFFBF0] shadow-md'
                    : 'border-[#E8DDD5] bg-white hover:border-[#C1DBE8]'
                }`}
              >
                <Type className="w-5 h-5 text-[#591427] mb-2" />
                <p className="font-semibold text-[#2A1520] text-sm">Modo Texto</p>
                <p className="text-xs text-[#2A1520]/70 mt-1">Textos listos para copiar y pegar en la Story.</p>
              </button>
              <button
                onClick={() => setModo('camara')}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  modo === 'camara'
                    ? 'border-[#591427] bg-[#FFFBF0] shadow-md'
                    : 'border-[#E8DDD5] bg-white hover:border-[#C1DBE8]'
                }`}
              >
                <Video className="w-5 h-5 text-[#591427] mb-2" />
                <p className="font-semibold text-[#2A1520] text-sm">Hablando a cámara</p>
                <p className="text-xs text-[#2A1520]/70 mt-1">Guion conversacional listo para grabar.</p>
              </button>
            </div>
          </div>

          {/* Brand profile soft banner */}
          {!brandProfile && (
            <div className="bg-[#FFF1B5]/10 border border-[#FFF1B5]/30 rounded-xl p-3">
              <p className="text-xs text-[#591427]">
                Sin perfil de marca las Stories serán genéricas. Configura tu marca en "Mi Marca" para personalizarlas.
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
                Crear {numStories} Stories BRÄVE
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {resultado && (
        <div className="space-y-5">
          {/* Summary card */}
          <Card className="border-[#FFF1B5] bg-gradient-to-br from-[#FFFBF0] to-[#F5F0EB]">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Trabajo realizado</p>
                  <p className="text-sm font-medium text-[#2A1520]">{resultado.trabajo || servicio || 'Trabajo de hoy'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Problema de la clienta</p>
                  <p className="text-sm font-medium text-[#2A1520]">
                    {resultado.problemaCliente || 'Identificado en las Stories abajo'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Palabra clave del CTA</p>
                  {resultado.palabraClave ? (
                    <Badge className="bg-[#FFF1B5] hover:bg-[#FFF1B5] text-white text-sm">
                      {resultado.palabraClave}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stories */}
          <div className="space-y-4">
            {resultado.stories.map((story) => {
              const vista = getStoryTipoVista(story, resultado.stories.length)
              const colorClass = vista?.color || 'bg-[#591427]'
              return (
                <Card key={story.numero} className="border-[#E8DDD5] overflow-hidden">
                  <div className={`${colorClass} p-3 flex items-center gap-3`}>
                    <span className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-sm">
                      {story.numero}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm flex items-center gap-2">
                        {vista?.icon}
                        {story.tipo || vista?.titulo}
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
                      <div className="bg-[#FFFBF0] p-4 rounded-xl whitespace-pre-line text-sm text-[#2A1520] leading-relaxed border border-[#E8DDD5]">
                        {story.texto}
                      </div>
                    </div>

                    {/* Encuesta / Poll */}
                    {story.encuesta && story.encuesta.pregunta && (
                      <div className="bg-gradient-to-br from-[#C1DBE8]/10 to-[#FFF1B5]/10 border border-[#C1DBE8]/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">📊</span>
                          <p className="text-xs font-bold text-[#591427] uppercase tracking-wide">Encuesta propuesta</p>
                        </div>
                        <p className="text-sm font-semibold text-[#2A1520] mb-3">
                          {story.encuesta.pregunta}
                        </p>
                        <div className="space-y-1.5">
                          {story.encuesta.respuestas.map((resp, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2">
                              <span className="w-5 h-5 rounded-full bg-[#C1DBE8] text-[#2A1520] text-[10px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-[#2A1520]">{resp}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyField(
                            `encuesta-${story.numero}`,
                            `${story.encuesta!.pregunta}\n${story.encuesta!.respuestas.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
                          )}
                          className="mt-2 text-[#C1DBE8] hover:bg-white/50 h-7"
                        >
                          {copiedField === `encuesta-${story.numero}` ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copiar encuesta
                        </Button>
                      </div>
                    )}

                    {/* Sticker recommendation */}
                    {story.sticker && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-[#591427] mt-0.5">Sticker:</span>
                        <span className="text-sm text-[#2A1520] flex-1">{story.sticker}</span>
                      </div>
                    )}

                    {/* Visual idea */}
                    {story.ideaVisual && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-[#591427] mt-0.5">Visual:</span>
                        <span className="text-sm text-[#2A1520] flex-1">{story.ideaVisual}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Hashtags */}
          {resultado.hashtags && (
            <Card className="border-[#E8DDD5]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#591427]">Hashtags</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyField('hashtags', resultado.hashtags)}
                    className="text-[#C1DBE8] hover:bg-[#F5F0EB] h-7"
                  >
                    {copiedField === 'hashtags' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    Copiar
                  </Button>
                </div>
                <div className="bg-[#FFFBF0] p-3 rounded-xl text-sm text-[#C1DBE8] mt-2">
                  {resultado.hashtags}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <Card className="border-[#E8DDD5]">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleCopyAll}
                  className="bg-[#C1DBE8] hover:bg-[#8BB8D0] text-[#2A1520] h-11"
                >
                  {copiedField === 'all' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedField === 'all' ? '¡Todo copiado!' : 'Copiar todo'}
                </Button>
                <Button
                  onClick={handleSaveToLibrary}
                  className="bg-[#591427] hover:bg-[#7A2A40] text-white h-11"
                >
                  {savedToLibrary ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {savedToLibrary ? '¡Guardado!' : 'Guardar en biblioteca'}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  variant="outline"
                  className="border-[#FFF1B5] text-[#FFF1B5] hover:bg-[#FFFBF0] h-11"
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

/* ====================================================================== */
/* Caja de Preguntas                                                      */
/* ====================================================================== */

function CajaDePreguntas() {
  const { brandProfile, addLibraryItems, setIsLoading, isLoading } = useAppStore()

  // Input state
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([])
  const [servicioCustom, setServicioCustom] = useState('')
  const [numPreguntas, setNumPreguntas] = useState<number>(5)
  const [modoRespuesta, setModoRespuesta] = useState<'texto' | 'camara'>('texto')

  // Output state
  const [resultado, setResultado] = useState<CajaPreguntasResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [savedToLibrary, setSavedToLibrary] = useState(false)

  const toggleServicio = (s: string) => {
    setServiciosSeleccionados(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const addCustomServicio = () => {
    const s = servicioCustom.trim()
    if (s && !serviciosSeleccionados.includes(s)) {
      setServiciosSeleccionados(prev => [...prev, s])
      setServicioCustom('')
    }
  }

  const copyField = (field: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleGenerate = async () => {
    setError(null)
    if (serviciosSeleccionados.length === 0) {
      setError('Selecciona al menos un servicio sobre el que quieras responder preguntas.')
      return
    }

    setIsLoading(true, `Generando ${numPreguntas} preguntas para tu caja...`)
    setSavedToLibrary(false)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'preguntas-caja',
          brandProfile,
          context: {
            servicios: serviciosSeleccionados,
            numPreguntas,
            modo: modoRespuesta,
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        const r = data.result
        if (r && r.preguntas && Array.isArray(r.preguntas)) {
          setResultado(r as CajaPreguntasResult)
        } else if (Array.isArray(r) && r.length > 0 && r[0].pregunta) {
          // Model returned just the preguntas array
          setResultado({
            servicios: serviciosSeleccionados,
            preguntas: r,
          })
        } else if (r?.raw) {
          setError('No se pudo procesar la respuesta. Intenta de nuevo.')
        } else {
          setError('Formato inesperado. Intenta de nuevo.')
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error generando preguntas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyAll = () => {
    if (!resultado) return
    const lines: string[] = [
      `CAJA DE PREGUNTAS — Servicios: ${resultado.servicios.join(', ')}`,
      ``,
    ]
    resultado.preguntas.forEach(p => {
      lines.push(`━━━━━━━━━━━━━━━━━━━━`)
      lines.push(`PREGUNTA ${p.id}`)
      lines.push(`━━━━━━━━━━━━━━━━━━━━`)
      lines.push(`Servicio: ${p.servicio}`)
      lines.push(``)
      lines.push(`P: ${p.pregunta}`)
      lines.push(``)
      lines.push(`R: ${p.respuesta}`)
      lines.push(``)
    })
    copyField('all', lines.join('\n'))
  }

  const handleSaveToLibrary = () => {
    if (!resultado) return
    const items: ContentItem[] = resultado.preguntas.map(p => ({
      id: generateId(),
      tipo: 'story' as const,
      titulo: `Pregunta caja — ${p.servicio}`,
      objetivo: 'autoridad',
      servicio: p.servicio,
      guion: `PREGUNTA:\n${p.pregunta}\n\nRESPUESTA:\n${p.respuesta}`,
      copy: p.respuesta,
      hashtags: '',
      textoPortada: p.pregunta,
      formato: p.modo === 'camara' ? 'hablando a cámara' : 'texto',
      estado: 'aprobado' as const,
      fecha: '',
      diaSemana: '',
      slides: [],
      storiesData: [],
      descripcion: p.pregunta,
      planId: '',
      createdAt: new Date().toISOString(),
    }))
    addLibraryItems(items)
    setSavedToLibrary(true)
    setTimeout(() => setSavedToLibrary(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Explanation card */}
      <Card className="border-[#E8DDD5] bg-[#FFFBF0]">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF1B5] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#591427] mb-1">¿Cómo funciona la caja de preguntas?</p>
              <p className="text-sm text-[#2A1520]/80">
                Lanzas una caja de preguntas en tus Stories. Las clientas dejan preguntas sobre tus servicios.
                Nosotros generamos preguntas ficticias pero realistas — como las que harían tus clientas — para que
                practiques las respuestas. Cada pregunta viene con una posible respuesta, lista para responder en
                Stories en modo texto o hablando a cámara.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input form */}
      <Card className="border-[#E8DDD5]">
        <CardHeader>
          <CardTitle className="text-[#591427]">Configura tu caja de preguntas</CardTitle>
          <CardDescription>
            Selecciona sobre qué servicios quieres responder y BRÄVE generará preguntas realistas de clientas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Services multi-select */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520]">
              Servicios sobre los que quieres responder preguntas
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICIOS_PREDEFINIDOS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleServicio(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    serviciosSeleccionados.includes(s)
                      ? 'bg-[#591427] text-white shadow-md'
                      : 'bg-[#FFFBF0] text-[#2A1520] border border-[#E8DDD5] hover:border-[#C1DBE8]'
                  }`}
                >
                  {serviciosSeleccionados.includes(s) && <Check className="w-3 h-3" />}
                  {s}
                </button>
              ))}
            </div>
            {serviciosSeleccionados.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#E8DDD5]">
                {serviciosSeleccionados.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleServicio(s)}
                    className="px-2.5 py-1 rounded-full text-xs bg-[#C1DBE8]/10 text-[#591427] flex items-center gap-1 hover:bg-[#C1DBE8]/20"
                  >
                    {s}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom service */}
          <div className="flex gap-2">
            <Input
              value={servicioCustom}
              onChange={e => setServicioCustom(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomServicio() } }}
              placeholder="Otro servicio (escribe y pulsa Enter)"
              className="border-[#E8DDD5] focus:border-[#C1DBE8]"
            />
            <Button
              onClick={addCustomServicio}
              variant="outline"
              className="border-[#C1DBE8] text-[#C1DBE8] hover:bg-[#F5F0EB]"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Number of questions */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520]">¿Cuántas preguntas quieres generar?</label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={20}
                value={numPreguntas}
                onChange={e => setNumPreguntas(Math.min(Math.max(parseInt(e.target.value) || 5, 1), 20))}
                className="w-24 border-[#E8DDD5] focus:border-[#C1DBE8]"
              />
              <div className="flex gap-1 flex-wrap">
                {[3, 5, 8, 10, 15].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumPreguntas(n)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      numPreguntas === n
                        ? 'bg-[#591427] text-white shadow-md'
                        : 'bg-[#FFFBF0] text-[#2A1520] border border-[#E8DDD5] hover:border-[#C1DBE8]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode for answers */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2A1520]">¿Cómo quieres responderlas?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModoRespuesta('texto')}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  modoRespuesta === 'texto'
                    ? 'border-[#591427] bg-[#FFFBF0] shadow-md'
                    : 'border-[#E8DDD5] bg-white hover:border-[#C1DBE8]'
                }`}
              >
                <Type className="w-5 h-5 text-[#591427] mb-2" />
                <p className="font-semibold text-[#2A1520] text-sm">Responder por texto</p>
                <p className="text-xs text-[#2A1520]/70 mt-1">Respuestas escritas listas para Instagram.</p>
              </button>
              <button
                onClick={() => setModoRespuesta('camara')}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  modoRespuesta === 'camara'
                    ? 'border-[#591427] bg-[#FFFBF0] shadow-md'
                    : 'border-[#E8DDD5] bg-white hover:border-[#C1DBE8]'
                }`}
              >
                <Video className="w-5 h-5 text-[#591427] mb-2" />
                <p className="font-semibold text-[#2A1520] text-sm">Hablando a cámara</p>
                <p className="text-xs text-[#2A1520]/70 mt-1">Guion para responder en vídeo.</p>
              </button>
            </div>
          </div>

          {/* Brand profile soft banner */}
          {!brandProfile && (
            <div className="bg-[#FFF1B5]/10 border border-[#FFF1B5]/30 rounded-xl p-3">
              <p className="text-xs text-[#591427]">
                Sin perfil de marca las respuestas serán genéricas. Configura tu marca en "Mi Marca" para personalizarlas.
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
            disabled={isLoading || serviciosSeleccionados.length === 0}
            className="w-full brave-gradient text-white hover:opacity-90 h-12 text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generando preguntas...
              </>
            ) : (
              <>
                <HelpCircle className="w-5 h-5 mr-2" />
                Generar {numPreguntas} preguntas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {resultado && (
        <div className="space-y-5">
          {/* Summary card */}
          <Card className="border-[#FFF1B5] bg-gradient-to-br from-[#FFFBF0] to-[#F5F0EB]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Servicios seleccionados</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {resultado.servicios.map((s, i) => (
                      <Badge key={i} className="bg-[#591427] hover:bg-[#591427] text-white">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total preguntas</p>
                  <Badge className="bg-[#FFF1B5] hover:bg-[#FFF1B5] text-white text-base">
                    {resultado.preguntas.length}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Modo de respuesta</p>
                  <Badge variant="outline" className="border-[#C1DBE8] text-[#C1DBE8]">
                    {modoRespuesta === 'camara' ? '🎬 Hablando a cámara' : '📝 Texto'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions list */}
          <div className="space-y-4">
            {resultado.preguntas.map((p, idx) => (
              <Card key={p.id || idx} className="border-[#E8DDD5] overflow-hidden">
                <div className="bg-[#591427] p-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-sm">
                    {p.id || idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">
                      Pregunta de clienta
                    </p>
                    {p.servicio && (
                      <p className="text-white/70 text-xs">{p.servicio}</p>
                    )}
                  </div>
                </div>
                <CardContent className="p-5 space-y-4">
                  {/* Question */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wide flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> Pregunta de la clienta
                    </p>
                    <div className="bg-[#FFFBF0] p-4 rounded-xl text-sm text-[#2A1520] border border-[#E8DDD5] italic">
                      "{p.pregunta}"
                    </div>
                  </div>

                  {/* Answer */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Tu respuesta
                        <Badge variant="outline" className="ml-1 text-[10px] py-0 border-[#FFF1B5] text-[#FFF1B5]">
                          {modoRespuesta === 'camara' ? '🎬 Cámara' : '📝 Texto'}
                        </Badge>
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyField(`respuesta-${p.id || idx}`, p.respuesta)}
                        className="text-[#C1DBE8] hover:bg-[#F5F0EB] h-7"
                      >
                        {copiedField === `respuesta-${p.id || idx}` ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedField === `respuesta-${p.id || idx}` ? 'Copiado' : 'Copiar'}
                      </Button>
                    </div>
                    <div className="bg-gradient-to-br from-[#FFFBF0] to-[#F5F0EB] p-4 rounded-xl text-sm text-[#2A1520] leading-relaxed border border-[#E8DDD5]">
                      {p.respuesta}
                    </div>
                  </div>

                  {/* Copy question+answer together */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyField(
                      `pair-${p.id || idx}`,
                      `P: ${p.pregunta}\n\nR: ${p.respuesta}`
                    )}
                    className="text-[#591427] hover:bg-[#FFFBF0] h-7"
                  >
                    {copiedField === `pair-${p.id || idx}` ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    Copiar pregunta + respuesta
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action buttons */}
          <Card className="border-[#E8DDD5]">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleCopyAll}
                  className="bg-[#C1DBE8] hover:bg-[#8BB8D0] text-[#2A1520] h-11"
                >
                  {copiedField === 'all' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedField === 'all' ? '¡Todo copiado!' : 'Copiar todo'}
                </Button>
                <Button
                  onClick={handleSaveToLibrary}
                  className="bg-[#591427] hover:bg-[#7A2A40] text-white h-11"
                >
                  {savedToLibrary ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {savedToLibrary ? '¡Guardado!' : 'Guardar en biblioteca'}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  variant="outline"
                  className="border-[#FFF1B5] text-[#FFF1B5] hover:bg-[#FFFBF0] h-11"
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
