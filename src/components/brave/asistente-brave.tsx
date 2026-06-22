'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore, AsistenteMessage, generateId, RoadmapScore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles,
  Send,
  Mic,
  Square,
  Loader2,
  Trash2,
  Bot,
  User,
  Volume2,
  X,
  Lightbulb,
  RefreshCw,
} from 'lucide-react'
import { fetchJSON } from '@/lib/fetch-safe'

const SUGERENCIAS_RAPIDAS = [
  'No sé qué publicar hoy',
  'Dame ideas para stories',
  'Quiero grabar reels esta semana',
  '¿Qué debería mejorar primero?',
  'Ayúdame con un guion',
  'Estoy bloqueada',
  'Quiero atraer más clientas',
  'Necesito organizar mi día de grabación',
]

// Mensaje de bienvenida inicial si no hay historial
const MENSAJE_BIENVENIDA: AsistenteMessage = {
  id: 'welcome-brave',
  rol: 'assistant',
  texto: '¡Hola! Soy tu Asistente BRÄVE. Estoy aquí para acompañarte cuando no sepas qué publicar, qué grabar o qué mejorar. Cuéntame qué te trae por aquí hoy o elige una de las sugerencias de abajo.',
  modo: 'texto',
  timestamp: Date.now(),
  sugerencias: SUGERENCIAS_RAPIDAS.slice(0, 4),
}

// Calcula el roadmap a partir del estado de la marca y la biblioteca
function calcularRoadmap(
  brandProfile: any,
  libraryItems: any[],
  savedHooks: any[],
  contentPlans: any[],
  override: RoadmapScore | null
): RoadmapScore {
  if (override) return override

  // Puntuaciones base
  let comunicacion = 3
  let stories = 3
  let constancia = 2
  let autoridad = 3
  let ventas = 3

  // Comunicación: sube si la estilista tiene perfil de marca configurado y nivel de cámara alto
  if (brandProfile) {
    comunicacion += 2
    const nivel = (brandProfile.nivelCamara || '').toLowerCase()
    if (nivel.includes('muy')) comunicacion += 3
    else if (nivel.includes('bastante')) comunicacion += 2
    else if (nivel.includes('algo')) comunicacion += 1
    else if (nivel.includes('nada')) comunicacion += 0
  }

  // Stories: sube si hay stories en la biblioteca
  const storiesCount = libraryItems.filter(i => i.tipo === 'story').length
  stories += Math.min(storiesCount, 5)

  // Constancia: sube si hay planes de contenido y muchos items guardados
  constancia += Math.min(contentPlans.length * 2, 4)
  constancia += Math.min(Math.floor((libraryItems.length + savedHooks.length) / 3), 4)

  // Autoridad: sube si los items tienen objetivo autoridad
  const autoridadItems = libraryItems.filter(i => (i.objetivo || '').toLowerCase() === 'autoridad').length
  autoridad += Math.min(autoridadItems, 4)

  // Ventas: sube si hay items con objetivo reservas y savedHooks publicados
  const ventasItems = libraryItems.filter(i => (i.objetivo || '').toLowerCase() === 'reservas').length
  ventas += Math.min(ventasItems, 3)
  const publicados = savedHooks.filter(h => h.estado === 'publicado').length
  ventas += Math.min(publicados, 3)

  return {
    comunicacion: Math.min(comunicacion, 10),
    stories: Math.min(stories, 10),
    constancia: Math.min(constancia, 10),
    autoridad: Math.min(autoridad, 10),
    ventas: Math.min(ventas, 10),
  }
}

function extraerSugerencias(texto: string): string[] | undefined {
  const match = texto.match(/SUGERENCIAS:\s*([\s\S]*?)$/i)
  if (!match) return undefined
  const lines = match[1]
    .split('\n')
    .map(l => l.replace(/^[\s·\-*\d\.\)]+/, '').trim())
    .filter(l => l.length > 5 && l.length < 120)
  if (lines.length === 0) return undefined
  return lines.slice(0, 4)
}

function limpiarRespuesta(texto: string): string {
  // Quita la sección SUGERENCIAS del cuerpo visible
  return texto.replace(/SUGERENCIAS:\s*[\s\S]*$/i, '').trim()
}

interface AsistenteBraveProps {
  // Si es "compacto", se renderiza dentro del panel flotante (sin cabecera grande).
  compacto?: boolean
  onClose?: () => void
}

