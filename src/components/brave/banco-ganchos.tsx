'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  useAppStore,
  HookCard,
  SavedHook,
  SavedHookEstado,
  generateId,
} from '@/lib/store'
import { HOOKS_SEED, HOOK_CATEGORIAS, HOOK_TIPOS } from '@/lib/hooks-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  Sparkles,
  Save,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  X,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  Heart,
  Video,
  FileText,
  LayoutGrid,
  Bookmark,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  Lightbulb,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

type Vista = 'banco' | 'mis-ideas' | 'calendario'

const ESTADO_LABELS: Record<SavedHookEstado, { label: string; color: string; icon: any }> = {
  idea: { label: 'Idea guardada', color: 'bg-[#FFF1B5]/20 text-[#591427] border-[#FFF1B5]/40', icon: Bookmark },
  pendiente: { label: 'Pendiente de grabar', color: 'bg-[#C1DBE8]/15 text-[#591427] border-[#C1DBE8]/30', icon: Clock },
  grabado: { label: 'Grabado', color: 'bg-[#591427]/15 text-[#591427] border-[#591427]/30', icon: Video },
  publicado: { label: 'Publicado', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
}

const IMPACTO_COLOR: Record<string, string> = {
  Alto: 'bg-[#591427] text-white',
  Medio: 'bg-[#C1DBE8] text-[#2A1520]',
  Bajo: 'bg-[#FFF1B5] text-[#2A1520]',
}

const TIPO_COLOR: Record<string, string> = {
  Viral: 'bg-pink-100 text-pink-800 border-pink-200',
  Educativo: 'bg-blue-100 text-blue-800 border-blue-200',
  Autoridad: 'bg-purple-100 text-purple-800 border-purple-200',
  Venta: 'bg-orange-100 text-orange-800 border-orange-200',
  Engagement: 'bg-teal-100 text-teal-800 border-teal-200',
  Dolor: 'bg-red-100 text-red-800 border-red-200',
  Deseo: 'bg-amber-100 text-amber-800 border-amber-200',
  Objeción: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Tendencia: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text)
  }
}

