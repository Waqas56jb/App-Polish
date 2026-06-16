'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useAppStore, ContentItem, ContentPlan, generateId } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Calendar, RefreshCw, Save, FileText, Sparkles,
  ArrowRight, Download, CalendarPlus, Layers
} from 'lucide-react'
import { DraggableCard } from './draggable-card'
import { ContentCardModal } from './content-modal'

const OBJETIVOS = [
  {
    value: 'autoridad',
    label: 'Autoridad',
    desc: 'Posiciónate como experta',
    longDesc: 'El contenido demostrará tu conocimiento técnico, educará a tu audiencia y desmentirá mitos del sector.'
  },
  {
    value: 'reservas',
    label: 'Reservas',
    desc: 'Genera conversaciones y citas',
    longDesc: 'El contenido se enfocará en transformaciones, casos de éxito y llamados claros a reservar.'
  },
  {
    value: 'visibilidad',
    label: 'Visibilidad',
    desc: 'Llega a más personas y consigue más alcance',
    longDesc: 'El contenido será viral, usando tendencias, retos y temas que generen debate y compartición.'
  },
]

const FRECUENCIAS = [2, 3, 4, 5]

type TipoContenido = 'reels' | 'carruseles' | 'mezcla'

export function Planificar() {
  const {
    brandProfile, addContentPlan, addLibraryItems, setActiveModule,
    setIsLoading, isLoading, setBrandProfile, replaceLibraryItem,
    scheduleContentItem, removeLibraryItem,
    currentPlanItems, currentPlanConfig,
    setCurrentPlanItems, updateCurrentPlanItem, removeCurrentPlanItem,
    setCurrentPlanConfig, clearCurrentPlan,
  } = useAppStore()
  const [tipo, setTipo] = useState<'semanal' | 'mensual'>(currentPlanConfig?.tipo || 'semanal')
  const [tipoContenido, setTipoContenido] = useState<TipoContenido>(currentPlanConfig?.tipoContenido || 'mezcla')
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>(currentPlanConfig?.servicios || [])
  const [frecuencia, setFrecuencia] = useState(currentPlanConfig?.frecuencia || 3)
  const [objetivo, setObjetivo] = useState(currentPlanConfig?.objetivo || '')
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Use store-backed plan items
  const generatedContent = currentPlanItems
  const setGeneratedContent = setCurrentPlanItems
  const showResults = generatedContent.length > 0

  const openItem = openItemId ? generatedContent.find(c => c.id === openItemId) || null : null

  const servicios = brandProfile?.serviciosPrioritarios?.length
    ? brandProfile.serviciosPrioritarios
    : brandProfile?.servicios?.length
      ? brandProfile.servicios
      : ['Balayage', 'Mechas', 'Tinte', 'Corte', 'Peinado', 'Alisado', 'Permanente', 'Tratamientos', 'Keratina', 'Extensiones', 'Canas', 'Decoloración', 'Reflejos', 'Matizadores', 'Cepillado', 'Recogidos']

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
            tipoContenido,
          },
        }),
      })

      const data = await res.json()
      const items: ContentItem[] = []

      const getTipoForItem = (idx: number, fromAI?: string): 'reel' | 'carrusel' => {
        if (tipoContenido === 'reels') return 'reel'
        if (tipoContenido === 'carruseles') return 'carrusel'
        if (fromAI === 'reel' || fromAI === 'carrusel') return fromAI
        return idx % 2 === 0 ? 'reel' : 'carrusel'
      }

      if (Array.isArray(data.result)) {
        data.result.forEach((item: any, idx: number) => {
          const contentItem: ContentItem = {
            id: generateId(),
            tipo: getTipoForItem(idx, item.tipo),
            titulo: item.titulo || 'Sin título',
            objetivo: item.objetivo || objetivo,
            servicio: item.servicio || serviciosSeleccionados[idx % serviciosSeleccionados.length] || '',
            guion: '',
            copy: '',
            hashtags: '',
            textoPortada: '',
            formato: '',
            estado: 'aprobado',
            fecha: '',
            diaSemana: item.dia || '',
            slides: [],
            storiesData: [],
            descripcion: item.descripcion || '',
            planId: '',
            createdAt: new Date().toISOString(),
          }
          items.push(contentItem)
        })
      } else {
        // Fallback
        const dias = ['Martes', 'Jueves', 'Domingo']
        const ideasByObjetivo: Record<string, string[]> = {
          autoridad: [
            '3 mitos sobre {servicio} que debes dejar de creer',
            'El error que estilistas novatas cometen con {servicio}',
            'Cómo identifico si un cliente necesita {servicio}: mi método',
            'Tutorial: técnica correcta de {servicio} paso a paso',
          ],
          reservas: [
            'Antes y después: transformación con {servicio}',
            'Solo 3 citas disponibles esta semana para {servicio}',
            'Mi clienta no creía el resultado del {servicio}',
            'Si llevas tiempo pensando en un {servicio}, esto es para ti',
          ],
          visibilidad: [
            'El reto del {servicio} que se hizo viral',
            'Lo que nadie te dice sobre el {servicio} (polémica)',
            'Tag a tu amiga que necesita un {servicio}',
            'Esto pasó cuando hice {servicio} en mi salón',
          ],
        }
        const ideas = ideasByObjetivo[objetivo] || ideasByObjetivo.autoridad

        for (let i = 0; i < frecuencia; i++) {
          const servicio = serviciosSeleccionados[i % serviciosSeleccionados.length]
          items.push({
            id: generateId(),
            tipo: getTipoForItem(i),
            titulo: ideas[i % ideas.length].replace('{servicio}', servicio.toLowerCase()),
            objetivo,
            servicio,
            guion: '',
            copy: '',
            hashtags: '',
            textoPortada: '',
            formato: '',
            estado: 'aprobado',
            fecha: '',
            diaSemana: tipo === 'semanal' ? dias[i % 3] : `Semana ${Math.floor(i / frecuencia) + 1}`,
            slides: [],
            storiesData: [],
            descripcion: `Idea alineada al objetivo "${objetivo}"`,
            planId: '',
            createdAt: new Date().toISOString(),
          })
        }
      }

      setGeneratedContent(items)
      setCurrentPlanConfig({ tipo, tipoContenido, servicios: serviciosSeleccionados, frecuencia, objetivo })

      // Auto-generate guion/copy/hashtags for each item in the background
      autoGenerateScripts(items)
    } finally {
      setIsLoading(false)
    }
  }

  const autoGenerateScripts = async (items: ContentItem[]) => {
    // Generate scripts in parallel (max 3 concurrent)
    const batchSize = 3
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      await Promise.all(batch.map(async (item) => {
        try {
          const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'script',
              brandProfile,
              context: {
                titulo: item.titulo,
                tipo: item.tipo,
                objetivo: item.objetivo,
                servicio: item.servicio,
                formato: item.formato || 'hablando a cámara',
              },
            }),
          })
          const data = await res.json()
          if (data.result && !data.result.raw) {
            updateCurrentPlanItem(item.id, {
              guion: data.result.guion || '',
              copy: data.result.copy || '',
              hashtags: data.result.hashtags || '',
              textoPortada: data.result.textoPortada || '',
            })
          }
        } catch (error) {
          console.error('Error generating script for', item.titulo, error)
        }
      }))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = generatedContent.findIndex(i => i.id === active.id)
      const newIndex = generatedContent.findIndex(i => i.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(generatedContent, oldIndex, newIndex)
      setGeneratedContent(reordered)
    }
  }

  const handleRegenerate = async (item: ContentItem) => {
    setIsLoading(true, 'Regenerando idea...')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reel-ideas',
          brandProfile,
          context: {
            servicio: item.servicio,
            objetivo: item.objetivo,
            formato: item.formato || 'hablando a cámara',
          },
        }),
      })
      const data = await res.json()
      let newTitulo = ''
      if (Array.isArray(data.result) && data.result.length > 0) {
        newTitulo = data.result[0].titulo
      } else {
        newTitulo = `Nueva idea sobre ${item.servicio}`
      }
      updateCurrentPlanItem(item.id, {
        titulo: newTitulo,
        descripcion: data.result?.[0]?.descripcion || item.descripcion,
      })
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    removeCurrentPlanItem(id)
  }

  const handleSaveToLibrary = (item: ContentItem) => {
    addLibraryItems([{ ...item, id: generateId() }])
  }

  const handleConvert = async (item: ContentItem) => {
    const fromTipo = item.tipo
    const toTipo = item.tipo === 'reel' ? 'carrusel' : 'reel'
    setIsLoading(true, `Convirtiendo a ${toTipo}...`)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'convert-content',
          brandProfile,
          context: {
            titulo: item.titulo,
            objetivo: item.objetivo,
            servicio: item.servicio,
            formato: item.formato,
            fromTipo,
            toTipo,
            guion: item.guion,
            copy: item.copy,
            hashtags: item.hashtags,
          },
        }),
      })
      const data = await res.json()
      if (data.result && !data.result.raw) {
        const converted: ContentItem = {
          ...item,
          tipo: toTipo,
          titulo: data.result.titulo || item.titulo,
          guion: toTipo === 'reel' ? (data.result.guion || item.guion) : '',
          copy: data.result.copy || item.copy,
          hashtags: data.result.hashtags || item.hashtags,
          textoPortada: data.result.textoPortada || item.textoPortada,
          slides: toTipo === 'carrusel' && data.result.slides ? data.result.slides : [],
        }
        // Replace the item in store
        setCurrentPlanItems(generatedContent.map(c => c.id === item.id ? converted : c))
      }
    } catch (error) {
      console.error('Convert error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignDay = (id: string, diaSemana: string) => {
    updateCurrentPlanItem(id, { diaSemana })
  }

  const handleAssignDate = (id: string, fecha: string) => {
    updateCurrentPlanItem(id, { fecha, estado: 'programado' })
  }

  const handleOpen = (item: ContentItem) => {
    setOpenItemId(item.id)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    // Sync any updates from the modal back to local state
    if (openItem) {
      // Check store for updated version
    }
  }

  const getNextWeekdayDate = (diaSemana: string): string => {
    if (!diaSemana) return ''
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const targetDay = dias.indexOf(diaSemana)
    if (targetDay === -1) return ''
    const today = new Date()
    const todayDay = today.getDay()
    let diff = (targetDay - todayDay + 7) % 7
    // If today is the same day, schedule for today
    const result = new Date(today)
    result.setDate(today.getDate() + diff)
    return result.toISOString().split('T')[0]
  }

  const handleSavePlanToCalendar = () => {
    const planId = generateId()
    const itemsWithPlan = generatedContent.map(item => {
      // If item has diaSemana but no fecha, derive fecha from diaSemana
      let fecha = item.fecha
      let estado = item.estado
      if (!fecha && item.diaSemana) {
        fecha = getNextWeekdayDate(item.diaSemana)
        estado = 'programado' as const
      }
      return {
        ...item,
        planId,
        fecha,
        estado: fecha ? 'programado' as const : estado,
      }
    })

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
    alert('✓ Planificación guardada en calendario y biblioteca')
  }

  const handleDownloadPDF = () => {
    // Generate a simple printable view
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <html>
      <head>
        <title>Planificación ${tipo} - BRÄVE STUDIO</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 40px; color: #2D1F22; }
          h1 { color: #7D2E42; }
          .calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-bottom: 30px; }
          .day { border: 1px solid #E0D5D1; padding: 10px; min-height: 80px; }
          .day-name { font-weight: bold; color: #7D2E42; margin-bottom: 5px; }
          .item { background: #F3E8E5; padding: 5px; margin: 3px 0; font-size: 12px; border-radius: 4px; }
          .reel { border-left: 3px solid #C17C83; }
          .carrusel { border-left: 3px solid #C9A96E; }
          .content-block { page-break-inside: avoid; margin-bottom: 20px; padding: 15px; border: 1px solid #E0D5D1; border-radius: 8px; }
          .tipo-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; color: white; }
          .reel-badge { background: #C17C83; }
          .carrusel-badge { background: #C9A96E; }
          h2 { color: #7D2E42; margin-bottom: 5px; }
          .meta { color: #666; font-size: 12px; margin-bottom: 10px; }
          .section { margin: 8px 0; }
          .section-label { font-weight: bold; color: #7D2E42; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Planificación ${tipo} — BRÄVE STUDIO</h1>
        <p><strong>Objetivo:</strong> ${objetivo} · <strong>Frecuencia:</strong> ${frecuencia}/semana · <strong>Tipo:</strong> ${tipoContenido}</p>
        <p><strong>Servicios:</strong> ${serviciosSeleccionados.join(', ')}</p>

        <h2>Vista Calendario</h2>
        <div class="calendar">
          ${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => `
            <div class="day">
              <div class="day-name">${dia}</div>
              ${generatedContent.filter(c => c.diaSemana === dia).map(c => `
                <div class="item ${c.tipo}">
                  <span class="tipo-badge ${c.tipo}-badge">${c.tipo.toUpperCase()}</span><br>
                  ${c.titulo}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>

        <h2>Contenido por orden cronológico</h2>
        ${generatedContent.map((c, i) => `
          <div class="content-block">
            <h2>${i + 1}. ${c.titulo}</h2>
            <div class="meta">
              <span class="tipo-badge ${c.tipo}-badge">${c.tipo.toUpperCase()}</span>
              · ${c.diaSemana || 'Sin día'} · ${c.servicio} · ${c.objetivo}
            </div>
            ${c.descripcion ? `<div class="section"><div class="section-label">Descripción:</div>${c.descripcion}</div>` : ''}
            ${c.guion ? `<div class="section"><div class="section-label">Guión:</div><pre style="white-space:pre-wrap;font-family:inherit;">${c.guion}</pre></div>` : ''}
            ${c.copy ? `<div class="section"><div class="section-label">Copy:</div>${c.copy}</div>` : ''}
            ${c.hashtags ? `<div class="section"><div class="section-label">Hashtags:</div>${c.hashtags}</div>` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  if (!brandProfile) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-3xl font-bold text-[#2D1F22]">Planificar</h2>
          <p className="text-muted-foreground text-base">Crea tu planificación de contenido en minutos</p>
        </div>

        <Card className="border-l-4 border-l-[#C9A96E] bg-[#FBF7F5] shadow-md">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F3E8E5] shrink-0">
              <Sparkles className="w-6 h-6 text-[#C17C83]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#2D1F22] mb-1">Personaliza tu planificación</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Aunque puedes planificar sin tu Marca BRÄVE, completarla hará que las ideas sean mucho más personalizadas para tu salón.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setActiveModule('marca')} size="sm" className="bg-[#7D2E42] hover:bg-[#933A54] text-white">
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
                  className="border-[#C17C83] text-[#C17C83] hover:bg-[#F3E8E5]"
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-4">
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

          {/* Content Type Selector */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#2D1F22] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C17C83]" />
                Tipo de Contenido
              </CardTitle>
              <CardDescription>¿Qué formatos quieres incluir en tu planificación?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'reels' as TipoContenido, label: 'Solo Reels', icon: '🎬' },
                  { value: 'carruseles' as TipoContenido, label: 'Solo Carruseles', icon: '🖼️' },
                  { value: 'mezcla' as TipoContenido, label: 'Mezcla', icon: '✨' },
                ]).map((tc) => (
                  <button
                    key={tc.value}
                    onClick={() => setTipoContenido(tc.value)}
                    className={`p-4 rounded-xl text-center transition-all duration-200 ${
                      tipoContenido === tc.value
                        ? 'bg-[#C17C83] text-white shadow-md'
                        : 'bg-white border-2 border-[#E0D5D1] text-[#2D1F22] hover:border-[#C17C83]'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{tc.icon}</span>
                    <span className="text-xs font-medium block">{tc.label}</span>
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
              <CardDescription>El objetivo modificará el tipo de ideas generadas por la IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {OBJETIVOS.map((obj) => (
                  <button
                    key={obj.value}
                    onClick={() => setObjetivo(obj.value)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      objetivo === obj.value
                        ? 'bg-[#7D2E42] text-white shadow-md'
                        : 'bg-white border-2 border-[#E0D5D1] text-[#2D1F22] hover:border-[#C17C83]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-bold">{obj.label}</span>
                    </div>
                    <p className={`text-sm ${objetivo === obj.value ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {obj.desc}
                    </p>
                    {objetivo === obj.value && (
                      <p className="text-xs mt-2 text-white/70 italic">{obj.longDesc}</p>
                    )}
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
          {/* Top toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-[#2D1F22]">Tu Planificación</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSavePlanToCalendar}
                className="border-[#7D2E42] text-[#7D2E42] hover:bg-[#F3E8E5]"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Guardar en calendario
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="border-[#C17C83] text-[#C17C83] hover:bg-[#F3E8E5]"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="border-[#E0D5D1] text-[#2D1F22] hover:bg-[#F3E8E5]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar plan
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-[#7D2E42]">💡</span>
            Arrastra las tarjetas para reorganizar el orden. Usa el botón 📅 para asignar día o fecha.
          </div>

          {/* Draggable cards */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={generatedContent.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {generatedContent.map((item) => (
                  <DraggableCard
                    key={item.id}
                    item={item}
                    onOpen={handleOpen}
                    onRegenerate={handleRegenerate}
                    onDelete={handleDelete}
                    onSave={handleSaveToLibrary}
                    onConvert={handleConvert}
                    onAssignDay={handleAssignDay}
                    onAssignDate={handleAssignDate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Bottom actions */}
          <div className="flex justify-center pt-4 pb-8 gap-3">
            <Button
              onClick={handleSavePlanToCalendar}
              className="px-8 py-5 text-base font-bold rounded-xl shadow-lg bg-[#7D2E42] hover:bg-[#933A54] text-white"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar Planificación
            </Button>
          </div>
        </>
      )}

      {/* Content Modal */}
      <ContentCardModal
        item={openItem}
        isOpen={modalOpen}
        onClose={handleModalClose}
        onDelete={handleDelete}
      />
    </div>
  )
}
