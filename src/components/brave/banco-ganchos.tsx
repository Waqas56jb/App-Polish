'use client'

import { useState, useMemo } from 'react'
import {
  useAppStore,
  HookCard,
  SavedHook,
  SavedHookEstado,
  generateId,
} from '@/lib/store'
import { HOOKS_SEED, HOOK_CATEGORIAS } from '@/lib/hooks-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Bookmark,
  Copy,
  Check,
  ChevronRight,
  X,
  Sparkles,
  Save,
  Calendar,
  Trash2,
  Video,
  FileText,
  LayoutGrid,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Plus,
  Lightbulb,
  Heart,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BravyBot } from './bravy-bot'

type Vista = 'banco' | 'mis-ideas' | 'calendario'

// Categorías principales para chips rápidos (solo las que tienen hooks)
const CATEGORIAS_PRINCIPALES = [
  'Balayage', 'Rubios', 'Color', 'Tratamientos', 'Cortes',
  'Alisados', 'Canas', 'Errores comunes', 'Tendencias', 'Mitos',
]

// Colores suaves por categoría
const CATEGORIA_COLORS: Record<string, string> = {
  'Balayage': 'bg-amber-50 text-amber-800 border-amber-200',
  'Rubios': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Color': 'bg-rose-50 text-rose-800 border-rose-200',
  'Tratamientos': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Cortes': 'bg-orange-50 text-orange-800 border-orange-200',
  'Alisados': 'bg-violet-50 text-violet-800 border-violet-200',
  'Canas': 'bg-gray-50 text-gray-800 border-gray-200',
  'Cuidado en casa': 'bg-sky-50 text-sky-800 border-sky-200',
  'Errores comunes': 'bg-red-50 text-red-800 border-red-200',
  'Tendencias': 'bg-pink-50 text-pink-800 border-pink-200',
  'Mitos': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Antes y después': 'bg-teal-50 text-teal-800 border-teal-200',
  'Autoridad': 'bg-purple-50 text-purple-800 border-purple-200',
  'Ventas': 'bg-green-50 text-green-800 border-green-200',
}

