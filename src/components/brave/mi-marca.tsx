'use client'

import { useState, useRef } from 'react'
import { useAppStore, BrandProfile } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Crown, Mic, Save, Sparkles, CheckCircle2, Upload, FileText,
  MessageSquareText, ListChecks, Wand2, Loader2, FileUp, X
} from 'lucide-react'

const SERVICIOS_OPTIONS = [
  'Balayage', 'Mechas', 'Tinte', 'Corte', 'Peinado',
  'Alisado', 'Permanente', 'Tratamientos', 'Keratina',
  'Extensiones', 'Canas', 'Decoloración', 'Reflejos',
  'Matizadores', 'Cepillado', 'Recogidos'
]

const NIVEL_CAMARA = [
  'Muy cómoda',
  'Bastante cómoda',
  'Algo incómoda',
  'Nada cómoda'
]

type Tab = 'documento' | 'guiado' | 'formulario'

const GUIDED_QUESTIONS = [
  { key: 'nombre', q: '¿Cuál es tu nombre?', placeholder: 'Ej: Laura García', type: 'text' },
  { key: 'salon', q: '¿Cuál es el nombre de tu salón?', placeholder: 'Ej: Studio Hair', type: 'text' },
  { key: 'ciudad', q: '¿En qué ciudad estás?', placeholder: 'Ej: Madrid', type: 'text' },
  { key: 'instagram', q: '¿Cuál es tu Instagram?', placeholder: '@tuinstagram', type: 'text' },
  { key: 'experiencia', q: '¿Cuántos años de experiencia tienes?', placeholder: 'Ej: 10 años', type: 'text' },
  { key: 'servicios', q: '¿Qué servicios ofreces? (sepáralos por comas)', placeholder: 'Ej: Balayage, Corte, Tratamientos', type: 'text' },
  { key: 'serviciosPrioritarios', q: '¿Qué 3 servicios quieres potenciar más? (sepáralos por comas)', placeholder: 'Ej: Balayage, Canas, Tratamientos', type: 'text' },
  { key: 'objetivos', q: '¿Cuáles son tus objetivos con el contenido?', placeholder: 'Atraer más clientas, posicionarme como experta en balayage...', type: 'textarea' },
  { key: 'clientaIdeal', q: '¿Cómo es tu clienta ideal?', placeholder: 'Edad, estilo, necesidades, presupuesto...', type: 'textarea' },
  { key: 'preguntasFrecuentes', q: '¿Qué preguntas frecuentes te hacen tus clientas?', placeholder: '¿Cuánto dura un balayage? ¿Me quedará bien?...', type: 'textarea' },
  { key: 'erroresFrecuentes', q: '¿Qué errores frecuentes ves en tus clientas?', placeholder: 'Lavar el pelo con agua muy caliente, no usar protección térmica...', type: 'textarea' },
  { key: 'nivelCamara', q: '¿Qué tan cómoda te sientes hablando a cámara?', placeholder: 'Muy cómoda / Bastante cómoda / Algo incómoda / Nada cómoda', type: 'text' },
  { key: 'facturacion', q: '¿Cuál es tu facturación mensual aproximada?', placeholder: 'Ej: 3000€ - 5000€', type: 'text' },
] as const