export function AsistenteBrave({ compacto = false, onClose }: AsistenteBraveProps) {
  const {
    brandProfile,
    libraryItems,
    savedHooks,
    contentPlans,
    roadmapOverride,
    asistenteMensajes,
    addAsistenteMensaje,
    clearAsistenteMensajes,
  } = useAppStore()

  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [grabando, setGrabando] = useState(false)
  const [transcribiendo, setTranscribiendo] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // Inicializa con mensaje de bienvenida si está vacío
  const mensajes = asistenteMensajes.length === 0 ? [MENSAJE_BIENVENIDA] : asistenteMensajes

  // Auto-scroll al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes, enviando])

  const roadmap = calcularRoadmap(brandProfile, libraryItems, savedHooks, contentPlans, roadmapOverride)

  const enviarMensaje = useCallback(async (texto: string, modo: 'texto' | 'audio' = 'texto') => {
    if (!texto.trim() || enviando) return
    setEnviando(true)

    const msgUser: AsistenteMessage = {
      id: generateId(),
      rol: 'user',
      texto: texto.trim(),
      modo,
      timestamp: Date.now(),
    }
    addAsistenteMensaje(msgUser)
    setInput('')

    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'asistente-brave',
          brandProfile,
          context: {
            mensaje: texto,
            historial: asistenteMensajes.slice(-6).map(m => ({ rol: m.rol, texto: m.texto })),
            roadmap,
          },
        }),
      })
      if (error) throw new Error(error)
      const result = data?.result
      // El endpoint devuelve { raw: 'texto plano' } cuando la respuesta no es JSON
      const textoRespuesta = typeof result === 'string'
        ? result
        : (result?.raw || result?.texto || result?.respuesta || JSON.stringify(result))
      const sugerencias = extraerSugerencias(textoRespuesta)
      const textoLimpio = limpiarRespuesta(textoRespuesta)

      const msgAsistente: AsistenteMessage = {
        id: generateId(),
        rol: 'assistant',
        texto: textoLimpio || textoRespuesta,
        modo: 'texto',
        timestamp: Date.now(),
        sugerencias,
      }
      addAsistenteMensaje(msgAsistente)
    } catch (e: any) {
      const msgError: AsistenteMessage = {
        id: generateId(),
        rol: 'assistant',
        texto: 'Disculpa, tuve un problema técnico. ¿Puedes repetirme qué necesitas? También puedes escribir a soporte si persiste.',
        modo: 'texto',
        timestamp: Date.now(),
      }
      addAsistenteMensaje(msgError)
    } finally {
      setEnviando(false)
    }
  }, [asistenteMensajes, addAsistenteMensaje, brandProfile, enviando, roadmap])

  // Grabación de audio con MediaRecorder
  const iniciarGrabacion = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      audioChunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size > 0 && audioChunksRef.current) {
          audioChunksRef.current.push(e.data)
        }
      }
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current || [], { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        // Transcribir
        setTranscribiendo(true)
        try {
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1]
            try {
              const { data, error } = await fetchJSON('/api/asr', {
                method: 'POST',
                body: JSON.stringify({ audioBase64: base64 }),
              })
              if (!error) {
                const texto = (data as any)?.text || ''
                if (texto.trim()) {
                  await enviarMensaje(texto, 'audio')
                }
              }
            } catch (e) {
              console.error(e)
            } finally {
              setTranscribiendo(false)
            }
          }
          reader.readAsDataURL(blob)
        } catch (e) {
          setTranscribiendo(false)
        }
      }
      mr.start()
      mediaRecorderRef.current = mr
      setGrabando(true)
    } catch (e) {
      console.error('No se pudo acceder al micrófono:', e)
      alert('No se pudo acceder al micrófono. Comprueba los permisos del navegador.')
    }
  }, [enviarMensaje])

  const detenerGrabacion = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setGrabando(false)
  }, [])

  const handleSend = () => {
    enviarMensaje(input, 'texto')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSugerencia = (s: string) => {
    enviarMensaje(s, 'texto')
  }

  return (
    <div className={`flex flex-col ${compacto ? 'h-[70vh] sm:h-[600px]' : 'h-[calc(100vh-200px)] min-h-[500px]'}`}>
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl brave-gradient shadow-lg flex items-center justify-center shrink-0">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2A1520]">Asistente BRÄVE</h2>
            <p className="text-sm text-[#591427]/70 mt-1">
              Pregúntame qué publicar, cómo avanzar o qué mejorar hoy.
            </p>
          </div>
        </div>
        {compacto && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[#2A1520]">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Roadmap compacto */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F5F0EB] mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60">
            Tu roadmap BRÄVE
          </p>
          <p className="text-[10px] text-[#591427]/50">
            Te recomiendo enfocarte en lo más bajo
          </p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: 'comunicacion', label: 'Comunicación' },
            { key: 'stories', label: 'Stories' },
            { key: 'constancia', label: 'Constancia' },
            { key: 'autoridad', label: 'Autoridad' },
            { key: 'ventas', label: 'Ventas' },
          ].map(area => {
            const score = (roadmap as any)[area.key] as number
            const pct = Math.min(score * 10, 100)
            const isWeak = score <= 4
            return (
              <div key={area.key} className="text-center">
                <div className="h-1.5 bg-[#F5F0EB] rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full ${isWeak ? 'bg-[#C1DBE8]' : 'bg-[#FFF1B5]'}`}
                    style={{ width: pct + '%' }}
                  />
                </div>
                <p className="text-[10px] font-medium text-[#2A1520]">{area.label}</p>
                <p className="text-[10px] text-[#591427]/60">{score}/10</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-[#F5F0EB] p-4 space-y-4"
      >
        {mensajes.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.rol === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              m.rol === 'user'
                ? 'bg-[#FFF1B5] text-[#2A1520]'
                : 'brave-gradient text-white'
            }`}>
              {m.rol === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[78%] ${m.rol === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.rol === 'user'
                  ? 'bg-[#FFF1B5] text-[#2A1520] rounded-tr-sm'
                  : 'bg-[#FFFBF0] text-[#2A1520] rounded-tl-sm border border-[#F5F0EB]'
              }`}>
                {m.texto}
                {m.modo === 'audio' && m.rol === 'user' && (
                  <span className="inline-flex items-center gap-1 ml-2 text-[10px] text-[#2A1520]/60">
                    <Volume2 className="w-3 h-3" /> enviado por audio
                  </span>
                )}
              </div>
              {m.sugerencias && m.sugerencias.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.sugerencias.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSugerencia(s)}
                      disabled={enviando}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[#FFF1B5]/40 text-[#591427] hover:bg-[#FFF1B5]/10 transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {enviando && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full brave-gradient flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[#FFFBF0] border border-[#F5F0EB] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#591427]" />
              <span className="text-sm text-[#591427]">Pensando...</span>
            </div>
          </div>
        )}

        {transcribiendo && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C1DBE8] flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[#FFFBF0] border border-[#F5F0EB] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#591427]" />
              <span className="text-sm text-[#591427]">Transcribiendo tu audio...</span>
            </div>
          </div>
        )}
      </div>

      {/* Sugerencias rápidas (cuando no hay historial) */}
      {asistenteMensajes.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGERENCIAS_RAPIDAS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSugerencia(s)}
              disabled={enviando}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#FFF1B5]/40 text-[#591427] hover:bg-[#FFF1B5]/10 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Lightbulb className="w-3 h-3" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Acciones: limpiar conversación */}
      {asistenteMensajes.length > 0 && (
        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('¿Vaciar la conversación con el asistente?')) {
                clearAsistenteMensajes()
              }
            }}
            className="text-[#591427]/60 hover:text-[#591427] text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1.5" /> Vaciar conversación
          </Button>
        </div>
      )}

      {/* Entrada */}
      <div className="mt-3 bg-white rounded-2xl shadow-sm border border-[#F5F0EB] p-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta o cuéntame qué te pasa hoy..."
            disabled={enviando || grabando || transcribiendo}
            className="flex-1 resize-none border-0 min-h-[44px] max-h-[120px] focus-visible:ring-0 bg-transparent text-sm"
            rows={1}
          />
          <Button
            onClick={grabando ? detenerGrabacion : iniciarGrabacion}
            disabled={enviando || transcribiendo}
            className={`shrink-0 ${grabando ? 'bg-[#C1DBE8] hover:bg-[#8BB8D0]' : 'bg-[#591427] hover:bg-[#3D0E1B]'}`}
            size="icon"
            title={grabando ? 'Detener grabación' : 'Enviar audio'}
          >
            {grabando ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || enviando || grabando || transcribiendo}
            className="shrink-0 brave-gradient hover:opacity-90"
            size="icon"
            title="Enviar"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#591427]/50">
          <span>Enter para enviar · Shift+Enter para nueva línea</span>
          {grabando && (
            <span className="text-[#C1DBE8] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#C1DBE8] rounded-full animate-pulse" />
              Grabando audio
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
