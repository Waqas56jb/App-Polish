'use client'

import { useState } from 'react'
import { useAppStore, ContentItem, ContentPlan, generateId } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar, RefreshCw, Edit3, Save, FileText,
  CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react'

const OBJETIVOS = [
  { value: 'autoridad', label: 'Autoridad', desc: 'Posicionarte como experta' },
  { value: 'reservas', label: 'Reservas', desc: 'Conseguir más citas' },
  { value: 'visibilidad', label: 'Visibilidad', desc: 'Llegar a más gente' },
]

const FRECUENCIAS = [2, 3, 4, 5]

export function Planificar() {
  const { brandProfile, contentPlans, addContentPlan, addLibraryItems, setActiveModule, setCrearSubModule, setIsLoading, isLoading } = useAppStore()
  const [tipo, setTipo] = useState<'semanal' | 'mensual'>('semanal')
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([])
  const [frecuencia, setFrecuencia] = useState(3)
  const [objetivo, setObjetivo] = useState('')
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([])
  const [showResults, setShowResults] = useState(false)

  const servicios = brandProfile?.serviciosPrioritarios || brandProfile?.servicios || []

  const toggleServicio = (s: string) => {
    if (serviciosSeleccionados.includes(s)) {
      setServiciosSeleccionados(prev => prev.filter(x => x !== s))
    } else if (serviciosSeleccionados.length < 3) {
      setServiciosSeleccionados(prev => [...prev, s])
    }
  }

  const handleGenerate = async () => {
    if (!objetivo || serviciosSeleccionados.length === 0) return

    setIsLoading(true, 'Generando tu planificación...')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          brandProfile,
          context: {
            tipo,
            servicios: serviciosSeleccionados,
            frecuencia,
            objetivo,
          },
        }),
      })

      const data = await res.json()
      const items: ContentItem[] = []

      if (Array.isArray(data.result)) {
        data.result.forEach((item: any) => {
          const contentItem: ContentItem = {
            id: generateId(),
            tipo: item.tipo || 'reel',
            titulo: item.titulo || 'Sin título',
            objetivo: item.objetivo || objetivo,
            servicio: item.servicio || serviciosSeleccionados[0] || '',
            guion: '',
            copy: '',
            hashtags: '',
            textoPortada: '',
            formato: '',
            estado: 'borrador',
            fecha: item.dia || '',
            slides: [],
            storiesData: [],
            planId: '',
            createdAt: new Date().toISOString(),
          }
          items.push(contentItem)
        })
      } else if (data.result?.raw) {
        // Fallback: create sample items
        const dias = tipo === 'semanal'
          ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          : ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']

        let dayIndex = 0
        for (let i = 0; i < frecuencia * (tipo === 'mensual' ? 4 : 1); i++) {
          const day = dias[dayIndex % dias.length]
          dayIndex += Math.floor(7 / frecuencia)
          items.push({
            id: generateId(),
            tipo: i % 3 === 0 ? 'carrusel' : 'reel',
            titulo: `Contenido sobre ${serviciosSeleccionados[i % serviciosSeleccionados.length]}`,
            objetivo,
            servicio: serviciosSeleccionados[i % serviciosSeleccionados.length],
            guion: '',
            copy: '',
            hashtags: '',
            textoPortada: '',
            formato: '',
            estado: 'borrador',
            fecha: day,
            slides: [],
            storiesData: [],
            planId: '',
            createdAt: new Date().toISOString(),
          })
        }
      }

      setGeneratedContent(items)
      setShowResults(true)
    } catch (error) {
      console.error('Error:', error)
      // Generate fallback content
      const items: ContentItem[] = []
      const dias = ['Martes', 'Jueves', 'Domingo']
      const tipos: ('reel' | 'carrusel' | 'story')[] = ['reel', 'carrusel', 'reel']

      for (let i = 0; i < frecuencia; i++) {
        items.push({
          id: generateId(),
          tipo: tipos[i % 3],
          titulo: `Idea ${i + 1}: ${serviciosSeleccionados[i % serviciosSeleccionados.length]} - ${objetivo}`,
          objetivo,
          servicio: serviciosSeleccionados[i % serviciosSeleccionados.length],
          guion: '',
          copy: '',
          hashtags: '',
          textoPortada: '',
          formato: '',
          estado: 'borrador',
          fecha: tipo === 'semanal' ? dias[i % 3] : `Semana ${Math.floor(i / frecuencia) + 1}`,
          slides: [],
          storiesData: [],
          planId: '',
          createdAt: new Date().toISOString(),
        })
      }
      setGeneratedContent(items)
      setShowResults(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    const planId = generateId()
    const itemsWithPlan = generatedContent.map(item => ({ ...item, planId }))

    const plan: ContentPlan = {
      id: planId,
      tipo,
      servicios: serviciosSeleccionados,
      frecuencia,
      objetivo,
      contenido: itemsWithPlan,
      createdAt: new Date().toISOString(),
    }

    addContentPlan(plan)
    addLibraryItems(itemsWithPlan)
    setShowResults(false)
    setGeneratedContent([])
  }

  const handleCreateScript = (item: ContentItem) => {
    addLibraryItems([item])
    setActiveModule('crear')
  }

  if (!brandProfile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F3E8E5] mb-4">
          <Sparkles className="w-8 h-8 text-[#C17C83]" />
        </div>
        <h3 className="text-xl font-bold text-[#2D1F22] mb-2">Primero crea tu Marca BRÄVE</h3>
        <p className="text-muted-foreground mb-6">Necesitamos conocer tu salón para generar contenido personalizado.</p>
        <Button onClick={() => setActiveModule('marca')} className="bg-[#7D2E42] hover:bg-[#933A54] text-white">
          Ir a Mi Marca BRÄVE
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold text-[#2D1F22]">Planificar</h2>
        <p className="text-muted-foreground text-base">Crea tu planificación de contenido en minutos</p>
      </div>

      {!showResults ? (
        <>
          {/* Plan Type */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22]">Tipo de Planificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {(['semanal', 'mensual'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`p-4 rounded-xl text-center font-medium transition-all duration-200 ${
                      tipo === t
                        ? 'bg-[#7D2E42] text-white shadow-md'
                        : 'bg-white border-2 border-[#E0D5D1] text-[#2D1F22] hover:border-[#C17C83]'
                    }`}
                  >
                    <Calendar className="w-6 h-6 mx-auto mb-2" />
                    {t === 'semanal' ? 'Semanal' : 'Mensual'}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22]">Servicios a Potenciar</CardTitle>
              <CardDescription>Selecciona máximo 3 servicios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {servicios.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleServicio(s)}
                    disabled={!serviciosSeleccionados.includes(s) && serviciosSeleccionados.length >= 3}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      serviciosSeleccionados.includes(s)
                        ? 'bg-[#7D2E42] text-white shadow-md'
                        : 'bg-[#F3E8E5] text-[#2D1F22] hover:bg-[#E0D5D1]'
                    } ${!serviciosSeleccionados.includes(s) && serviciosSeleccionados.length >= 3 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Frequency */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22]">Frecuencia Semanal</CardTitle>
              <CardDescription>¿Cuántas publicaciones por semana?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {FRECUENCIAS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrecuencia(f)}
                    className={`p-4 rounded-xl text-center font-bold transition-all duration-200 ${
                      frecuencia === f
                        ? 'bg-[#7D2E42] text-white shadow-md'
                        : 'bg-white border-2 border-[#E0D5D1] text-[#2D1F22] hover:border-[#C17C83]'
                    }`}
                  >
                    <span className="text-2xl block">{f}</span>
                    <span className="text-xs font-normal mt-1 block">por semana</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Objective */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22]">Objetivo Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {OBJETIVOS.map((obj) => (
                  <button
                    key={obj.value}
                    onClick={() => setObjetivo(obj.value)}
                    className={`p-4 rounded-xl text-center transition-all duration-200 ${
                      objetivo === obj.value
                        ? 'bg-[#7D2E42] text-white shadow-md'
                        : 'bg-white border-2 border-[#E0D5D1] text-[#2D1F22] hover:border-[#C17C83]'
                    }`}
                  >
                    <span className="font-medium block">{obj.label}</span>
                    <span className="text-xs mt-1 block opacity-70">{obj.desc}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center pt-2 pb-8">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || serviciosSeleccionados.length === 0 || !objetivo}
              className="px-8 py-6 text-base font-bold rounded-xl shadow-lg bg-[#C17C83] hover:bg-[#B06B74] text-white disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generando planificación...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  GENERAR PLANIFICACIÓN
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#2D1F22]">Tu Planificación</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  className="border-[#C17C83] text-[#C17C83] hover:bg-[#F3E8E5]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerar
                </Button>
              </div>
            </div>

            {generatedContent.map((item, idx) => (
              <Card key={item.id} className="brave-card-hover border-none shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${item.tipo === 'reel' ? 'bg-[#C17C83]' : item.tipo === 'carrusel' ? 'bg-[#C9A96E]' : 'bg-[#7D2E42]'} text-white text-xs`}>
                          {item.tipo.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{item.fecha}</span>
                      </div>
                      <h4 className="font-semibold text-[#2D1F22] text-base">{item.titulo}</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="bg-[#F3E8E5] text-[#2D1F22] text-xs">
                          {item.objetivo}
                        </Badge>
                        <Badge variant="secondary" className="bg-[#F3E8E5] text-[#2D1F22] text-xs">
                          {item.servicio}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateScript(item)}
                        className="border-[#C17C83] text-[#C17C83] hover:bg-[#F3E8E5]"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Guión
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const updated = generatedContent.map(g =>
                            g.id === item.id ? { ...g, estado: 'aprobado' as const } : g
                          )
                          setGeneratedContent(updated)
                        }}
                        className={`${
                          item.estado === 'aprobado'
                            ? 'bg-green-600 hover:bg-green-600'
                            : 'bg-[#7D2E42] hover:bg-[#933A54]'
                        } text-white`}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {item.estado === 'aprobado' ? 'Aprobado' : 'Aprobar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center pt-4 pb-8 gap-4">
              <Button
                onClick={handleSave}
                className="px-8 py-6 text-base font-bold rounded-xl shadow-lg bg-[#7D2E42] hover:bg-[#933A54] text-white"
              >
                <Save className="w-5 h-5 mr-2" />
                Guardar Planificación
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
