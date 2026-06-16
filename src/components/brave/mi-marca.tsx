'use client'

import { useState } from 'react'
import { useAppStore, BrandProfile } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Mic, Save, Sparkles, CheckCircle2 } from 'lucide-react'

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

export function MiMarca() {
  const { brandProfile, setBrandProfile } = useAppStore()
  const [isRecording, setIsRecording] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)

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

  const handleMicClick = (fieldName: string) => {
    if (activeField === fieldName && isRecording) {
      setIsRecording(false)
      setActiveField(null)
      return
    }
    setActiveField(fieldName)
    setIsRecording(true)
    // Simulate recording for now - in production this would use Web Speech API
    setTimeout(() => {
      setIsRecording(false)
      setActiveField(null)
    }, 3000)
  }

  const isComplete = form.nombre && form.salon && form.servicios.length > 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full brave-gradient shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[#2D1F22]">Mi Marca BRÄVE</h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Crea tu documento estratégico. Toda la aplicación usará esta información para generar contenido personalizado.
        </p>
      </div>

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
                  onClick={() => handleMicClick('nombre')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${activeField === 'nombre' && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}
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
                <button onClick={() => handleMicClick('salon')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${activeField === 'salon' && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D1F22]">Objetivos</label>
            <div className="relative">
              <Textarea
                placeholder="¿Qué quieres lograr con tu contenido? Ej: Atraer más clientas, posicionarme como experta en balayage..."
                value={form.objetivos}
                onChange={(e) => updateField('objetivos', e.target.value)}
                className="min-h-[80px] pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
              />
              <button onClick={() => handleMicClick('objetivos')} className={`absolute right-3 top-3 ${activeField === 'objetivos' && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}>
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D1F22]">Clienta ideal</label>
            <div className="relative">
              <Textarea
                placeholder="Describe a tu clienta ideal: edad, estilo, necesidades, presupuesto..."
                value={form.clientaIdeal}
                onChange={(e) => updateField('clientaIdeal', e.target.value)}
                className="min-h-[80px] pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
              />
              <button onClick={() => handleMicClick('clientaIdeal')} className={`absolute right-3 top-3 ${activeField === 'clientaIdeal' && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}>
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D1F22]">Preguntas frecuentes de tus clientas</label>
            <div className="relative">
              <Textarea
                placeholder="¿Qué te preguntan siempre? Ej: ¿Cuánto dura un balayage? ¿Me quedará bien?"
                value={form.preguntasFrecuentes}
                onChange={(e) => updateField('preguntasFrecuentes', e.target.value)}
                className="min-h-[80px] pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
              />
              <button onClick={() => handleMicClick('preguntasFrecuentes')} className={`absolute right-3 top-3 ${activeField === 'preguntasFrecuentes' && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}>
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D1F22]">Errores frecuentes</label>
            <div className="relative">
              <Textarea
                placeholder="¿Qué errores ves que cometen tus clientas? Ej: Lavar el pelo con agua muy caliente..."
                value={form.erroresFrecuentes}
                onChange={(e) => updateField('erroresFrecuentes', e.target.value)}
                className="min-h-[80px] pr-10 border-[#E0D5D1] focus:border-[#C17C83] focus:ring-[#C17C83]"
              />
              <button onClick={() => handleMicClick('erroresFrecuentes')} className={`absolute right-3 top-3 ${activeField === 'erroresFrecuentes' && isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-[#C17C83]'}`}>
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
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
      <div className="flex justify-center pt-2 pb-8">
        <Button
          onClick={handleSave}
          disabled={!isComplete}
          className={`px-8 py-6 text-base font-bold rounded-xl shadow-lg transition-all duration-200 ${
            saved
              ? 'bg-green-600 hover:bg-green-600 text-white'
              : 'bg-[#7D2E42] hover:bg-[#933A54] text-white'
          } ${!isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Brand Profile Summary */}
      {brandProfile && (
        <Card className="border-l-4 border-l-[#C9A96E] shadow-md bg-[#FBF7F5]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-[#2D1F22]">
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
              Tu Documento BRÄVE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{brandProfile.nombre}</span></div>
              <div><span className="text-muted-foreground">Salón:</span> <span className="font-medium">{brandProfile.salon}</span></div>
              <div><span className="text-muted-foreground">Ciudad:</span> <span className="font-medium">{brandProfile.ciudad}</span></div>
              <div><span className="text-muted-foreground">Experiencia:</span> <span className="font-medium">{brandProfile.experiencia}</span></div>
            </div>
            {brandProfile.servicios.length > 0 && (
              <div className="mt-3">
                <span className="text-muted-foreground text-sm">Servicios:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {brandProfile.servicios.map(s => (
                    <Badge key={s} variant="secondary" className="bg-[#F3E8E5] text-[#2D1F22] text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {brandProfile.serviciosPrioritarios.length > 0 && (
              <div className="mt-2">
                <span className="text-muted-foreground text-sm">Prioritarios:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {brandProfile.serviciosPrioritarios.map(s => (
                    <Badge key={s} className="bg-[#7D2E42] text-white text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