const ESTADO_LABELS: Record<SavedHookEstado, { label: string; color: string; icon: any }> = {
  idea: { label: 'Idea guardada', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Bookmark },
  pendiente: { label: 'Pendiente', color: 'bg-sky-100 text-sky-800 border-sky-200', icon: Clock },
  grabado: { label: 'Grabado', color: 'bg-violet-100 text-violet-800 border-violet-200', icon: Video },
  publicado: { label: 'Publicado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
}

function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text)
  }
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
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
    setIsLoading,
  } = useAppStore()

  const [vista, setVista] = useState<Vista>('banco')
  const [categoriaActiva, setCategoriaActiva] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)

  // Hook seleccionado para ver detalle/generar
  const [hookSeleccionado, setHookSeleccionado] = useState<HookCard | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Generar contenido
  const [generando, setGenerando] = useState(false)
  const [resultadoGenerado, setResultadoGenerado] = useState<any>(null)

  // Dialogo crear gancho
  const [dialogoCrear, setDialogoCrear] = useState(false)

  // Todos los ganchos
  const todosGanchos = useMemo(() => {
    return [...customHooks, ...HOOKS_SEED]
  }, [customHooks])

  // Ganchos filtrados
  const ganchosFiltrados = useMemo(() => {
    return todosGanchos.filter(g => {
      if (categoriaActiva && g.categoria !== categoriaActiva) return false
      if (searchTerm) {
        const t = searchTerm.toLowerCase()
        return g.titulo.toLowerCase().includes(t) || g.categoria.toLowerCase().includes(t) || g.servicio.toLowerCase().includes(t)
      }
      return true
    })
  }, [todosGanchos, categoriaActiva, searchTerm])

  const yaGuardado = (hookId: string) => savedHooks.some(h => h.hookId === hookId)

  const handleGuardar = (gancho: HookCard) => {
    if (yaGuardado(gancho.id)) return
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
    setCopiado('saved-' + gancho.id)
    setTimeout(() => setCopiado(null), 1800)
  }

  const handleCopiarTitulo = (id: string, texto: string) => {
    copyToClipboard(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 1500)
  }

  // Abrir hook para ver guion completo
  const abrirHook = (gancho: HookCard) => {
    setHookSeleccionado(gancho)
    setResultadoGenerado(null)
    setModalOpen(true)
  }

  // Generar contenido desde hook
  const handleGenerar = async () => {
    if (!hookSeleccionado) return
    setGenerando(true)
    setIsLoading(true, 'Generando contenido...')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generar-desde-gancho',
          brandProfile,
          context: {
            gancho: hookSeleccionado.titulo,
            tipoContenido: 'reel',
            tono: 'cercano',
            modo: 'camara',
            servicio: hookSeleccionado.servicio,
          },
        }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setResultadoGenerado(data.result)
    } catch (e: any) {
      console.error('Generate error:', e)
    } finally {
      setGenerando(false)
      setIsLoading(false)
    }
  }

  // Guardar generado en biblioteca
  const handleGuardarGenerado = () => {
    if (!hookSeleccionado || !resultadoGenerado) return
    const titulo = resultadoGenerado.titulo || hookSeleccionado.titulo
    const guionTexto = resultadoGenerado.guion || ''

    // Guardar como SavedHook
    const saved: SavedHook = {
      id: generateId(),
      hookId: hookSeleccionado.id,
      titulo,
      tipoContenido: 'reel',
      servicio: hookSeleccionado.servicio,
      guionGenerado: guionTexto + (resultadoGenerado.copy ? '\n\nCOPY:\n' + resultadoGenerado.copy : '') + (resultadoGenerado.hashtags ? '\n\n' + resultadoGenerado.hashtags : ''),
      estado: 'pendiente',
      fechaProgramada: null,
      fechaGrabacion: null,
      createdAt: new Date().toISOString(),
    }
    saveHook(saved)

    // También en biblioteca general
    addLibraryItem({
      id: generateId(),
      tipo: 'reel',
      titulo,
      objetivo: hookSeleccionado.objetivo,
      servicio: hookSeleccionado.servicio,
      guion: guionTexto,
      copy: resultadoGenerado.copy || '',
      hashtags: resultadoGenerado.hashtags || '',
      textoPortada: resultadoGenerado.textoPortada || '',
      formato: 'hablando a cámara',
      estado: 'borrador',
      fecha: '',
      diaSemana: '',
      slides: resultadoGenerado.slides || [],
      storiesData: resultadoGenerado.stories || [],
      descripcion: hookSeleccionado.titulo,
      planId: '',
      createdAt: new Date().toISOString(),
    })

    setCopiado('generado')
    setTimeout(() => setCopiado(null), 1800)
  }

  return (
    <div className="space-y-5">
      {/* Cabecera compacta */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Banco de Ganchos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Ideas listas para usar. Elige, guarda y crea.</p>
        </div>
      </div>

      {/* Selector de vista simple */}
      <div className="flex gap-1.5 bg-card rounded-2xl p-1 shadow-sm border border-border w-fit">
        {[
          { key: 'banco' as Vista, label: 'Ganchos', icon: Lightbulb },
          { key: 'mis-ideas' as Vista, label: 'Guardados', icon: Bookmark },
          { key: 'calendario' as Vista, label: 'Calendario', icon: Calendar },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setVista(v.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              vista === v.key
                ? 'brave-gradient text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <v.icon className="w-4 h-4" />
            {v.label}
          </button>
        ))}
      </div>

      {/* VISTA: BANCO */}
      {vista === 'banco' && (
        <div className="space-y-4">
          {/* Búsqueda + categorías en una sola barra compacta */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título o tema..."
                className="pl-10 bg-card border-border rounded-xl h-10"
              />
            </div>

            {/* Chips de categorías horizontales - scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
              <button
                onClick={() => setCategoriaActiva('')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  !categoriaActiva
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                Todos
              </button>
              {CATEGORIAS_PRINCIPALES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat === categoriaActiva ? '' : cat)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    cat === categoriaActiva
                      ? 'bg-foreground text-background border-foreground'
                      : `${CATEGORIA_COLORS[cat] || 'bg-card text-muted-foreground border-border'} hover:opacity-80`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de tarjetas simplificado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ganchosFiltrados.map((gancho, idx) => {
              const guardado = yaGuardado(gancho.id)
              return (
                <motion.div
                  key={gancho.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                >
                  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 group rounded-2xl overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      {/* Categoría badge */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORIA_COLORS[gancho.categoria] || 'bg-muted text-muted-foreground border-border'}`}>
                          {gancho.categoria}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {gancho.impacto} impacto
                        </span>
                      </div>

                      {/* Gancho - texto principal */}
                      <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                        &ldquo;{gancho.titulo}&rdquo;
                      </p>

                      {/* Explicación breve */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {gancho.explicacion}
                      </p>

                      {/* Dos botones principales */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleGuardar(gancho)}
                          disabled={guardado}
                          variant={guardado ? 'secondary' : 'default'}
                          className={`flex-1 h-9 text-xs font-medium rounded-xl transition-all ${
                            guardado
                              ? 'bg-muted text-muted-foreground cursor-default'
                              : 'bg-card hover:bg-muted border border-border text-foreground'
                          }`}
                        >
                          {copiado === 'saved-' + gancho.id ? (
                            <><Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Guardado</>
                          ) : guardado ? (
                            <><Bookmark className="w-3.5 h-3.5 mr-1.5" /> En biblioteca</>
                          ) : (
                            <><Bookmark className="w-3.5 h-3.5 mr-1.5" /> Guardar</>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => abrirHook(gancho)}
                          className="flex-1 h-9 text-xs font-medium rounded-xl brave-gradient hover:opacity-90 text-white"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          Ver guion
                          <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {ganchosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <BravyBot size={56} expression="thinking" animate />
              <p className="text-foreground font-medium mt-3 text-sm">No se encontraron ganchos</p>
              <p className="text-xs text-muted-foreground mt-1">Prueba con otra categoría o búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* VISTA: MIS IDEAS GUARDADAS */}
      {vista === 'mis-ideas' && (
        <MisIdeasGuardadas
          savedHooks={savedHooks}
          onUpdate={updateSavedHook}
          onRemove={removeSavedHook}
        />
      )}

      {/* VISTA: CALENDARIO */}
      {vista === 'calendario' && (
        <CalendarioSimple
          savedHooks={savedHooks}
          onUpdate={updateSavedHook}
        />
      )}

      {/* MODAL: Ver guion completo del hook */}
      <AnimatePresence>
        {modalOpen && hookSeleccionado && (
          <ModalGuion
            gancho={hookSeleccionado}
            resultadoGenerado={resultadoGenerado}
            generando={generando}
            copiado={copiado}
            guardado={yaGuardado(hookSeleccionado.id)}
            onClose={() => {
              setModalOpen(false)
              setHookSeleccionado(null)
              setResultadoGenerado(null)
            }}
            onGuardar={() => handleGuardar(hookSeleccionado!)}
            onGenerar={handleGenerar}
            onGuardarGenerado={handleGuardarGenerado}
            onCopiar={(field, text) => {
              copyToClipboard(text)
              setCopiado(field)
              setTimeout(() => setCopiado(null), 1500)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// MODAL: Ver guion completo + copy de publicación
// ============================================================
function ModalGuion({
  gancho,
  resultadoGenerado,
  generando,
  copiado,
  guardado,
  onClose,
  onGuardar,
  onGenerar,
  onGuardarGenerado,
  onCopiar,
}: {
  gancho: HookCard
  resultadoGenerado: any
  generando: boolean
  copiado: string | null
  guardado: boolean
  onClose: () => void
  onGuardar: () => void
  onGenerar: () => void
  onGuardarGenerado: () => void
  onCopiar: (field: string, text: string) => void
}) {
  const [showDetalle, setShowDetalle] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="brave-gradient p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20`}>
              {gancho.categoria}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
              {gancho.tipo} · {gancho.objetivo}
            </span>
          </div>
          <h2 className="text-xl font-bold leading-snug pr-8">
            &ldquo;{gancho.titulo}&rdquo;
          </h2>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Info rápida */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Servicio</p>
              <p className="text-sm font-medium text-foreground">{gancho.servicio}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Impacto</p>
              <p className="text-sm font-medium text-foreground">{gancho.impacto}</p>
            </div>
          </div>

          {/* Botón generar contenido */}
          {!resultadoGenerado && (
            <Button
              onClick={onGenerar}
              disabled={generando}
              className="w-full h-11 rounded-xl brave-gradient hover:opacity-90 text-white font-medium text-sm"
            >
              {generando ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando contenido...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generar guion completo</>
              )}
            </Button>
          )}

          {/* Resultado generado */}
          {resultadoGenerado && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contenido generado</p>
                <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800">
                  Listo para usar
                </Badge>
              </div>

              {/* Guion */}
              {resultadoGenerado.guion && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Guion completo</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopiar('guion', resultadoGenerado.guion)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiado === 'guion' ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiado === 'guion' ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground whitespace-pre-line max-h-[200px] overflow-y-auto leading-relaxed">
                    {resultadoGenerado.guion}
                  </div>
                </div>
              )}

              {/* Copy de publicación */}
              {resultadoGenerado.copy && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Copy de publicación</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopiar('copy', resultadoGenerado.copy)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiado === 'copy' ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiado === 'copy' ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground leading-relaxed">
                    {resultadoGenerado.copy}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {resultadoGenerado.hashtags && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Hashtags</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopiar('hashtags', resultadoGenerado.hashtags)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiado === 'hashtags' ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiado === 'hashtags' ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-3 text-sm text-primary font-medium">
                    {resultadoGenerado.hashtags}
                  </div>
                </div>
              )}

              {/* Slides (carrusel) */}
              {resultadoGenerado.slides && resultadoGenerado.slides.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Slides del carrusel</label>
                  <div className="space-y-1.5">
                    {resultadoGenerado.slides.map((s: any, i: number) => (
                      <div key={i} className="bg-muted/50 rounded-xl p-3 flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                          {s.numero}
                        </div>
                        <p className="text-sm text-foreground flex-1">{s.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones post-generación */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={onGenerar}
                  disabled={generando}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl border-border text-foreground"
                >
                  {generando ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
                  Regenerar
                </Button>
                <Button
                  onClick={onGuardarGenerado}
                  disabled={copiado === 'generado'}
                  className="flex-1 h-10 rounded-xl brave-gradient hover:opacity-90 text-white"
                >
                  {copiado === 'generado' ? (
                    <><Check className="w-4 h-4 mr-1.5" /> Guardado</>
                  ) : (
                    <><Save className="w-4 h-4 mr-1.5" /> Guardar en biblioteca</>
                  )}
                </Button>
              </div>

              {/* Copiar todo */}
              <Button
                variant="ghost"
                onClick={() => {
                  const all = [
                    resultadoGenerado.guion,
                    '',
                    '--- COPY ---',
                    resultadoGenerado.copy,
                    '',
                    resultadoGenerado.hashtags,
                  ].filter(Boolean).join('\n')
                  onCopiar('all', all)
                }}
                className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
              >
                {copiado === 'all' ? <Check className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                {copiado === 'all' ? 'Todo copiado' : 'Copiar todo el contenido'}
              </Button>
            </div>
          )}

          {/* Detalle del hook (colapsable) */}
          {!resultadoGenerado && (
            <div>
              <button
                onClick={() => setShowDetalle(!showDetalle)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className={`w-3 h-3 transition-transform ${showDetalle ? 'rotate-90' : ''}`} />
                Ver análisis del gancho
              </button>
              <AnimatePresence>
                {showDetalle && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-3">
                      <div className="bg-muted/50 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" /> Por qué funciona
                        </p>
                        <p className="text-sm text-foreground">{gancho.explicacion}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Dolor que toca
                        </p>
                        <p className="text-sm text-foreground">{gancho.dolor}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Deseo que activa
                        </p>
                        <p className="text-sm text-foreground">{gancho.deseo}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Idea visual
                        </p>
                        <p className="text-sm text-foreground">{gancho.ideaVisual}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex gap-2">
          <Button
            onClick={onGuardar}
            disabled={guardado}
            variant="outline"
            className={`flex-1 h-10 rounded-xl transition-all ${
              guardado
                ? 'border-border text-muted-foreground cursor-default'
                : 'border-border text-foreground hover:bg-muted'
            }`}
          >
            {copiado === 'saved-hook' || guardado ? (
              <><Check className="w-4 h-4 mr-1.5 text-emerald-600" /> En biblioteca</>
            ) : (
              <><Bookmark className="w-4 h-4 mr-1.5" /> Guardar idea</>
            )}
          </Button>
          <Button
            onClick={onCopiar.bind(null, 'titulo', gancho.titulo)}
            className="h-10 px-5 rounded-xl bg-card border border-border text-foreground hover:bg-muted"
          >
            {copiado === 'titulo' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// SUBCOMPONENTE: Mis ideas guardadas (simplificado)
// ============================================================
function MisIdeasGuardadas({
  savedHooks,
  onUpdate,
  onRemove,
}: {
  savedHooks: SavedHook[]
  onUpdate: (id: string, updates: Partial<SavedHook>) => void
  onRemove: (id: string) => void
}) {
  const [filtroEstado, setFiltroEstado] = useState<SavedHookEstado | 'todos'>('todos')
  const [copiado, setCopiado] = useState<string | null>(null)

  const filtrados = savedHooks.filter(h => filtroEstado === 'todos' || h.estado === filtroEstado)

  if (savedHooks.length === 0) {
    return (
      <div className="text-center py-16">
        <BravyBot size={56} expression="happy" animate />
        <p className="text-foreground font-medium mt-3 text-sm">Aún no tienes ideas guardadas</p>
        <p className="text-xs text-muted-foreground mt-1">Guarda ganchos desde el banco para verlos aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtro por estado */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['todos', 'idea', 'pendiente', 'grabado', 'publicado'] as const).map(estado => {
          const count = estado === 'todos' ? savedHooks.length : savedHooks.filter(h => h.estado === estado).length
          const label = estado === 'todos' ? 'Todos' : ESTADO_LABELS[estado].label
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filtroEstado === estado
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                filtroEstado === estado ? 'bg-white/20' : 'bg-muted'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Lista */}
      <div className="space-y-2.5">
        {filtrados.map(hook => {
          const EstadoInfo = ESTADO_LABELS[hook.estado]
          const EstadoIcon = EstadoInfo.icon
          return (
            <Card key={hook.id} className="bg-card border-border shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Indicador de estado */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${EstadoInfo.color}`}>
                    <EstadoIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground leading-snug">{hook.titulo}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {hook.tipoContenido && (
                        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">{hook.tipoContenido}</Badge>
                      )}
                      {hook.servicio && (
                        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">{hook.servicio}</Badge>
                      )}
                    </div>

                    {hook.guionGenerado && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{hook.guionGenerado.substring(0, 120)}...</p>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <select
                        value={hook.estado}
                        onChange={(e) => onUpdate(hook.id, { estado: e.target.value as SavedHookEstado })}
                        className="text-xs px-2 py-1 rounded-lg border border-border bg-card text-foreground"
                      >
                        <option value="idea">Idea</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="grabado">Grabado</option>
                        <option value="publicado">Publicado</option>
                      </select>
                      {hook.guionGenerado && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            copyToClipboard(hook.guionGenerado)
                            setCopiado(hook.id)
                            setTimeout(() => setCopiado(null), 1500)
                          }}
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {copiado === hook.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemove(hook.id)}
                        className="h-7 text-xs text-destructive/60 hover:text-destructive hover:bg-destructive/5 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No hay ideas con ese estado</p>
        </div>
      )}
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

  const programados = savedHooks.filter(h => h.fechaProgramada)
  const porFecha = new Map<string, SavedHook[]>()
  programados.forEach(h => {
    if (!h.fechaProgramada) return
    const arr = porFecha.get(h.fechaProgramada) || []
    arr.push(h)
    porFecha.set(h.fechaProgramada, arr)
  })

  const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const finMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)
  const inicioGrid = new Date(inicioMes)
  inicioGrid.setDate(inicioGrid.getDate() - inicioGrid.getDay())
  const dias: Date[] = []
  const cursor = new Date(inicioGrid)
  while (cursor <= finMes || dias.length % 7 !== 0) {
    dias.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
    if (dias.length > 42) break
  }

  const monthName = mes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  if (programados.length === 0) {
    return (
      <div className="text-center py-16">
        <BravyBot size={56} expression="wave" animate />
        <p className="text-foreground font-medium mt-3 text-sm">Sin contenidos programados</p>
        <p className="text-xs text-muted-foreground mt-1">Asigna fechas a tus ideas guardadas para verlas aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
          className="border-border text-foreground h-8 rounded-lg"
        >
          ←
        </Button>
        <span className="text-sm font-semibold capitalize text-foreground min-w-[140px] text-center">{monthName}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
          className="border-border text-foreground h-8 rounded-lg"
        >
          →
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase text-muted-foreground py-1">{d}</div>
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
                  className={`min-h-[60px] p-1.5 rounded-xl border ${
                    enMes
                      ? 'bg-card border-border'
                      : 'bg-muted/30 border-transparent text-muted-foreground/40'
                  } ${esHoy ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}
                >
                  <p className="text-[10px] font-medium text-foreground mb-0.5">{dia.getDate()}</p>
                  <div className="space-y-0.5">
                    {hooksHoy.slice(0, 2).map(h => (
                      <div
                        key={h.id}
                        className={`text-[8px] px-1 py-0.5 rounded-md truncate ${
                          h.estado === 'publicado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : h.estado === 'grabado'
                            ? 'bg-violet-100 text-violet-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                        title={h.titulo}
                      >
                        {h.titulo}
                      </div>
                    ))}
                    {hooksHoy.length > 2 && (
                      <p className="text-[8px] text-muted-foreground">+{hooksHoy.length - 2}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de programados */}
      <div className="space-y-2">
        {programados.sort((a, b) => (a.fechaProgramada || '').localeCompare(b.fechaProgramada || '')).map(h => (
          <Card key={h.id} className="bg-card border-border shadow-sm rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{h.titulo}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {h.fechaProgramada && new Date(h.fechaProgramada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <select
                  value={h.estado}
                  onChange={(e) => onUpdate(h.id, { estado: e.target.value as SavedHookEstado })}
                  className="text-xs px-2 py-1 rounded-lg border border-border bg-card text-foreground"
                >
                  <option value="idea">Idea</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="grabado">Grabado</option>
                  <option value="publicado">Publicado</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