export function BancoGanchos() {
  const {
    brandProfile,
    customHooks,
    addCustomHook,
    updateCustomHook,
    removeCustomHook,
    savedHooks,
    saveHook,
    updateSavedHook,
    removeSavedHook,
    addLibraryItem,
    setActiveModule,
  } = useAppStore()

  const [vista, setVista] = useState<Vista>('banco')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('')
  const [ganchoSeleccionado, setGanchoSeleccionado] = useState<HookCard | null>(null)
  const [generandoGancho, setGenerandoGancho] = useState<string | null>(null)
  const [dialogoGenerar, setDialogoGenerar] = useState<{
    gancho: HookCard
    tipoContenido: 'reel' | 'story' | 'carrusel'
    tono: 'educativo' | 'cercano' | 'vendedor'
    modo: 'texto' | 'camara'
    servicio: string
    resultado: any
    cargando: boolean
    error: string
  } | null>(null)
  const [dialogoEditar, setDialogoEditar] = useState<HookCard | null>(null)
  const [dialogoNuevoGancho, setDialogoNuevoGancho] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [dialogoProgramar, setDialogoProgramar] = useState<SavedHook | null>(null)

  // Combina ganchos seed + custom
  const todosGanchos = useMemo(() => {
    return [...customHooks, ...HOOKS_SEED]
  }, [customHooks])

  // Filtrado
  const ganchosFiltrados = useMemo(() => {
    return todosGanchos.filter(g => {
      if (searchTerm) {
        const t = searchTerm.toLowerCase()
        const hit =
          g.titulo.toLowerCase().includes(t) ||
          g.servicio.toLowerCase().includes(t) ||
          g.categoria.toLowerCase().includes(t) ||
          g.explicacion.toLowerCase().includes(t)
        if (!hit) return false
      }
      if (categoriaFiltro && g.categoria !== categoriaFiltro) return false
      if (tipoFiltro && g.tipo !== tipoFiltro) return false
      return true
    })
  }, [todosGanchos, searchTerm, categoriaFiltro, tipoFiltro])

  const handleCopiar = (id: string, texto: string) => {
    copyToClipboard(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 1500)
  }

  const handleGuardarIdea = (gancho: HookCard) => {
    const nueva: SavedHook = {
      id: generateId(),
      hookId: gancho.id,
      titulo: gancho.titulo,
      tipoContenido: '',
      servicio: gancho.servicio,
      guionGenerado: '',
      estado: 'idea',
      fechaProgramada: null,
      fechaGrabacion: null,
      createdAt: new Date().toISOString(),
    }
    saveHook(nueva)
    // feedback visual breve
    setCopiado('saved-' + gancho.id)
    setTimeout(() => setCopiado(null), 1500)
  }

  const yaGuardado = (ganchoId: string) => savedHooks.some(h => h.hookId === ganchoId)

  const handleGenerar = async () => {
    if (!dialogoGenerar) return
    const { gancho, tipoContenido, tono, modo, servicio } = dialogoGenerar
    setDialogoGenerar({ ...dialogoGenerar, cargando: true, error: '', resultado: null })
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generar-desde-gancho',
          brandProfile,
          context: {
            gancho: gancho.titulo,
            tipoContenido,
            tono,
            modo,
            servicio: servicio || gancho.servicio,
          },
        }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setDialogoGenerar({ ...dialogoGenerar!, cargando: false, resultado: data.result })
    } catch (e: any) {
      setDialogoGenerar({ ...dialogoGenerar!, cargando: false, error: e.message || 'Error generando contenido' })
    }
  }

  const handleGuardarGenerado = () => {
    if (!dialogoGenerar?.resultado) return
    const { gancho, tipoContenido, servicio, resultado } = dialogoGenerar
    const titulo = resultado.titulo || gancho.titulo
    const guionTexto = tipoContenido === 'carrusel'
      ? (resultado.slides || []).map((s: any) => `Slide ${s.numero}: ${s.texto}`).join('\n\n')
      : tipoContenido === 'story'
      ? (resultado.stories || []).map((s: any) => `Story ${s.numero} (${s.tipo}): ${s.texto}`).join('\n\n')
      : resultado.guion || ''

    const nueva: SavedHook = {
      id: generateId(),
      hookId: gancho.id,
      titulo,
      tipoContenido,
      servicio: servicio || gancho.servicio,
      guionGenerado: guionTexto + (resultado.copy ? '\n\nCOPY:\n' + resultado.copy : '') + (resultado.hashtags ? '\n\n' + resultado.hashtags : ''),
      estado: 'pendiente',
      fechaProgramada: null,
      fechaGrabacion: null,
      createdAt: new Date().toISOString(),
    }
    saveHook(nueva)

    // También lo guardamos en la biblioteca general como ContentItem
    addLibraryItem({
      id: generateId(),
      tipo: tipoContenido === 'carrusel' ? 'carrusel' : tipoContenido === 'story' ? 'story' : 'reel',
      titulo,
      objetivo: gancho.objetivo,
      servicio: servicio || gancho.servicio,
      guion: guionTexto,
      copy: resultado.copy || '',
      hashtags: resultado.hashtags || '',
      textoPortada: resultado.textoPortada || '',
      formato: dialogoGenerar.modo === 'camara' ? 'hablando a cámara' : 'texto en pantalla',
      estado: 'borrador',
      fecha: '',
      diaSemana: '',
      slides: resultado.slides || [],
      storiesData: resultado.stories || [],
      descripcion: gancho.titulo,
      planId: '',
      createdAt: new Date().toISOString(),
    })

    setDialogoGenerar(null)
    setVista('mis-ideas')
  }

  const abrirDialogoGenerar = (gancho: HookCard) => {
    setGanchoSeleccionado(null)
    setDialogoGenerar({
      gancho,
      tipoContenido: 'reel',
      tono: 'cercano',
      modo: 'camara',
      servicio: gancho.servicio,
      resultado: null,
      cargando: false,
      error: '',
    })
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2A1520] mb-1">Banco de Ganchos</h1>
          <p className="text-[#591427]/70">
            Ideas rápidas, llamativas y estratégicas para crear contenido sin quedarte en blanco.
          </p>
        </div>
        <Button
          onClick={() => setDialogoNuevoGancho(true)}
          className="bg-[#591427] hover:bg-[#3D0E1B] text-white"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Crear gancho
        </Button>
      </div>

      {/* Selector de vista */}
      <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-[#F5F0EB] w-fit">
        {[
          { key: 'banco' as Vista, label: 'Banco de Ganchos', icon: LayoutGrid },
          { key: 'mis-ideas' as Vista, label: 'Mis ideas guardadas', icon: Bookmark },
          { key: 'calendario' as Vista, label: 'Calendario / Lista', icon: Calendar },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setVista(v.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              vista === v.key
                ? 'brave-gradient text-white shadow-md'
                : 'text-[#591427] hover:bg-[#FFFBF0]'
            }`}
          >
            <v.icon className="w-4 h-4" />
            {v.label}
          </button>
        ))}
      </div>

      {/* VISTA: BANCO */}
      {vista === 'banco' && (
        <>
          {/* Filtros */}
          <Card className="border-[#F5F0EB] shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#591427]/50" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ganchos por título, servicio, categoría..."
                  className="pl-10 bg-white border-[#F5F0EB]"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Categoría
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCategoriaFiltro('')}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      !categoriaFiltro
                        ? 'bg-[#591427] text-white border-[#591427]'
                        : 'bg-white text-[#591427] border-[#F5F0EB] hover:bg-[#FFFBF0]'
                    }`}
                  >
                    Todas
                  </button>
                  {HOOK_CATEGORIAS.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategoriaFiltro(c === categoriaFiltro ? '' : c)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        c === categoriaFiltro
                          ? 'bg-[#591427] text-white border-[#591427]'
                          : 'bg-white text-[#591427] border-[#F5F0EB] hover:bg-[#FFFBF0]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Tipo de gancho
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setTipoFiltro('')}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      !tipoFiltro
                        ? 'bg-[#FFF1B5] text-[#2A1520] border-[#FFF1B5]'
                        : 'bg-white text-[#591427] border-[#F5F0EB] hover:bg-[#FFFBF0]'
                    }`}
                  >
                    Todos
                  </button>
                  {HOOK_TIPOS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTipoFiltro(t === tipoFiltro ? '' : t)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        t === tipoFiltro
                          ? 'bg-[#FFF1B5] text-[#2A1520] border-[#FFF1B5]'
                          : 'bg-white text-[#591427] border-[#F5F0EB] hover:bg-[#FFFBF0]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {(categoriaFiltro || tipoFiltro || searchTerm) && (
                <div className="flex items-center gap-2 text-xs text-[#591427]/70 pt-2 border-t border-[#F5F0EB]">
                  <span>{ganchosFiltrados.length} ganchos encontrados</span>
                  <button
                    onClick={() => {
                      setCategoriaFiltro('')
                      setTipoFiltro('')
                      setSearchTerm('')
                    }}
                    className="text-[#C1DBE8] hover:underline ml-auto"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grid de ganchos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ganchosFiltrados.map(gancho => {
              const guardado = yaGuardado(gancho.id)
              return (
                <Card
                  key={gancho.id}
                  className="border-[#F5F0EB] shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${IMPACTO_COLOR[gancho.impacto] || IMPACTO_COLOR.Medio}`}>
                        {gancho.impacto}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${TIPO_COLOR[gancho.tipo] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {gancho.tipo}
                      </span>
                    </div>
                    <CardTitle className="text-base text-[#2A1520] leading-snug">
                      {gancho.titulo}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFBF0] border border-[#F5F0EB] text-[#591427]">
                        {gancho.categoria}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFBF0] border border-[#F5F0EB] text-[#591427]">
                        {gancho.servicio}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFBF0] border border-[#F5F0EB] text-[#591427]">
                        Objetivo: {gancho.objetivo}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 flex flex-col">
                    <p className="text-xs text-[#2A1520]/70 line-clamp-2 mb-3 flex-1">
                      {gancho.explicacion}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => abrirDialogoGenerar(gancho)}
                        className="flex-1 h-8 text-xs brave-gradient hover:opacity-90"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Generar guion
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setGanchoSeleccionado(gancho)}
                        className="h-8 text-xs border-[#F5F0EB] text-[#591427] hover:bg-[#FFFBF0]"
                      >
                        Ver detalle
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleGuardarIdea(gancho)}
                        disabled={guardado}
                        className="flex-1 h-7 text-[11px] text-[#591427] hover:bg-[#FFFBF0]"
                      >
                        {guardado ? (
                          <><Check className="w-3 h-3 mr-1" /> Guardado</>
                        ) : copiado === 'saved-' + gancho.id ? (
                          <><Check className="w-3 h-3 mr-1 text-green-600" /> Guardado</>
                        ) : (
                          <><Bookmark className="w-3 h-3 mr-1" /> Guardar idea</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopiar(gancho.id, gancho.titulo)}
                        className="h-7 text-[11px] text-[#591427] hover:bg-[#FFFBF0] px-2"
                      >
                        {copiado === gancho.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </Button>
                      {gancho.esCustom && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDialogoEditar(gancho)}
                            className="h-7 text-[11px] text-[#591427] hover:bg-[#FFFBF0] px-2"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('¿Eliminar este gancho personalizado?')) {
                                removeCustomHook(gancho.id)
                              }
                            }}
                            className="h-7 text-[11px] text-[#C1DBE8] hover:bg-[#C1DBE8]/10 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {ganchosFiltrados.length === 0 && (
            <Card className="border-[#F5F0EB]">
              <CardContent className="p-12 text-center">
                <Lightbulb className="w-12 h-12 text-[#FFF1B5] mx-auto mb-4" />
                <p className="text-[#2A1520] font-medium mb-1">No se encontraron ganchos</p>
                <p className="text-sm text-[#591427]/70">Prueba a cambiar los filtros o crea un gancho nuevo.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* VISTA: MIS IDEAS GUARDADAS */}
      {vista === 'mis-ideas' && (
        <MisIdeasGuardadas
          savedHooks={savedHooks}
          onUpdate={updateSavedHook}
          onRemove={removeSavedHook}
          onProgramar={(sh) => setDialogoProgramar(sh)}
          onCopiar={handleCopiar}
          copiado={copiado}
        />
      )}

      {/* VISTA: CALENDARIO/LISTA */}
      {vista === 'calendario' && (
        <CalendarioSimple
          savedHooks={savedHooks}
          onUpdate={updateSavedHook}
        />
      )}

      {/* DIÁLOGO: Ver detalle del gancho */}
      {ganchoSeleccionado && (
        <DialogoDetalleGancho
          gancho={ganchoSeleccionado}
          onClose={() => setGanchoSeleccionado(null)}
          onGenerar={() => {
            const g = ganchoSeleccionado
            setGanchoSeleccionado(null)
            abrirDialogoGenerar(g)
          }}
          onGuardar={() => {
            handleGuardarIdea(ganchoSeleccionado)
          }}
          yaGuardado={yaGuardado(ganchoSeleccionado.id)}
        />
      )}

      {/* DIÁLOGO: Generar contenido */}
      {dialogoGenerar && (
        <DialogoGenerarContenido
          estado={dialogoGenerar}
          onUpdate={(updates) => setDialogoGenerar({ ...dialogoGenerar, ...updates })}
          onCerrar={() => setDialogoGenerar(null)}
          onGenerar={handleGenerar}
          onGuardar={handleGuardarGenerado}
          onCopiar={handleCopiar}
          copiado={copiado}
        />
      )}

      {/* DIÁLOGO: Editar/Crear gancho */}
      {(dialogoEditar || dialogoNuevoGancho) && (
        <DialogoEditarGancho
          gancho={dialogoEditar}
          onClose={() => {
            setDialogoEditar(null)
            setDialogoNuevoGancho(false)
          }}
          onSave={(ganchoData) => {
            if (dialogoEditar) {
              updateCustomHook(dialogoEditar.id, ganchoData)
            } else {
              addCustomHook({
                ...ganchoData,
                id: 'custom-' + generateId(),
                esCustom: true,
              } as HookCard)
            }
            setDialogoEditar(null)
            setDialogoNuevoGancho(false)
          }}
        />
      )}

      {/* DIÁLOGO: Programar fecha */}
      {dialogoProgramar && (
        <DialogoProgramar
          savedHook={dialogoProgramar}
          onClose={() => setDialogoProgramar(null)}
          onConfirm={(fecha, fechaGrabacion) => {
            updateSavedHook(dialogoProgramar.id, {
              fechaProgramada: fecha,
              fechaGrabacion,
              estado: dialogoProgramar.estado === 'idea' ? 'pendiente' : dialogoProgramar.estado,
            })
            setDialogoProgramar(null)
          }}
        />
      )}
    </div>
  )
}

