'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  useAppStore,
  HookCard,
  SavedHook,
  SavedHookEstado,
  generateId,
} from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Bookmark,
  Copy,
  Check,
  X,
  Sparkles,
  Save,
  FileText,
  RefreshCw,
  Loader2,
  Lightbulb,
  Eye,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BravyBot, getRandomMotivationalTip } from './bravy-bot'
import { fetchJSON } from '@/lib/fetch-safe'

type Vista = 'banco' | 'guardados'

// Categorías con colores vibrantes Pantone
const CATEGORIAS = [
  { nombre: 'Balayage', color: 'bg-amber-100 text-amber-800 border-amber-300', active: 'bg-amber-500 text-white border-amber-500' },
  { nombre: 'Rubios', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', active: 'bg-yellow-500 text-white border-yellow-500' },
  { nombre: 'Color', color: 'bg-rose-100 text-rose-800 border-rose-300', active: 'bg-rose-500 text-white border-rose-500' },
  { nombre: 'Tratamientos', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', active: 'bg-emerald-500 text-white border-emerald-500' },
  { nombre: 'Cortes', color: 'bg-orange-100 text-orange-800 border-orange-300', active: 'bg-orange-500 text-white border-orange-500' },
  { nombre: 'Alisados', color: 'bg-violet-100 text-violet-800 border-violet-300', active: 'bg-violet-500 text-white border-violet-500' },
  { nombre: 'Canas', color: 'bg-slate-100 text-slate-800 border-slate-300', active: 'bg-slate-600 text-white border-slate-600' },
  { nombre: 'Tendencias', color: 'bg-pink-100 text-pink-800 border-pink-300', active: 'bg-pink-500 text-white border-pink-500' },
  { nombre: 'Mitos', color: 'bg-purple-100 text-purple-800 border-purple-300', active: 'bg-purple-500 text-white border-purple-500' },
  { nombre: 'Errores comunes', color: 'bg-red-100 text-red-800 border-red-300', active: 'bg-red-500 text-white border-red-500' },
  { nombre: 'Ventas', color: 'bg-green-100 text-green-800 border-green-300', active: 'bg-green-500 text-white border-green-500' },
  { nombre: 'Autoridad', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', active: 'bg-indigo-500 text-white border-indigo-500' },
]

const CATEGORIA_MAP = Object.fromEntries(CATEGORIAS.map(c => [c.nombre, c]))

const ESTADO_LABELS: Record<SavedHookEstado, { label: string; color: string }> = {
  idea: { label: 'Idea', color: 'bg-amber-100 text-amber-800' },
  pendiente: { label: 'Pendiente', color: 'bg-sky-100 text-sky-800' },
  grabado: { label: 'Grabado', color: 'bg-violet-100 text-violet-800' },
  publicado: { label: 'Publicado', color: 'bg-emerald-100 text-emerald-800' },
}

function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text)
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export function BancoGanchos() {
  const { brandProfile, savedHooks, saveHook, updateSavedHook, removeSavedHook, addLibraryItem, setIsLoading } = useAppStore()

  const [vista, setVista] = useState<Vista>('banco')
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [ganchos, setGanchos] = useState<HookCard[]>([])
  const [generando, setGenerando] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)

  // Modal state
  const [hookSeleccionado, setHookSeleccionado] = useState<HookCard | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [resultadoGenerado, setResultadoGenerado] = useState<any>(null)
  const [generandoScript, setGenerandoScript] = useState(false)
  const [tip, setTip] = useState(getRandomMotivationalTip())

  // Ref to avoid generating on first render
  const hasInitialized = useRef(false)

  // Auto-generate on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      generarGanchos('')
    }
  }, [])

  // Generate hooks via AI
  const generarGanchos = useCallback(async (categoria: string, search?: string) => {
    setGenerando(true)
    setTip(getRandomMotivationalTip())
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'ganchos-extra',
          brandProfile,
          context: {
            categoria: categoria || undefined,
            tipo: undefined,
            numGanchos: 12,
          },
        }),
      })
      if (data?.result?.ganchos && Array.isArray(data.result.ganchos)) {
        const parsed = data.result.ganchos.map((g: any, i: number) => ({
          id: `hook-gen-${Date.now()}-${i}`,
          titulo: g.titulo || '',
          categoria: g.categoria || categoria || 'General',
          tipo: g.tipo || 'Viral',
          objetivo: g.objetivo || 'visibilidad',
          servicio: g.servicio || '',
          impacto: g.impacto || 'Medio',
          explicacion: g.explicacion || '',
          dolor: g.dolor || '',
          deseo: g.deseo || '',
          ideaVisual: g.ideaVisual || '',
        }))
        // If search term, filter locally
        if (search) {
          const q = search.toLowerCase()
          const filtered = parsed.filter((g: HookCard) =>
            g.titulo.toLowerCase().includes(q) ||
            g.categoria.toLowerCase().includes(q) ||
            g.servicio.toLowerCase().includes(q) ||
            g.explicacion.toLowerCase().includes(q)
          )
          setGanchos(filtered.length > 0 ? filtered : parsed)
        } else {
          setGanchos(parsed)
        }
      } else {
        // Fallback: generate basic hooks
        setGanchos(generateFallbackHooks(categoria))
      }
    } catch {
      setGanchos(generateFallbackHooks(categoria))
    } finally {
      setGenerando(false)
    }
  }, [brandProfile])

  // Handle category click
  const handleCategoria = (cat: string) => {
    const nueva = cat === categoriaActiva ? '' : cat
    setCategoriaActiva(nueva)
    generarGanchos(nueva, searchTerm || undefined)
  }

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    // Debounce search
    if (term.length >= 2) {
      const timer = setTimeout(() => generarGanchos(categoriaActiva, term), 600)
      return () => clearTimeout(timer)
    } else if (term.length === 0) {
      generarGanchos(categoriaActiva)
    }
  }

  // Regenerate
  const handleRegenerar = () => {
    generarGanchos(categoriaActiva, searchTerm || undefined)
  }

  const yaGuardado = (hookId: string) => savedHooks.some(h => h.hookId === hookId)

  // Save hook to library
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

  // Open hook to read full script
  const abrirHook = (gancho: HookCard) => {
    setHookSeleccionado(gancho)
    setResultadoGenerado(null)
    setModalOpen(true)
  }

  // Generate content from hook
  const handleGenerar = async () => {
    if (!hookSeleccionado) return
    setGenerandoScript(true)
    setIsLoading(true, 'Generando guion completo...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
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
      if (!error) {
        setResultadoGenerado(data?.result)
      }
    } catch (e) {
      console.error('Generate error:', e)
    } finally {
      setGenerandoScript(false)
      setIsLoading(false)
    }
  }

  // Save generated content to library
  const handleGuardarGenerado = () => {
    if (!hookSeleccionado || !resultadoGenerado) return
    const titulo = resultadoGenerado.titulo || hookSeleccionado.titulo
    const guionTexto = resultadoGenerado.guion || ''

    saveHook({
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
    })

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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Banco de Ganchos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Ganchos que se regeneran según lo que buscas</p>
        </div>
        <Button
          onClick={handleRegenerar}
          disabled={generando}
          className="shrink-0 h-10 px-4 rounded-xl brave-gradient hover:opacity-90 text-white font-medium text-sm gap-2 shadow-md shadow-brave-chocolate/15"
        >
          {generando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Regenerar
        </Button>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 bg-card rounded-2xl p-1 shadow-sm border border-border w-fit">
        {[
          { key: 'banco' as Vista, label: 'Explorar', icon: Lightbulb },
          { key: 'guardados' as Vista, label: 'Guardados', icon: Bookmark },
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
            {v.key === 'guardados' && savedHooks.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                vista === v.key ? 'bg-white/25' : 'bg-muted'
              }`}>
                {savedHooks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* VISTA: EXPLORAR */}
      {vista === 'banco' && (
        <div className="space-y-4">
          {/* Mascot motivational tip */}
          <motion.div
            key={tip}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mascot-banner rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div className="brave-bounce">
              <BravyBot size={38} expression="wink" animate />
            </div>
            <p className="text-xs font-medium text-foreground leading-snug flex-1">{tip}</p>
          </motion.div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar tema, servicio o palabra clave..."
              className="pl-10 bg-card border-border rounded-xl h-11 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); generarGanchos(categoriaActiva) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            <button
              onClick={() => handleCategoria('')}
              className={`brave-chip shrink-0 border ${
                !categoriaActiva
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border'
              }`}
            >
              Todos
            </button>
            {CATEGORIAS.map(cat => {
              const isActive = categoriaActiva === cat.nombre
              return (
                <button
                  key={cat.nombre}
                  onClick={() => handleCategoria(cat.nombre)}
                  className={`brave-chip shrink-0 border ${isActive ? cat.active : cat.color}`}
                >
                  {cat.nombre}
                </button>
              )
            })}
          </div>

          {/* Generating state */}
          {generando ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="brave-float">
                <BravyBot size={72} expression="excited" animate speechBubble="Creando ganchos..." />
              </div>
              <div className="mt-5 w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full brave-shimmer rounded-full" />
              </div>
              <p className="text-sm text-muted-foreground mt-3 font-medium">
                {categoriaActiva ? `Buscando los mejores ganchos de ${categoriaActiva}...` : 'Generando ganchos para ti...'}
              </p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  {ganchos.length} ganchos {categoriaActiva && `en ${categoriaActiva}`}
                </p>
                <button
                  onClick={handleRegenerar}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors"
                >
                  <Zap className="w-3 h-3" /> Más opciones
                </button>
              </div>

              {/* Hook cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {ganchos.map((gancho, idx) => {
                    const guardado = yaGuardado(gancho.id)
                    const catInfo = CATEGORIA_MAP[gancho.categoria]
                    return (
                      <motion.div
                        key={gancho.id}
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
                      >
                        <Card className="bg-card border-border/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group">
                          {/* Colored top bar */}
                          <div className={`h-1 ${catInfo?.active?.replace('text-white', '').replace('border-', 'bg-').split(' ')[0] || 'bg-brave-pastel-blue'}`} />

                          <CardContent className="p-4 space-y-3">
                            {/* Category + Impact */}
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${catInfo?.color || 'bg-muted text-muted-foreground border-border'}`}>
                                {gancho.categoria}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                gancho.impacto === 'Alto'
                                  ? 'bg-red-50 text-red-600'
                                  : gancho.impacto === 'Medio'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-slate-50 text-slate-500'
                              }`}>
                                {gancho.impacto}
                              </span>
                            </div>

                            {/* Hook text - the star of the card */}
                            <p className="text-[15px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                              &ldquo;{gancho.titulo}&rdquo;
                            </p>

                            {/* Brief explanation */}
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {gancho.explicacion}
                            </p>

                            {/* 3 ACTION BUTTONS */}
                            <div className="flex gap-2 pt-1">
                              {/* 1. Guardar en biblioteca */}
                              <button
                                onClick={() => handleGuardar(gancho)}
                                disabled={guardado}
                                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all ${
                                  guardado
                                    ? 'bg-muted/70 text-muted-foreground cursor-default'
                                    : 'bg-card border border-border text-foreground hover:bg-brave-pastel-blue/30 hover:border-brave-pastel-blue'
                                }`}
                              >
                                {copiado === 'saved-' + gancho.id ? (
                                  <><Check className="w-3.5 h-3.5 text-emerald-500" /> Guardado</>
                                ) : guardado ? (
                                  <><Bookmark className="w-3.5 h-3.5" /> En biblioteca</>
                                ) : (
                                  <><Bookmark className="w-3.5 h-3.5" /> Guardar</>
                                )}
                              </button>

                              {/* 2. Abrir y leer guion entero */}
                              <button
                                onClick={() => abrirHook(gancho)}
                                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold brave-gradient text-white hover:opacity-90 transition-all shadow-sm shadow-brave-chocolate/10"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Guion
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {/* 3. Copy de la publicación */}
                              <button
                                onClick={() => {
                                  copyToClipboard(gancho.titulo)
                                  setCopiado('copy-' + gancho.id)
                                  setTimeout(() => setCopiado(null), 1500)
                                }}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                              >
                                {copiado === 'copy-' + gancho.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {ganchos.length === 0 && !generando && (
                <div className="flex flex-col items-center py-16">
                  <BravyBot size={56} expression="thinking" animate />
                  <p className="text-foreground font-medium mt-3 text-sm">No se encontraron ganchos</p>
                  <Button
                    onClick={handleRegenerar}
                    variant="outline"
                    className="mt-3 rounded-xl border-border text-foreground"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerar ganchos
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* VISTA: GUARDADOS */}
      {vista === 'guardados' && (
        <Guardados
          savedHooks={savedHooks}
          onUpdate={updateSavedHook}
          onRemove={removeSavedHook}
        />
      )}

      {/* MODAL: Full script + generated content */}
      <AnimatePresence>
        {modalOpen && hookSeleccionado && (
          <ModalGuion
            gancho={hookSeleccionado}
            resultadoGenerado={resultadoGenerado}
            generandoScript={generandoScript}
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
// MODAL: Full script viewer
// ============================================================
function ModalGuion({
  gancho,
  resultadoGenerado,
  generandoScript,
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
  generandoScript: boolean
  copiado: string | null
  guardado: boolean
  onClose: () => void
  onGuardar: () => void
  onGenerar: () => void
  onGuardarGenerado: () => void
  onCopiar: (field: string, text: string) => void
}) {
  const catInfo = CATEGORIA_MAP[gancho.categoria]

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
        <div className="brave-gradient p-5 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-white/5" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/20">
              {gancho.categoria}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
              {gancho.tipo} · {gancho.impacto}
            </span>
          </div>
          <h2 className="text-xl font-bold leading-snug pr-8 relative z-10">
            &ldquo;{gancho.titulo}&rdquo;
          </h2>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Quick info */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Servicio</p>
              <p className="text-sm font-medium text-foreground">{gancho.servicio}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Objetivo</p>
              <p className="text-sm font-medium text-foreground capitalize">{gancho.objetivo}</p>
            </div>
          </div>

          {/* Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-brave-sky/40 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Por qué funciona
              </p>
              <p className="text-xs text-foreground leading-relaxed">{gancho.explicacion}</p>
            </div>
            <div className="bg-brave-rose/30 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Dolor que toca</p>
              <p className="text-xs text-foreground leading-relaxed">{gancho.dolor}</p>
            </div>
            <div className="bg-brave-mint/40 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Deseo que activa</p>
              <p className="text-xs text-foreground leading-relaxed">{gancho.deseo}</p>
            </div>
          </div>

          {/* Generate button */}
          {!resultadoGenerado && (
            <Button
              onClick={onGenerar}
              disabled={generandoScript}
              className="w-full h-12 rounded-xl brave-gradient hover:opacity-90 text-white font-semibold text-sm gap-2 shadow-md shadow-brave-chocolate/10"
            >
              {generandoScript ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generando contenido...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generar guion completo</>
              )}
            </Button>
          )}

          {/* Generated content */}
          {resultadoGenerado && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contenido generado</p>
                <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold">
                  Listo para usar
                </Badge>
              </div>

              {/* Script */}
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
                      {copiado === 'guion' ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiado === 'guion' ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-4 text-sm text-foreground whitespace-pre-line max-h-[200px] overflow-y-auto leading-relaxed">
                    {resultadoGenerado.guion}
                  </div>
                </div>
              )}

              {/* Copy */}
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
                      {copiado === 'copy' ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiado === 'copy' ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-4 text-sm text-foreground leading-relaxed">
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
                      {copiado === 'hashtags' ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiado === 'hashtags' ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-3 text-sm text-primary font-medium">
                    {resultadoGenerado.hashtags}
                  </div>
                </div>
              )}

              {/* Slides */}
              {resultadoGenerado.slides && resultadoGenerado.slides.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Slides del carrusel</label>
                  <div className="space-y-1.5">
                    {resultadoGenerado.slides.map((s: any, i: number) => (
                      <div key={i} className="bg-muted/40 rounded-xl p-3 flex gap-3">
                        <div className="w-7 h-7 rounded-full brave-gradient flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {s.numero}
                        </div>
                        <p className="text-sm text-foreground flex-1">{s.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post-generation actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={onGenerar}
                  disabled={generandoScript}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl border-border text-foreground"
                >
                  {generandoScript ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
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

              {/* Copy all */}
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex gap-2">
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
              <><Check className="w-4 h-4 mr-1.5 text-emerald-500" /> En biblioteca</>
            ) : (
              <><Bookmark className="w-4 h-4 mr-1.5" /> Guardar idea</>
            )}
          </Button>
          <Button
            onClick={onCopiar.bind(null, 'titulo', gancho.titulo)}
            className="h-10 px-5 rounded-xl bg-card border border-border text-foreground hover:bg-muted"
          >
            {copiado === 'titulo' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// GUARDADOS
// ============================================================
function Guardados({
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
        <p className="text-foreground font-medium mt-3 text-sm">Aún no tienes ganchos guardados</p>
        <p className="text-xs text-muted-foreground mt-1">Explora el banco y guarda los que te gusten</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['todos', 'idea', 'pendiente', 'grabado', 'publicado'] as const).map(estado => {
          const count = estado === 'todos' ? savedHooks.length : savedHooks.filter(h => h.estado === estado).length
          const label = estado === 'todos' ? 'Todos' : ESTADO_LABELS[estado].label
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`brave-chip shrink-0 border text-[11px] ${
                filtroEstado === estado
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border'
              }`}
            >
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                filtroEstado === estado ? 'bg-white/25' : 'bg-muted'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filtrados.map(hook => {
          const estadoInfo = ESTADO_LABELS[hook.estado]
          return (
            <Card key={hook.id} className="bg-card border-border shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${estadoInfo.color}`}>
                    <Bookmark className="w-3.5 h-3.5" />
                  </div>
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

                    {/* Actions */}
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
                          {copiado === hook.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemove(hook.id)}
                        className="h-7 text-xs text-destructive/60 hover:text-destructive hover:bg-destructive/5 ml-auto"
                      >
                        <X className="w-3 h-3" />
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
          <p className="text-sm text-muted-foreground">No hay ganchos con ese estado</p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// FALLBACK HOOKS (when API fails)
// ============================================================
function generateFallbackHooks(categoria: string): HookCard[] {
  const fallbackData: Record<string, HookCard[]> = {
    'Balayage': [
      { id: `fb-${Date.now()}-1`, titulo: 'Si tu balayage se ve naranja, puede que estés haciendo esto', categoria: 'Balayage', tipo: 'Objeción', objetivo: 'autoridad', servicio: 'Balayage', impacto: 'Alto', explicacion: 'Nombre un problema específico muy común en balayage. La clienta se siente identificada al instante.', dolor: 'Tener un balayage que se ve naranja o cobrizo y no saber por qué.', deseo: 'Un balayage limpio, frío y luminoso como en Pinterest.', ideaVisual: 'Foto de un balayage cobrizo vs. un balayaje correcto, comparativa lado a lado.' },
      { id: `fb-${Date.now()}-2`, titulo: 'No necesitas cambiar todo tu cabello para verte diferente', categoria: 'Balayage', tipo: 'Deseo', objetivo: 'reservas', servicio: 'Balayage', impacto: 'Alto', explicacion: 'Quita el miedo al cambio drástico. Baja la barrera de entrada para clientas indecisas.', dolor: 'Miedo a un cambio radical que no pueda deshacer.', deseo: 'Un cambio visible pero sutil que la haga sentir renovada.', ideaVisual: 'Antes/después de un iluminados sutil o un babylights discreto.' },
      { id: `fb-${Date.now()}-3`, titulo: '3 cosas que revisamos antes de hacer un balayage', categoria: 'Balayage', tipo: 'Autoridad', objetivo: 'autoridad', servicio: 'Balayage', impacto: 'Medio', explicacion: 'Muestra el proceso profesional detrás del servicio. Genera confianza y justifica el precio.', dolor: 'Dudas sobre si la estilista sabe lo que hace o solo aplica sin más.', deseo: 'Sentirse en manos de una profesional que analiza antes de actuar.', ideaVisual: 'Plano de tus manos revisando el cabello de la clienta, evaluando grosor, color base, etc.' },
    ],
    'Rubios': [
      { id: `fb-${Date.now()}-4`, titulo: 'No todos los rubios favorecen igual', categoria: 'Rubios', tipo: 'Educativo', objetivo: 'autoridad', servicio: 'Rubios', impacto: 'Alto', explicacion: 'Revela una verdad que muchas clientas ignoran. Genera curiosidad sobre cuál es SU rubio.', dolor: 'Haberse teñido de rubio y sentir que no le favorece.', deseo: 'Encontrar el rubio que sí le sienta bien a su tono de piel.', ideaVisual: 'Mosaico de 4 rubios diferentes sobre pieles distintas.' },
      { id: `fb-${Date.now()}-5`, titulo: 'La diferencia entre un rubio bonito y un rubio bien hecho', categoria: 'Rubios', tipo: 'Autoridad', objetivo: 'autoridad', servicio: 'Rubios', impacto: 'Alto', explicacion: 'Diferencia sutil que solo una experta puede explicar. Refuerza autoridad técnica.', dolor: 'Haber pagado un rubio que se ve "bonito" pero no profesional.', deseo: 'Lucir un rubio que se note bien hecho, que dure y no se rompa.', ideaVisual: 'Comparativa de dos rubios: uno con bandas, otro con degradado limpio.' },
    ],
    'Color': [
      { id: `fb-${Date.now()}-6`, titulo: 'Por qué tu color no se ve como el de la foto', categoria: 'Color', tipo: 'Objeción', objetivo: 'autoridad', servicio: 'Color', impacto: 'Alto', explicacion: 'Aborda la objeción más común del sector. Educa y previene frustraciones futuras.', dolor: 'Llevar una foto de Pinterest y que el resultado no se parezca en nada.', deseo: 'Entender qué se puede y qué no se puede lograr con su cabello.', ideaVisual: 'Pantalla dividida: la foto de referencia vs. el resultado real explicando las diferencias.' },
      { id: `fb-${Date.now()}-7`, titulo: 'El error que hace que tu color pierda brillo antes de tiempo', categoria: 'Color', tipo: 'Dolor', objetivo: 'autoridad', servicio: 'Color', impacto: 'Alto', explicacion: 'Toca un dolor universal (color que se apaga) y promete revelar la causa.', dolor: 'Ver cómo el color que tanto costó se apaga en dos semanas.', deseo: 'Mantener el color vibrante más tiempo sin esfuerzo extra.', ideaVisual: 'Primer plano de un cabello apagado vs. cabello brillante, split screen.' },
    ],
    'General': [
      { id: `fb-${Date.now()}-8`, titulo: '5 cortes de pelo que van a ser tendencia este año', categoria: 'Tendencias', tipo: 'Tendencia', objetivo: 'visibilidad', servicio: 'Cortes', impacto: 'Alto', explicacion: 'Apela al FOMO y posiciona la estilista como referente de tendencias.', dolor: 'Miedo a quedarse desactualizada o parecer anticuada.', deseo: 'Pertenecer al grupo de mujeres que llevan lo último.', ideaVisual: 'Collage rápido de 5 cortes en tendencia con transiciones al ritmo de la música.' },
      { id: `fb-${Date.now()}-9`, titulo: 'El error que cometes antes de hacerte un cambio de look', categoria: 'Errores comunes', tipo: 'Dolor', objetivo: 'autoridad', servicio: 'Cortes', impacto: 'Alto', explicacion: 'Curiosidad pura. Promete evitar un arrepentimiento.', dolor: 'Haberse arrepentido de un cambio de look en el pasado.', deseo: 'Hacer el cambio correcto sin equivocarse.', ideaVisual: 'Selfie tuya mirando a cámara con texto encima, transición a un antes/después.' },
      { id: `fb-${Date.now()}-10`, titulo: 'Si tienes canas, esto te interesa', categoria: 'Canas', tipo: 'Engagement', objetivo: 'visibilidad', servicio: 'Color', impacto: 'Alto', explicacion: 'Filtro directo a un nicho. Aumenta el tiempo de visualización.', dolor: 'Sentir que las canas envejecen y no saber qué hacer.', deseo: 'Cubrir, integrar o lucir las canas con elegancia.', ideaVisual: 'Antes/después de un coverage de canas o un gray blending sutil.' },
    ],
  }

  return fallbackData[categoria] || fallbackData['General'] || fallbackData['Balayage']
}