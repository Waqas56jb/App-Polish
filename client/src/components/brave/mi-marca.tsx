'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore, BrandProfile } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BravyBot } from '@/components/brave/bravy-bot'
import {
  Crown, Mic, Save, Sparkles, CheckCircle2, Upload, FileText,
  ListChecks, Loader2, FileUp, X, RefreshCw, Square, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react'
import { fetchJSON } from '@/lib/fetch-safe'
import { toast } from 'sonner'

// ============================================================
// MI MARCA — Versión simplificada
// 3 opciones para crear/actualizar la marca:
//   1. Audio + leer preguntas (recomendada, primera)
//   2. Subir documento
//   3. Pegar texto
// Después: ficha completa + abajo opciones de actualizar
// ============================================================

// ─── Preguntas que se muestran mientras se graba audio ──────
const PREGUNTAS = [
  '¿Cuál es tu nombre y el nombre de tu salón?',
  '¿En qué ciudad estás y cuál es tu Instagram?',
  '¿Cuántos años de experiencia tienes?',
  '¿Qué servicios ofreces?',
  '¿Qué 3 servicios quieres potenciar más?',
  '¿Cómo es tu clienta ideal? (edad, estilo, presupuesto)',
  '¿Qué facturación mensual tienes ahora?',
  '¿Qué facturación quieres conseguir?',
  '¿Cuántos trabajadores hay en tu salón?',
  '¿Cuáles son tus objetivos con el contenido?',
  '¿Qué te preguntan frecuentemente tus clientas?',
  '¿Qué errores frecuentes ves en tus clientas?',
  '¿Qué tan cómoda te sientes hablando a cámara?',
] as const

type Metodo = 'audio' | 'documento' | 'texto'

export function MiMarca() {
  const { brandProfile, setBrandProfile } = useAppStore()

  // Estado de la ficha actual
  const [form, setForm] = useState<BrandProfile>(brandProfile || emptyProfile())
  const [saved, setSaved] = useState(false)

  // Método activo
  const [metodo, setMetodo] = useState<Metodo>('audio')

  // Audio
  const [isRecording, setIsRecording] = useState(false)
  const [audioTranscript, setAudioTranscript] = useState('')
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  // Documento
  const [documentText, setDocumentText] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Texto pegado
  const [pastedText, setPastedText] = useState('')

  // Ficha expandible
  const [fichaExpanded, setFichaExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // ─── Helpers ───
  function emptyProfile(): BrandProfile {
    return {
      nombre: '', salon: '', ciudad: '', instagram: '',
      experiencia: '', servicios: [], serviciosPrioritarios: [],
      objetivos: '', clientaIdeal: '', preguntasFrecuentes: '',
      erroresFrecuentes: '', nivelCamara: '', facturacion: '',
      documentText: '', documentName: '',
    }
  }

  const isComplete = form.nombre && form.salon && form.servicios.length > 0

  // ─── Audio recording con Web Speech API (transcripción en vivo) ───
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = true
    recognition.interimResults = true

    let finalTranscript = audioTranscript

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interim += transcript
        }
      }
      setAudioTranscript(finalTranscript + interim)
    }

    recognition.onerror = (e: any) => {
      console.error('Speech error:', e)
      toast.error('Error de reconocimiento. Intenta de nuevo.')
      setIsRecording(false)
    }

    recognition.onend = () => {
      // Si todavía está en modo recording, reiniciar (continuous)
      if (isRecording) {
        try { recognition.start() } catch {}
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    toast.success('Grabando... Responde las preguntas en voz alta')
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    setIsRecording(false)
    toast.success('Grabación finalizada')
  }

  // ─── Subir archivo de audio para transcripción vía API ───
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('audio', file)
      const res = await fetch('/api/asr', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.text) {
        setAudioTranscript(prev => (prev ? prev + ' ' : '') + data.text)
        toast.success('Audio transcrito')
      } else {
        toast.error('No se pudo transcribir el audio')
      }
    } catch (err) {
      toast.error('Error al transcribir')
    } finally {
      setIsTranscribing(false)
    }
  }

  // ─── Generar ficha desde el texto (audio, documento o pegado) ───
  const generarFicha = async () => {
    let texto = ''
    if (metodo === 'audio') texto = audioTranscript
    else if (metodo === 'documento') texto = documentText
    else if (metodo === 'texto') texto = pastedText

    if (!texto.trim()) {
      toast.error('Primero necesito el contenido (graba, sube o pega tu texto)')
      return
    }

    setIsExtracting(true)
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'extract-brand',
          context: { documentText: texto },
        }),
      })

      if (data?.result && !data.result.raw) {
        const e = data.result
        const newForm: BrandProfile = {
          ...form,
          nombre: e.nombre || form.nombre,
          salon: e.salon || form.salon,
          ciudad: e.ciudad || form.ciudad,
          instagram: e.instagram || form.instagram,
          experiencia: e.experiencia || form.experiencia,
          servicios: Array.isArray(e.servicios) ? e.servicios : (e.servicios ? [e.servicios] : form.servicios),
          serviciosPrioritarios: Array.isArray(e.serviciosPrioritarios) ? e.serviciosPrioritarios : (e.serviciosPrioritarios ? [e.serviciosPrioritarios] : form.serviciosPrioritarios),
          objetivos: e.objetivos || form.objetivos,
          clientaIdeal: e.clientaIdeal || form.clientaIdeal,
          preguntasFrecuentes: e.preguntasFrecuentes || form.preguntasFrecuentes,
          erroresFrecuentes: e.erroresFrecuentes || form.erroresFrecuentes,
          nivelCamara: e.nivelCamara || form.nivelCamara,
          facturacion: e.facturacion || form.facturacion,
          documentText: texto,
          documentName: metodo === 'documento' ? documentName : (metodo === 'audio' ? 'audio-transcripcion' : 'texto-pegado'),
        }
        setForm(newForm)
        setBrandProfile(newForm)
        setSaved(true)
        toast.success('¡Ficha de marca creada!')
        setTimeout(() => setSaved(false), 3000)
      } else {
        toast.error('No pude extraer la información. Intenta con otro método.')
      }
    } catch (error) {
      console.error('Extract error:', error)
      toast.error('Hubo un error. Intenta de nuevo.')
    } finally {
      setIsExtracting(false)
    }
  }

  // ─── Subir documento de texto ───
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDocumentName(file.name)
    if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await file.text()
      setDocumentText(text)
      toast.success('Documento cargado')
    } else {
      toast.info('Para PDF u otros formatos: copia el texto y pégalo en la opción "Pegar texto"')
    }
  }

  // ─── Guardar manualmente la ficha (edición) ───
  const handleSave = () => {
    setBrandProfile(form)
    setSaved(true)
    toast.success('Ficha guardada')
    setTimeout(() => setSaved(false), 3000)
  }

  const updateField = (field: keyof BrandProfile, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const copyField = (field: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copiado')
    setTimeout(() => setCopiedField(null), 2000)
  }

  // ─── Reset al cambiar de método ───
  useEffect(() => {
    if (metodo !== 'audio' && isRecording) stopRecording()
  }, [metodo])

  // ════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full brave-gradient shadow-lg">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <BravyBot expression="happy" size={44} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Mi Marca</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          La información de tu salón. Personaliza todo lo que la IA crea para ti.
        </p>
      </div>

      {/* ─── Selección de método ─── */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          {isComplete ? '¿Cómo quieres actualizar tu marca?' : '¿Cómo quieres crear tu marca?'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'audio' as Metodo, label: 'Audio + Preguntas', icon: <Mic className="w-4 h-4" />, recommended: true },
            { key: 'documento' as Metodo, label: 'Subir documento', icon: <FileUp className="w-4 h-4" /> },
            { key: 'texto' as Metodo, label: 'Pegar texto', icon: <FileText className="w-4 h-4" /> },
          ]).map(m => (
            <button
              key={m.key}
              onClick={() => setMetodo(m.key)}
              className={`relative p-3 rounded-2xl border-2 text-center transition-all ${
                metodo === m.key
                  ? 'border-[#8BAF8D] bg-[#8BAF8D]/5 shadow-md'
                  : 'border-border bg-card hover:border-[#8BAF8D]/30'
              }`}
            >
              {m.recommended && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#E8D5B0] text-[#8BAF8D] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  RECOMENDADO
                </span>
              )}
              <div className={`flex justify-center mb-1 ${metodo === m.key ? 'text-[#8BAF8D]' : 'text-muted-foreground'}`}>
                {m.icon}
              </div>
              <p className={`text-[11px] font-semibold leading-tight ${metodo === m.key ? 'text-[#8BAF8D]' : 'text-foreground'}`}>
                {m.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ════════ MÉTODO 1: AUDIO + PREGUNTAS ════════ */}
      {metodo === 'audio' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Preguntas para leer mientras se graba */}
          <div className="brave-glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4 text-[#C9A96E]" />
              <p className="text-sm font-bold text-foreground">
                Lee estas preguntas y respóndelas en voz alta:
              </p>
            </div>
            <ol className="space-y-1.5 list-decimal list-inside text-sm text-foreground/80">
              {PREGUNTAS.map((p, i) => (
                <li key={i} className="leading-snug">{p}</li>
              ))}
            </ol>
          </div>

          {/* Botón de grabar + transcripción en vivo */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <div className="flex items-center gap-2 justify-center">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="h-12 px-6 rounded-2xl brave-gradient text-white font-semibold text-sm gap-2 shadow-lg"
                >
                  <Mic className="w-4 h-4" />
                  Empezar a grabar
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="h-12 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm gap-2 shadow-lg animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  Parar grabación
                </Button>
              )}
            </div>

            {/* También se puede subir un archivo de audio */}
            <div className="text-center">
              <label className="text-xs text-muted-foreground cursor-pointer hover:text-foreground inline-flex items-center gap-1">
                <Upload className="w-3 h-3" />
                O sube un archivo de audio
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  disabled={isTranscribing}
                />
              </label>
            </div>

            {/* Transcripción en vivo */}
            {audioTranscript && (
              <div className="bg-muted/40 rounded-xl p-3 max-h-32 overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Transcripción:</p>
                <p className="text-sm text-foreground whitespace-pre-line">{audioTranscript}</p>
              </div>
            )}

            {isTranscribing && (
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Transcribiendo audio...
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* ════════ MÉTODO 2: SUBIR DOCUMENTO ════════ */}
      {metodo === 'documento' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              {documentName || 'Pulsa para subir tu documento'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos: .txt, .md (para PDF u otros, copia y pega el texto)
            </p>
          </div>

          {documentText && (
            <div className="bg-muted/40 rounded-xl p-3 max-h-40 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Contenido extraído:</p>
              <p className="text-xs text-foreground whitespace-pre-line">{documentText.substring(0, 500)}...</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ════════ MÉTODO 3: PEGAR TEXTO ════════ */}
      {metodo === 'texto' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Textarea
            placeholder="Pega aquí todo lo que sabes de tu salón: tu nombre, servicios, clienta ideal, facturación, objetivos... Cuanto más detalle, mejor personalizará la IA tu contenido."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="min-h-[200px] rounded-2xl border-border bg-card text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Consejo: pega todo el texto que tengas sobre tu salón, no importa el formato. La IA lo organizará por ti.
          </p>
        </motion.div>
      )}

      {/* ─── Botón principal: generar ficha ─── */}
      <Button
        onClick={generarFicha}
        disabled={isExtracting}
        className="w-full h-12 rounded-2xl brave-gradient text-white font-semibold text-sm gap-2 shadow-lg"
      >
        {isExtracting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Creando tu ficha...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> {isComplete ? 'Actualizar mi ficha' : 'Crear mi ficha de marca'}</>
        )}
      </Button>

      {/* ════════ FICHA DE MARCA (si existe) ════════ */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="brave-glass rounded-2xl overflow-hidden"
        >
          {/* Header ficha */}
          <button
            onClick={() => setFichaExpanded(!fichaExpanded)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full brave-gradient flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{form.nombre} · {form.salon}</p>
                <p className="text-xs text-muted-foreground">
                  {form.ciudad} · {form.servicios.length} servicios
                </p>
              </div>
            </div>
            {fichaExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Ficha expandible */}
          {fichaExpanded && (
            <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-4">
              <Field label="Nombre" value={form.nombre} onChange={(v) => updateField('nombre', v)} onCopy={() => copyField('nombre', form.nombre)} copied={copiedField === 'nombre'} />
              <Field label="Salón" value={form.salon} onChange={(v) => updateField('salon', v)} onCopy={() => copyField('salon', form.salon)} copied={copiedField === 'salon'} />
              <Field label="Ciudad" value={form.ciudad} onChange={(v) => updateField('ciudad', v)} onCopy={() => copyField('ciudad', form.ciudad)} copied={copiedField === 'ciudad'} />
              <Field label="Instagram" value={form.instagram} onChange={(v) => updateField('instagram', v)} onCopy={() => copyField('instagram', form.instagram)} copied={copiedField === 'instagram'} />
              <Field label="Experiencia" value={form.experiencia} onChange={(v) => updateField('experiencia', v)} onCopy={() => copyField('experiencia', form.experiencia)} copied={copiedField === 'experiencia'} />
              <Field label="Servicios" value={Array.isArray(form.servicios) ? form.servicios.join(', ') : ''} onChange={(v) => updateField('servicios', v.split(',').map(s => s.trim()).filter(Boolean))} onCopy={() => copyField('servicios', form.servicios.join(', '))} copied={copiedField === 'servicios'} />
              <Field label="Servicios prioritarios" value={Array.isArray(form.serviciosPrioritarios) ? form.serviciosPrioritarios.join(', ') : ''} onChange={(v) => updateField('serviciosPrioritarios', v.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3))} onCopy={() => copyField('serviciosPrioritarios', form.serviciosPrioritarios.join(', '))} copied={copiedField === 'serviciosPrioritarios'} />
              <Field label="Clienta ideal" value={form.clientaIdeal} onChange={(v) => updateField('clientaIdeal', v)} onCopy={() => copyField('clientaIdeal', form.clientaIdeal)} copied={copiedField === 'clientaIdeal'} textarea />
              <Field label="Facturación actual" value={form.facturacion} onChange={(v) => updateField('facturacion', v)} onCopy={() => copyField('facturacion', form.facturacion)} copied={copiedField === 'facturacion'} />
              <Field label="Objetivos" value={form.objetivos} onChange={(v) => updateField('objetivos', v)} onCopy={() => copyField('objetivos', form.objetivos)} copied={copiedField === 'objetivos'} textarea />
              <Field label="Preguntas frecuentes" value={form.preguntasFrecuentes} onChange={(v) => updateField('preguntasFrecuentes', v)} onCopy={() => copyField('preguntasFrecuentes', form.preguntasFrecuentes)} copied={copiedField === 'preguntasFrecuentes'} textarea />
              <Field label="Errores frecuentes" value={form.erroresFrecuentes} onChange={(v) => updateField('erroresFrecuentes', v)} onCopy={() => copyField('erroresFrecuentes', form.erroresFrecuentes)} copied={copiedField === 'erroresFrecuentes'} textarea />
              <Field label="Comodidad a cámara" value={form.nivelCamara} onChange={(v) => updateField('nivelCamara', v)} onCopy={() => copyField('nivelCamara', form.nivelCamara)} copied={copiedField === 'nivelCamara'} />

              <Button
                onClick={handleSave}
                className="w-full h-10 rounded-xl text-sm gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar cambios
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Banner de éxito ─── */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-sm font-semibold text-emerald-800">¡Ficha guardada!</p>
          <p className="text-xs text-emerald-700 mt-0.5">La IA usará esta información para personalizar tu contenido</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Sub-componente: campo editable con copia ──────────────
function Field({
  label, value, onChange, onCopy, copied, textarea,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onCopy: () => void
  copied: boolean
  textarea?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
        {value && (
          <button
            onClick={onCopy}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        )}
      </div>
      {textarea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[60px] text-sm rounded-xl bg-background"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#C8DEC9]"
        />
      )}
    </div>
  )
}