// ============================================================
// SUBCOMPONENTE: Detalle del gancho
// ============================================================
function DialogoDetalleGancho({
  gancho,
  onClose,
  onGenerar,
  onGuardar,
  yaGuardado,
}: {
  gancho: HookCard
  onClose: () => void
  onGenerar: () => void
  onGuardar: () => void
  yaGuardado: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${IMPACTO_COLOR[gancho.impacto]}`}>
                  {gancho.impacto} impacto
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${TIPO_COLOR[gancho.tipo]}`}>
                  {gancho.tipo}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#2A1520] leading-snug">{gancho.titulo}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#FFFBF0] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Categoría</p>
              <p className="text-sm font-medium text-[#2A1520]">{gancho.categoria}</p>
            </div>
            <div className="bg-[#FFFBF0] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Servicio</p>
              <p className="text-sm font-medium text-[#2A1520]">{gancho.servicio}</p>
            </div>
            <div className="bg-[#FFFBF0] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Objetivo</p>
              <p className="text-sm font-medium text-[#2A1520] capitalize">{gancho.objetivo}</p>
            </div>
            <div className="bg-[#FFFBF0] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Impacto</p>
              <p className="text-sm font-medium text-[#2A1520]">{gancho.impacto}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" /> Por qué funciona
              </p>
              <p className="text-sm text-[#2A1520] bg-[#FFFBF0] rounded-xl p-3">{gancho.explicacion}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Dolor que toca
              </p>
              <p className="text-sm text-[#2A1520] bg-[#FFFBF0] rounded-xl p-3">{gancho.dolor}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3 h-3" /> Deseo que activa
              </p>
              <p className="text-sm text-[#2A1520] bg-[#FFFBF0] rounded-xl p-3">{gancho.deseo}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 flex items-center gap-1.5">
                <Video className="w-3 h-3" /> Idea visual
              </p>
              <p className="text-sm text-[#2A1520] bg-[#FFFBF0] rounded-xl p-3">{gancho.ideaVisual}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#F5F0EB] bg-[#FFFBF0] flex gap-2">
          <Button
            onClick={onGuardar}
            disabled={yaGuardado}
            variant="outline"
            className="border-[#591427] text-[#591427] hover:bg-[#591427] hover:text-white"
          >
            {yaGuardado ? <><Check className="w-4 h-4 mr-1.5" /> Ya guardado</> : <><Bookmark className="w-4 h-4 mr-1.5" /> Guardar idea</>}
          </Button>
          <Button onClick={onGenerar} className="flex-1 brave-gradient hover:opacity-90">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generar contenido
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SUBCOMPONENTE: Generar contenido desde gancho
// ============================================================
function DialogoGenerarContenido({
  estado,
  onUpdate,
  onCerrar,
  onGenerar,
  onGuardar,
  onCopiar,
  copiado,
}: {
  estado: any
  onUpdate: (updates: any) => void
  onCerrar: () => void
  onGenerar: () => void
  onGuardar: () => void
  onCopiar: (id: string, texto: string) => void
  copiado: string | null
}) {
  const { gancho, tipoContenido, tono, modo, servicio, resultado, cargando, error } = estado

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCerrar}>
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-[#591427]/60 mb-1">Generar desde gancho</p>
              <h2 className="text-lg font-bold text-[#2A1520] leading-snug">{gancho.titulo}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onCerrar} className="shrink-0">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Opciones de generación */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-2">¿Qué tipo de contenido quieres?</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'reel', label: 'Reel', icon: Video },
                  { key: 'story', label: 'Story', icon: FileText },
                  { key: 'carrusel', label: 'Carrusel', icon: LayoutGrid },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => onUpdate({ tipoContenido: t.key })}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                      tipoContenido === t.key
                        ? 'bg-[#591427] text-white border-[#591427]'
                        : 'bg-white text-[#591427] border-[#F5F0EB] hover:bg-[#FFFBF0]'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-2">Tono</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'educativo', label: 'Educativo' },
                  { key: 'cercano', label: 'Cercano' },
                  { key: 'vendedor', label: 'Vendedor' },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => onUpdate({ tono: t.key })}
                    className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                      tono === t.key
                        ? 'bg-[#FFF1B5] text-[#2A1520] border-[#FFF1B5]'
                        : 'bg-white text-[#591427] border-[#F5F0EB] hover:bg-[#FFFBF0]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-2">Modo</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'camara', label: 'Hablando a cámara', icon: Video },
                  { key: 'texto', label: 'Texto en pantalla', icon: FileText },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => onUpdate({ modo: t.key })}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                      modo === t.key
                        ? 'bg-[#591427] text-white border-[#591427]'
                        : 'bg-white text-[#591427] border-[#F5F0EB] hover:bg-[#FFFBF0]'
                    }`}
                  >
                    <t.icon className="w-3 h-3" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-2">Servicio</p>
              <Input
                value={servicio}
                onChange={(e) => onUpdate({ servicio: e.target.value })}
                placeholder={gancho.servicio || 'Especifica el servicio'}
                className="bg-white border-[#F5F0EB]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {resultado && (
              <div className="bg-[#FFFBF0] rounded-xl p-4 border border-[#F5F0EB]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60">
                    Contenido generado
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCopiar('generado', JSON.stringify(resultado, null, 2))}
                    className="h-7 text-[11px] text-[#591427]"
                  >
                    {copiado === 'generado' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                {resultado.titulo && (
                  <p className="text-sm font-bold text-[#2A1520] mb-3">{resultado.titulo}</p>
                )}
                {resultado.guion && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Guion</p>
                    <p className="text-sm text-[#2A1520] whitespace-pre-wrap bg-white rounded-lg p-3 border border-[#F5F0EB]">{resultado.guion}</p>
                  </div>
                )}
                {resultado.slides && resultado.slides.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Slides</p>
                    {resultado.slides.map((s: any, i: number) => (
                      <div key={i} className="text-sm text-[#2A1520] bg-white rounded-lg p-3 border border-[#F5F0EB]">
                        <span className="text-[10px] font-bold text-[#591427]/60 mr-2">{s.numero}.</span>
                        {s.texto}
                      </div>
                    ))}
                  </div>
                )}
                {resultado.stories && resultado.stories.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Stories</p>
                    {resultado.stories.map((s: any, i: number) => (
                      <div key={i} className="text-sm text-[#2A1520] bg-white rounded-lg p-3 border border-[#F5F0EB]">
                        <span className="text-[10px] font-bold text-[#591427]/60 mr-2">Story {s.numero} ({s.tipo})</span>
                        <p>{s.texto}</p>
                        {s.ideaVisual && <p className="text-[11px] text-[#591427]/60 mt-1">Visual: {s.ideaVisual}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {resultado.copy && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Copy</p>
                    <p className="text-sm text-[#2A1520] whitespace-pre-wrap bg-white rounded-lg p-3 border border-[#F5F0EB]">{resultado.copy}</p>
                  </div>
                )}
                {resultado.hashtags && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#591427]/60 mb-1">Hashtags</p>
                    <p className="text-sm text-[#C1DBE8] bg-white rounded-lg p-3 border border-[#F5F0EB]">{resultado.hashtags}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-[#F5F0EB] bg-[#FFFBF0] flex gap-2">
          <Button variant="outline" onClick={onCerrar} className="border-[#F5F0EB] text-[#591427]">
            Cancelar
          </Button>
          {!resultado ? (
            <Button
              onClick={onGenerar}
              disabled={cargando}
              className="flex-1 brave-gradient hover:opacity-90"
            >
              {cargando ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generando...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1.5" /> Generar contenido</>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={onGenerar}
                disabled={cargando}
                variant="outline"
                className="border-[#591427] text-[#591427]"
              >
                {cargando ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
                Regenerar
              </Button>
              <Button
                onClick={onGuardar}
                className="flex-1 bg-[#591427] hover:bg-[#3D0E1B] text-white"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Guardar en mis ideas
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SUBCOMPONENTE: Editar/Crear gancho
// ============================================================
function DialogoEditarGancho({
  gancho,
  onClose,
  onSave,
}: {
  gancho: HookCard | null
  onClose: () => void
  onSave: (gancho: Omit<HookCard, 'id' | 'esCustom'>) => void
}) {
  const [form, setForm] = useState({
    titulo: gancho?.titulo || '',
    categoria: gancho?.categoria || 'Cortes',
    tipo: gancho?.tipo || ('Educativo' as any),
    objetivo: gancho?.objetivo || 'autoridad',
    servicio: gancho?.servicio || '',
    impacto: gancho?.impacto || ('Medio' as any),
    explicacion: gancho?.explicacion || '',
    dolor: gancho?.dolor || '',
    deseo: gancho?.deseo || '',
    ideaVisual: gancho?.ideaVisual || '',
  })

  const handleSave = () => {
    if (!form.titulo.trim()) {
      alert('El título es obligatorio')
      return
    }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-4 mb-5">
            <h2 className="text-lg font-bold text-[#2A1520]">
              {gancho ? 'Editar gancho' : 'Crear nuevo gancho'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Título *</label>
              <Textarea
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej: El error que hace que tu color pierda brillo antes de tiempo"
                className="bg-white border-[#F5F0EB] min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F5F0EB] bg-white text-sm"
                >
                  {HOOK_CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F5F0EB] bg-white text-sm"
                >
                  {HOOK_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Objetivo</label>
                <select
                  value={form.objetivo}
                  onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F5F0EB] bg-white text-sm"
                >
                  <option value="autoridad">Autoridad</option>
                  <option value="reservas">Reservas</option>
                  <option value="visibilidad">Visibilidad</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Impacto</label>
                <select
                  value={form.impacto}
                  onChange={(e) => setForm({ ...form, impacto: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F5F0EB] bg-white text-sm"
                >
                  <option value="Alto">Alto</option>
                  <option value="Medio">Medio</option>
                  <option value="Bajo">Bajo</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Servicio</label>
              <Input
                value={form.servicio}
                onChange={(e) => setForm({ ...form, servicio: e.target.value })}
                placeholder="Ej: Balayage, Rubios, Cortes..."
                className="bg-white border-[#F5F0EB]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Por qué funciona</label>
              <Textarea
                value={form.explicacion}
                onChange={(e) => setForm({ ...form, explicacion: e.target.value })}
                placeholder="Explica brevemente por qué este gancho funciona"
                className="bg-white border-[#F5F0EB] min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Dolor que toca</label>
                <Textarea
                  value={form.dolor}
                  onChange={(e) => setForm({ ...form, dolor: e.target.value })}
                  placeholder="Qué dolor de la clienta activa"
                  className="bg-white border-[#F5F0EB] min-h-[60px]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Deseo que activa</label>
                <Textarea
                  value={form.deseo}
                  onChange={(e) => setForm({ ...form, deseo: e.target.value })}
                  placeholder="Qué deseo despierta"
                  className="bg-white border-[#F5F0EB] min-h-[60px]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Idea visual</label>
              <Textarea
                value={form.ideaVisual}
                onChange={(e) => setForm({ ...form, ideaVisual: e.target.value })}
                placeholder="Describe la imagen o vídeo sugerido"
                className="bg-white border-[#F5F0EB] min-h-[60px]"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#F5F0EB] bg-[#FFFBF0] flex gap-2">
          <Button variant="outline" onClick={onClose} className="border-[#F5F0EB] text-[#591427]">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-[#591427] hover:bg-[#3D0E1B] text-white">
            <Save className="w-4 h-4 mr-1.5" />
            {gancho ? 'Guardar cambios' : 'Crear gancho'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SUBCOMPONENTE: Programar fecha
// ============================================================
function DialogoProgramar({
  savedHook,
  onClose,
  onConfirm,
}: {
  savedHook: SavedHook
  onClose: () => void
  onConfirm: (fecha: string, fechaGrabacion: string | null) => void
}) {
  const [fecha, setFecha] = useState(savedHook.fechaProgramada || '')
  const [fechaGrabacion, setFechaGrabacion] = useState(savedHook.fechaGrabacion || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#591427]/60 mb-1">Programar contenido</p>
              <h2 className="text-base font-bold text-[#2A1520] leading-snug">{savedHook.titulo}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Día de grabación (opcional)</label>
              <Input
                type="date"
                value={fechaGrabacion}
                onChange={(e) => setFechaGrabacion(e.target.value)}
                className="bg-white border-[#F5F0EB]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#591427]/60 mb-1.5 block">Día de publicación (opcional)</label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-white border-[#F5F0EB]"
              />
            </div>
            <p className="text-xs text-[#591427]/60">
              No es obligatorio programar. Puedes dejar las fechas en blanco y simplemente tener la idea guardada.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-[#F5F0EB] bg-[#FFFBF0] flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onConfirm('', null)
            }}
            className="border-[#F5F0EB] text-[#591427]"
          >
            Quitar fechas
          </Button>
          <Button
            onClick={() => onConfirm(fecha, fechaGrabacion || null)}
            className="flex-1 bg-[#591427] hover:bg-[#3D0E1B] text-white"
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SUBCOMPONENTE: Mis ideas guardadas
// ============================================================
function MisIdeasGuardadas({
  savedHooks,
  onUpdate,
  onRemove,
  onProgramar,
  onCopiar,
  copiado,
}: {
  savedHooks: SavedHook[]
  onUpdate: (id: string, updates: Partial<SavedHook>) => void
  onRemove: (id: string) => void
  onProgramar: (sh: SavedHook) => void
  onCopiar: (id: string, texto: string) => void
  copiado: string | null
}) {
  const [filtroEstado, setFiltroEstado] = useState<SavedHookEstado | 'todos'>('todos')

  const filtrados = savedHooks.filter(h => filtroEstado === 'todos' || h.estado === filtroEstado)

  if (savedHooks.length === 0) {
    return (
      <Card className="border-[#F5F0EB]">
        <CardContent className="p-12 text-center">
          <Bookmark className="w-12 h-12 text-[#FFF1B5] mx-auto mb-4" />
          <p className="text-[#2A1520] font-medium mb-1">Aún no tienes ideas guardadas</p>
          <p className="text-sm text-[#591427]/70">
            Ve al Banco de Ganchos y guarda las ideas que más te gusten. También puedes generar contenido desde ellas.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2">
        {(['todos', 'idea', 'pendiente', 'grabado', 'publicado'] as const).map(estado => {
          const count = estado === 'todos' ? savedHooks.length : savedHooks.filter(h => h.estado === estado).length
          const label = estado === 'todos' ? 'Todos' : ESTADO_LABELS[estado].label
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filtroEstado === estado
                  ? 'bg-[#591427] text-white border-[#591427]'
                  : 'bg-white text-[#591427] border-[#F5F0EB] hover:bg-[#FFFBF0]'
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Lista de ideas guardadas */}
      <div className="space-y-3">
        {filtrados.map(hook => {
          const EstadoIcon = ESTADO_LABELS[hook.estado].icon
          return (
            <Card key={hook.id} className="border-[#F5F0EB] shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#2A1520] mb-1">{hook.titulo}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${ESTADO_LABELS[hook.estado].color}`}>
                        <EstadoIcon className="w-2.5 h-2.5" />
                        {ESTADO_LABELS[hook.estado].label}
                      </span>
                      {hook.tipoContenido && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFBF0] border border-[#F5F0EB] text-[#591427]">
                          {hook.tipoContenido}
                        </span>
                      )}
                      {hook.servicio && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFBF0] border border-[#F5F0EB] text-[#591427]">
                          {hook.servicio}
                        </span>
                      )}
                      {hook.fechaProgramada && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF1B5]/20 border border-[#FFF1B5]/40 text-[#591427]">
                          Publicar: {new Date(hook.fechaProgramada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {hook.fechaGrabacion && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C1DBE8]/15 border border-[#C1DBE8]/30 text-[#591427]">
                          Grabar: {new Date(hook.fechaGrabacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {hook.guionGenerado && (
                  <div className="bg-[#FFFBF0] rounded-xl p-3 mb-3 max-h-40 overflow-y-auto">
                    <p className="text-xs text-[#2A1520] whitespace-pre-wrap line-clamp-6">{hook.guionGenerado}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {/* Cambiar estado */}
                  <select
                    value={hook.estado}
                    onChange={(e) => onUpdate(hook.id, { estado: e.target.value as SavedHookEstado })}
                    className="text-xs px-2 py-1.5 rounded-lg border border-[#F5F0EB] bg-white text-[#591427]"
                  >
                    <option value="idea">Idea guardada</option>
                    <option value="pendiente">Pendiente de grabar</option>
                    <option value="grabado">Grabado</option>
                    <option value="publicado">Publicado</option>
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onProgramar(hook)}
                    className="h-8 text-xs border-[#F5F0EB] text-[#591427]"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Programar
                  </Button>
                  {hook.guionGenerado && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopiar(hook.id, hook.guionGenerado)}
                      className="h-8 text-xs border-[#F5F0EB] text-[#591427]"
                    >
                      {copiado === hook.id ? <Check className="w-3 h-3 text-green-600" /> : <><Copy className="w-3 h-3 mr-1" /> Copiar</>}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm('¿Eliminar esta idea guardada?')) onRemove(hook.id)
                    }}
                    className="h-8 text-xs text-[#C1DBE8] hover:bg-[#C1DBE8]/10 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// SUBCOMPONENTE: Calendario simple
// ============================================================
function CalendarioSimple({
  savedHooks,
  onUpdate,
}: {
  savedHooks: SavedHook[]
  onUpdate: (id: string, updates: Partial<SavedHook>) => void
}) {
  const [mes, setMes] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [vistaLista, setVistaLista] = useState(false)

  // Hooks con fecha programada
  const programados = savedHooks.filter(h => h.fechaProgramada)
  const porFecha = new Map<string, SavedHook[]>()
  programados.forEach(h => {
    if (!h.fechaProgramada) return
    const arr = porFecha.get(h.fechaProgramada) || []
    arr.push(h)
    porFecha.set(h.fechaProgramada, arr)
  })

  // Generar días del mes
  const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const finMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)
  const inicioGrid = new Date(inicioMes)
  inicioGrid.setDate(inicioGrid.getDate() - inicioGrid.getDay()) // Domingo = 0
  const dias: Date[] = []
  const cursor = new Date(inicioGrid)
  while (cursor <= finMes || dias.length % 7 !== 0) {
    dias.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
    if (dias.length > 42) break
  }

  const monthName = mes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-[#F5F0EB]">
          <button
            onClick={() => setVistaLista(false)}
            className={`text-xs px-3 py-1.5 rounded-lg ${!vistaLista ? 'bg-[#591427] text-white' : 'text-[#591427]'}`}
          >
            Calendario
          </button>
          <button
            onClick={() => setVistaLista(true)}
            className={`text-xs px-3 py-1.5 rounded-lg ${vistaLista ? 'bg-[#591427] text-white' : 'text-[#591427]'}`}
          >
            Lista
          </button>
        </div>
        {!vistaLista && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
              className="border-[#F5F0EB] text-[#591427]"
            >
              ←
            </Button>
            <span className="text-sm font-semibold capitalize text-[#2A1520] min-w-[140px] text-center">{monthName}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
              className="border-[#F5F0EB] text-[#591427]"
            >
              →
            </Button>
          </div>
        )}
      </div>

      {/* Vista Calendario */}
      {!vistaLista && (
        <Card className="border-[#F5F0EB] shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                <div key={d} className="text-center text-[10px] font-semibold uppercase text-[#591427]/60 py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dias.map((dia, i) => {
                const fechaStr = dia.toISOString().split('T')[0]
                const enMes = dia.getMonth() === mes.getMonth()
                const hooksHoy = porFecha.get(fechaStr) || []
                const esHoy = new Date().toDateString() === dia.toDateString()
                return (
                  <div
                    key={i}
                    className={`min-h-[68px] p-1.5 rounded-lg border ${
                      enMes
                        ? 'bg-white border-[#F5F0EB]'
                        : 'bg-[#FFFBF0] border-transparent text-[#591427]/30'
                    } ${esHoy ? 'ring-2 ring-[#FFF1B5]' : ''}`}
                  >
                    <p className="text-[10px] font-medium text-[#2A1520] mb-1">{dia.getDate()}</p>
                    <div className="space-y-0.5">
                      {hooksHoy.slice(0, 2).map(h => (
                        <div
                          key={h.id}
                          className={`text-[9px] px-1 py-0.5 rounded truncate ${
                            h.estado === 'publicado'
                              ? 'bg-green-100 text-green-800'
                              : h.estado === 'grabado'
                              ? 'bg-[#591427]/15 text-[#591427]'
                              : 'bg-[#FFF1B5]/20 text-[#591427]'
                          }`}
                          title={h.titulo}
                        >
                          {h.titulo}
                        </div>
                      ))}
                      {hooksHoy.length > 2 && (
                        <p className="text-[9px] text-[#591427]/60">+{hooksHoy.length - 2} más</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {programados.length === 0 && (
              <p className="text-center text-xs text-[#591427]/60 mt-4">
                No tienes contenidos programados todavía. Asigna fechas desde "Mis ideas guardadas".
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vista Lista */}
      {vistaLista && (
        <div className="space-y-4">
          {(['pendiente', 'grabado', 'publicado'] as SavedHookEstado[]).map(estado => {
            const hooks = savedHooks.filter(h => h.estado === estado)
            if (hooks.length === 0) return null
            const EstadoIcon = ESTADO_LABELS[estado].icon
            return (
              <Card key={estado} className="border-[#F5F0EB] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-[#2A1520]">
                    <EstadoIcon className="w-4 h-4 text-[#591427]" />
                    {ESTADO_LABELS[estado].label} ({hooks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {hooks.map(h => (
                    <div
                      key={h.id}
                      className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-[#FFFBF0]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2A1520] truncate">{h.titulo}</p>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {h.tipoContenido && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFFBF0] border border-[#F5F0EB] text-[#591427]">
                              {h.tipoContenido}
                            </span>
                          )}
                          {h.servicio && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFFBF0] border border-[#F5F0EB] text-[#591427]">
                              {h.servicio}
                            </span>
                          )}
                          {h.fechaProgramada && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFF1B5]/20 border border-[#FFF1B5]/40 text-[#591427]">
                              {new Date(h.fechaProgramada).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                      <select
                        value={h.estado}
                        onChange={(e) => onUpdate(h.id, { estado: e.target.value as SavedHookEstado })}
                        className="text-xs px-2 py-1 rounded-lg border border-[#F5F0EB] bg-white text-[#591427]"
                      >
                        <option value="idea">Idea</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="grabado">Grabado</option>
                        <option value="publicado">Publicado</option>
                      </select>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
          {savedHooks.filter(h => h.estado !== 'idea').length === 0 && (
            <Card className="border-[#F5F0EB]">
              <CardContent className="p-8 text-center">
                <Calendar className="w-10 h-10 text-[#FFF1B5] mx-auto mb-3" />
                <p className="text-sm text-[#2A1520] font-medium">No hay contenidos en proceso</p>
                <p className="text-xs text-[#591427]/70 mt-1">
                  Cambia el estado de tus ideas guardadas a "pendiente de grabar" para verlas aquí.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