export function MiMarca() {
  const { brandProfile, setBrandProfile } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('documento')
  const [saved, setSaved] = useState(false)
  const [activeMicField, setActiveMicField] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  const [form, setForm] = useState<BrandProfile>(brandProfile || {
    nombre: '',
    salon: '',
    ciudad: '',
    instagram: '',
    experiencia: '',
    servicios: [],
    serviciosPrioritarios: [],
    objetivos: '',
    clientaIdeal: '',
    preguntasFrecuentes: '',
    erroresFrecuentes: '',
    nivelCamara: '',
    facturacion: '',
    documentText: '',
    documentName: '',
  })

  // Document tab state
  const [documentText, setDocumentText] = useState(form.documentText || '')
  const [documentName, setDocumentName] = useState(form.documentName || '')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Guided tab state
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({
    nombre: form.nombre,
    salon: form.salon,
    ciudad: form.ciudad,
    instagram: form.instagram,
    experiencia: form.experiencia,
    servicios: form.servicios.join(', '),
    serviciosPrioritarios: form.serviciosPrioritarios.join(', '),
    objetivos: form.objetivos,
    clientaIdeal: form.clientaIdeal,
    preguntasFrecuentes: form.preguntasFrecuentes,
    erroresFrecuentes: form.erroresFrecuentes,
    nivelCamara: form.nivelCamara,
    facturacion: form.facturacion,
  })

  const updateField = (field: keyof BrandProfile, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const toggleServicio = (servicio: string, field: 'servicios' | 'serviciosPrioritarios') => {
    const current = form[field]
    const maxItems = field === 'serviciosPrioritarios' ? 3 : 99
    if (current.includes(servicio)) {
      updateField(field, current.filter(s => s !== servicio))
    } else if (current.length < maxItems) {
      updateField(field, [...current, servicio])
    }
  }

  const handleSave = () => {
    setBrandProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleMicClick = (fieldName: string, value: string, onChange: (v: string) => void) => {
    // Use Web Speech API if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (activeMicField === fieldName && isRecording) {
      setIsRecording(false)
      setActiveMicField(null)
      return
    }

    if (!SpeechRecognition) {
      // Fallback: simulate recording
      setActiveMicField(fieldName)
      setIsRecording(true)
      setTimeout(() => {
        setIsRecording(false)
        setActiveMicField(null)
      }, 2500)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onChange(value ? value + ' ' + transcript : transcript)
    }

    recognition.onend = () => {
      setIsRecording(false)
      setActiveMicField(null)
    }

    recognition.onerror = () => {
      setIsRecording(false)
      setActiveMicField(null)
    }

    setActiveMicField(fieldName)
    setIsRecording(true)
    recognition.start()
  }

  // Document tab: handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setDocumentName(file.name)

    if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await file.text()
      setDocumentText(text)
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDFs, show instructions to copy-paste
      setDocumentText('')
      alert('Para archivos PDF: por favor abre tu PDF, copia todo el texto y pégalo en el área de texto de abajo. Esto aseguramos que se extraiga correctamente toda la información.')
    } else {
      // Try reading as text
      try {
        const text = await file.text()
        setDocumentText(text)
      } catch {
        alert('Formato no soportado. Por favor copia y pega el texto directamente.')
      }
    }
  }

  // Document tab: extract structured data via AI
  const handleExtract = async () => {
    if (!documentText.trim()) return
    setIsExtracting(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'extract-brand',
          context: { documentText },
        }),
      })
      const data = await res.json()

      if (data.result && !data.result.raw) {
        const extracted = data.result
        const newForm: BrandProfile = {
          ...form,
          nombre: extracted.nombre || form.nombre,
          salon: extracted.salon || form.salon,
          ciudad: extracted.ciudad || form.ciudad,
          instagram: extracted.instagram || form.instagram,
          experiencia: extracted.experiencia || form.experiencia,
          servicios: Array.isArray(extracted.servicios) ? extracted.servicios : (extracted.servicios ? [extracted.servicios] : form.servicios),
          serviciosPrioritarios: Array.isArray(extracted.serviciosPrioritarios) ? extracted.serviciosPrioritarios : (extracted.serviciosPrioritarios ? [extracted.serviciosPrioritarios] : form.serviciosPrioritarios),
          objetivos: extracted.objetivos || form.objetivos,
          clientaIdeal: extracted.clientaIdeal || form.clientaIdeal,
          preguntasFrecuentes: extracted.preguntasFrecuentes || form.preguntasFrecuentes,
          erroresFrecuentes: extracted.erroresFrecuentes || form.erroresFrecuentes,
          nivelCamara: extracted.nivelCamara || form.nivelCamara,
          facturacion: extracted.facturacion || form.facturacion,
          documentText,
          documentName,
        }
        setForm(newForm)

        // Update guided answers
        setGuidedAnswers({
          nombre: newForm.nombre,
          salon: newForm.salon,
          ciudad: newForm.ciudad,
          instagram: newForm.instagram,
          experiencia: newForm.experiencia,
          servicios: newForm.servicios.join(', '),
          serviciosPrioritarios: newForm.serviciosPrioritarios.join(', '),
          objetivos: newForm.objetivos,
          clientaIdeal: newForm.clientaIdeal,
          preguntasFrecuentes: newForm.preguntasFrecuentes,
          erroresFrecuentes: newForm.erroresFrecuentes,
          nivelCamara: newForm.nivelCamara,
          facturacion: newForm.facturacion,
        })

        setExtracted(true)
        setTimeout(() => setExtracted(false), 4000)
      } else {
        alert('No se pudo extraer la información automáticamente. Por favor completa los campos manualmente en las otras pestañas.')
      }
    } catch (error) {
      console.error('Extract error:', error)
      // Save at least the document text so user can complete manually
      setForm(prev => ({ ...prev, documentText, documentName }))
      alert('Hubo un error al procesar con IA. Tu documento se ha guardado y puedes completar manualmente el formulario.')
    } finally {
      setIsExtracting(false)
    }
  }

  // Guided tab: save answers to form
  const handleGuidedSave = () => {
    const newForm: BrandProfile = {
      ...form,
      nombre: guidedAnswers.nombre || form.nombre,
      salon: guidedAnswers.salon || form.salon,
      ciudad: guidedAnswers.ciudad || form.ciudad,
      instagram: guidedAnswers.instagram || form.instagram,
      experiencia: guidedAnswers.experiencia || form.experiencia,
      servicios: guidedAnswers.servicios ? guidedAnswers.servicios.split(',').map(s => s.trim()).filter(Boolean) : form.servicios,
      serviciosPrioritarios: guidedAnswers.serviciosPrioritarios ? guidedAnswers.serviciosPrioritarios.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) : form.serviciosPrioritarios,
      objetivos: guidedAnswers.objetivos || form.objetivos,
      clientaIdeal: guidedAnswers.clientaIdeal || form.clientaIdeal,
      preguntasFrecuentes: guidedAnswers.preguntasFrecuentes || form.preguntasFrecuentes,
      erroresFrecuentes: guidedAnswers.erroresFrecuentes || form.erroresFrecuentes,
      nivelCamara: guidedAnswers.nivelCamara || form.nivelCamara,
      facturacion: guidedAnswers.facturacion || form.facturacion,
    }
    setForm(newForm)
    setBrandProfile(newForm)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateGuidedAnswer = (key: string, value: string) => {
    setGuidedAnswers(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const isComplete = form.nombre && form.salon && form.servicios.length > 0

  const tabs = [
    { key: 'documento' as Tab, label: 'Subir / Pegar', icon: <FileUp className="w-4 h-4" /> },
    { key: 'guiado' as Tab, label: 'Asistente Guiado', icon: <ListChecks className="w-4 h-4" /> },
    { key: 'formulario' as Tab, label: 'Formulario', icon: <FileText className="w-4 h-4" /> },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full brave-gradient shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[#2D1F22]">Mi Marca BRÄVE</h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Crea tu documento estratégico. Toda la aplicación usará esta información para personalizar tu contenido.
        </p>
      </div>

      {/* Info banner - not mandatory */}
      <Card className="border-l-4 border-l-[#C9A96E] bg-[#FBF7F5] shadow-sm">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#C9A96E] mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-[#2D1F22]">No es obligatorio, pero muy recomendable</p>
            <p className="text-muted-foreground mt-1">
              Puedes empezar a crear contenido sin completar tu marca, pero hacerlo mejorará muchísimo la personalización de todo lo que genera la IA.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[#7D2E42] text-white shadow-md'
                : 'bg-white border-2 border-[#E0D5D1] text-[#2D1F22] hover:border-[#C17C83]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Document Upload / Paste */}
      {activeTab === 'documento' && (
        <div className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22] flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[#C17C83]" />
                Sube o pega tu Documento de Marca
              </CardTitle>
              <CardDescription>
                Si ya tienes un documento de marca creado (con un GPT personalizado u otra herramienta), súbelo aquí y la IA extraerá automáticamente toda la información.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#C17C83]/40 rounded-2xl p-8 text-center cursor-pointer hover:bg-[#FBF7F5] transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-[#C17C83] mx-auto mb-3" />
                <p className="font-medium text-[#2D1F22]">
                  {documentName ? documentName : 'Haz clic para subir tu documento'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: .txt, .md, .pdf (PDF: copia y pega el texto abajo)
                </p>
              </div>

              {/* Paste area */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D1F22] flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-[#C17C83]" />
                  O pega el texto de tu documento aquí
                </label>
                <Textarea
                  placeholder="Pega aquí todo el texto de tu documento de marca..."
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  className="min-h-[200px] border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83] font-mono text-sm"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{documentText.length} caracteres</span>
                  {documentText && (
                    <button
                      onClick={() => { setDocumentText(''); setDocumentName(''); }}
                      className="text-red-400 hover:text-red-600"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* Extract button */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleExtract}
                  disabled={!documentText.trim() || isExtracting}
                  className="flex-1 bg-[#C17C83] hover:bg-[#B06B74] text-white disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extrayendo información con IA...
                    </>
                  ) : extracted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      ¡Información extraída! Revisa en otras pestañas
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Extraer información con IA
                    </>
                  )}
                </Button>
                {documentText.trim() && (
                  <Button
                    onClick={() => {
                      setForm(prev => ({ ...prev, documentText, documentName }))
                      setBrandProfile({ ...form, documentText, documentName })
                      setSaved(true)
                      setTimeout(() => setSaved(false), 3000)
                    }}
                    variant="outline"
                    className="border-[#C17C83] text-[#C17C83] hover:bg-[#F3E8E5]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar texto
                  </Button>
                )}
              </div>

              {extracted && (
                <Card className="border-l-4 border-l-green-500 bg-green-50">
                  <CardContent className="p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      Información extraída con éxito. Revisa y completa lo que falte en las pestañas "Asistente Guiado" o "Formulario".
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Help card */}
          <Card className="border-l-4 border-l-[#C17C83] bg-[#FBF7F5]">
            <CardContent className="p-4">
              <h4 className="font-bold text-[#2D1F22] text-sm flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#C17C83]" />
                ¿No tienes un documento de marca todavía?
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Te recomendamos crearlo con un GPT personalizado que te hará todas las preguntas necesarias. O usa nuestro "Asistente Guiado" donde encontrarás todas las preguntas listadas.
              </p>
              <Button
                onClick={() => setActiveTab('guiado')}
                variant="outline"
                size="sm"
                className="border-[#7D2E42] text-[#7D2E42] hover:bg-[#F3E8E5]"
              >
                <ListChecks className="w-4 h-4 mr-2" />
                Ir al Asistente Guiado
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Guided Questions Assistant */}
      {activeTab === 'guiado' && (
        <div className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22] flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[#C17C83]" />
                Asistente de Preguntas
              </CardTitle>
              <CardDescription>
                Lee cada pregunta y responde con texto o usando el micrófono 🎤. Avanza a tu ritmo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {GUIDED_QUESTIONS.map((item, idx) => {
                const value = guidedAnswers[item.key] || ''
                const isAnswered = value.trim().length > 0
                return (
                  <div
                    key={item.key}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isAnswered
                        ? 'border-[#C9A96E]/40 bg-[#FBF7F5]'
                        : 'border-[#E0D5D1] bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isAnswered ? 'bg-[#C9A96E] text-white' : 'bg-[#F3E8E5] text-[#7D2E42]'
                      }`}>
                        {isAnswered ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-[#2D1F22] block">
                          {item.q}
                        </label>
                      </div>
                    </div>

                    {item.type === 'textarea' ? (
                      <div className="relative pl-10">
                        <Textarea
                          placeholder={item.placeholder}
                          value={value}
                          onChange={(e) => updateGuidedAnswer(item.key, e.target.value)}
                          className="min-h-[80px] pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83] text-sm"
                        />
                        <button
                          onClick={() => handleMicClick(item.key, value, (v) => updateGuidedAnswer(item.key, v))}
                          className={`absolute right-3 top-3 ${activeMicField === item.key && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}
                          title="Responder con voz"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative pl-10">
                        <Input
                          placeholder={item.placeholder}
                          value={value}
                          onChange={(e) => updateGuidedAnswer(item.key, e.target.value)}
                          className="pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83] text-sm"
                        />
                        <button
                          onClick={() => handleMicClick(item.key, value, (v) => updateGuidedAnswer(item.key, v))}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${activeMicField === item.key && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}
                          title="Responder con voz"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {activeMicField === item.key && isRecording && (
                      <p className="text-xs text-red-500 mt-1 pl-10 flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Escuchando... habla ahora
                      </p>
                    )}
                  </div>
                )
              })}

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGuidedSave}
                  className={`px-8 py-5 text-base font-bold rounded-xl shadow-lg ${
                    saved
                      ? 'bg-green-600 hover:bg-green-600'
                      : 'bg-[#7D2E42] hover:bg-[#933A54]'
                    } text-white`}
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      ¡Marca BRÄVE guardada!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Guardar Mi Marca BRÄVE
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Direct Form */}
      {activeTab === 'formulario' && (
        <>
          {/* Basic Info */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22]">Información Básica</CardTitle>
              <CardDescription>Datos de tu salón y tu perfil profesional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D1F22]">Nombre</label>
                  <div className="relative">
                    <Input
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={(e) => updateField('nombre', e.target.value)}
                      className="pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
                    />
                    <button
                      onClick={() => handleMicClick('nombre', form.nombre, (v) => updateField('nombre', v))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${activeMicField === 'nombre' && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D1F22]">Salón</label>
                  <div className="relative">
                    <Input
                      placeholder="Nombre del salón"
                      value={form.salon}
                      onChange={(e) => updateField('salon', e.target.value)}
                      className="pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
                    />
                    <button
                      onClick={() => handleMicClick('salon', form.salon, (v) => updateField('salon', v))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${activeMicField === 'salon' && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D1F22]">Ciudad</label>
                  <Input
                    placeholder="Tu ciudad"
                    value={form.ciudad}
                    onChange={(e) => updateField('ciudad', e.target.value)}
                    className="border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D1F22]">Instagram</label>
                  <Input
                    placeholder="@tuinstagram"
                    value={form.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                    className="border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D1F22]">Años de experiencia</label>
                <Input
                  placeholder="Ej: 10 años"
                  value={form.experiencia}
                  onChange={(e) => updateField('experiencia', e.target.value)}
                  className="border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22]">Servicios</CardTitle>
              <CardDescription>Selecciona los servicios que ofreces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SERVICIOS_OPTIONS.map((servicio) => (
                  <button
                    key={servicio}
                    onClick={() => toggleServicio(servicio, 'servicios')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      form.servicios.includes(servicio)
                        ? 'bg-[#C17C83] text-white shadow-md'
                        : 'bg-[#F3E8E5] text-[#2D1F22] hover:bg-[#E0D5D1]'
                    }`}
                  >
                    {servicio}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-[#2D1F22] mb-2 block">
                  Servicios Prioritarios <span className="text-muted-foreground font-normal">(máximo 3)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICIOS_OPTIONS.filter(s => form.servicios.includes(s)).map((servicio) => (
                    <button
                      key={servicio}
                      onClick={() => toggleServicio(servicio, 'serviciosPrioritarios')}
                      disabled={!form.serviciosPrioritarios.includes(servicio) && form.serviciosPrioritarios.length >= 3}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        form.serviciosPrioritarios.includes(servicio)
                          ? 'bg-[#7D2E42] text-white shadow-md'
                          : 'bg-white border-2 border-[#E0D5D1] text-[#2D1F22] hover:border-[#C17C83]'
                      } ${!form.serviciosPrioritarios.includes(servicio) && form.serviciosPrioritarios.length >= 3 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {servicio}
                    </button>
                  ))}
                </div>
                {form.serviciosPrioritarios.length === 0 && form.servicios.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Selecciona los 3 servicios que más quieres potenciar</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Strategy */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22]">Estrategia</CardTitle>
              <CardDescription>Información clave para personalizar tu contenido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'objetivos' as const, label: 'Objetivos', placeholder: '¿Qué quieres lograr con tu contenido?' },
                { key: 'clientaIdeal' as const, label: 'Clienta ideal', placeholder: 'Describe a tu clienta ideal' },
                { key: 'preguntasFrecuentes' as const, label: 'Preguntas frecuentes', placeholder: '¿Qué te preguntan siempre?' },
                { key: 'erroresFrecuentes' as const, label: 'Errores frecuentes', placeholder: '¿Qué errores ves que cometen tus clientas?' },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium text-[#2D1F22]">{field.label}</label>
                  <div className="relative">
                    <Textarea
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="min-h-[80px] pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
                    />
                    <button
                      onClick={() => handleMicClick(field.key, form[field.key], (v) => updateField(field.key, v))}
                      className={`absolute right-3 top-3 ${activeMicField === field.key && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comfort Level */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22]">Comodidad a Cámara</CardTitle>
              <CardDescription>Esto ayudará a adaptar el tipo de contenido que te recomendamos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {NIVEL_CAMARA.map((nivel) => (
                  <button
                    key={nivel}
                    onClick={() => updateField('nivelCamara', nivel)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                      form.nivelCamara === nivel
                        ? 'bg-[#7D2E42] text-white shadow-md'
                        : 'bg-white border-2 border-[#E0D5D1] text-[#2D1F22] hover:border-[#C17C83]'
                    }`}
                  >
                    {nivel}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-[#2D1F22]">Facturación aproximada mensual</label>
                <Input
                  placeholder="Ej: 3000€ - 5000€"
                  value={form.facturacion}
                  onChange={(e) => updateField('facturacion', e.target.value)}
                  className="border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-2 pb-4">
            <Button
              onClick={handleSave}
              className={`px-8 py-6 text-base font-bold rounded-xl shadow-lg transition-all duration-200 ${
                saved
                  ? 'bg-green-600 hover:bg-green-600 text-white'
                  : 'bg-[#7D2E42] hover:bg-[#933A54] text-white'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  ¡Documento BRÄVE guardado!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Mi Marca BRÄVE
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Brand Profile Summary - always visible if exists */}
      {brandProfile && (brandProfile.nombre || brandProfile.salon || brandProfile.documentText) && (
        <Card className="border-l-4 border-l-[#C9A96E] shadow-md bg-[#FBF7F5]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-[#2D1F22]">
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
              Tu Documento BRÄVE actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{brandProfile.nombre || '—'}</span></div>
              <div><span className="text-muted-foreground">Salón:</span> <span className="font-medium">{brandProfile.salon || '—'}</span></div>
              <div><span className="text-muted-foreground">Ciudad:</span> <span className="font-medium">{brandProfile.ciudad || '—'}</span></div>
              <div><span className="text-muted-foreground">Experiencia:</span> <span className="font-medium">{brandProfile.experiencia || '—'}</span></div>
            </div>
            {brandProfile.servicios && brandProfile.servicios.length > 0 && (
              <div className="mt-3">
                <span className="text-muted-foreground text-sm">Servicios:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {brandProfile.servicios.map(s => (
                    <Badge key={s} variant="secondary" className="bg-[#F3E8E5] text-[#2D1F22] text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {brandProfile.serviciosPrioritarios && brandProfile.serviciosPrioritarios.length > 0 && (
              <div className="mt-2">
                <span className="text-muted-foreground text-sm">Prioritarios:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {brandProfile.serviciosPrioritarios.map(s => (
                    <Badge key={s} className="bg-[#7D2E42] text-white text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {brandProfile.documentText && (
              <div className="mt-3 pt-3 border-t border-[#E0D5D1]">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Documento subido: {brandProfile.documentName || 'texto pegado'} ({brandProfile.documentText.length} caracteres)
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
