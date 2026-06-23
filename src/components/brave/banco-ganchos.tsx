'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  useAppStore,
  HookCard,
  SavedHook,
  generateId,
} from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Bookmark,
  Check,
  RefreshCw,
  Loader2,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Trash2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { BravyBot, getRandomMotivationalTip } from './bravy-bot'
import { fetchJSON } from '@/lib/fetch-safe'
import { ContentCardModal } from './content-modal'
import { ContentItem } from '@/lib/store'

// ============================================================
// BANCO DE GANCHOS — Versión simplificada
// Una sola pregunta: "¿De qué quieres ideas?"
// → Lista simple de ganchos, cada uno con: ver detalle / guardar
// ============================================================

// Servicios comunes en salones de belleza (config simple)
const TEMAS = [
  'Balayage',
  'Rubios',
  'Coloración',
  'Tratamientos',
  'Cortes',
  'Alisados',
  'Canas',
  'Tendencias',
  'Mitos del sector',
  'Errores comunes',
  'Ventas',
  'Mi marca personal',
] as const

export function BancoGanchos() {
  const { brandProfile, savedHooks, saveHook, removeSavedHook, addLibraryItem, setIsLoading } = useAppStore()

  const [temaSeleccionado, setTemaSeleccionado] = useState<string>('')
  const [ganchos, setGanchos] = useState<HookCard[]>([])
  const [generando, setGenerando] = useState(false)
  const [guardadosIds, setGuardadosIds] = useState<Set<string>>(new Set())
  const [tip] = useState(getRandomMotivationalTip)

  // Para el modal de detalle
  const [hookAbierto, setHookAbierto] = useState<HookCard | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [generandoScript, setGenerandoScript] = useState(false)

  // Para modal de contenido completo (cuando ya está guardado)
  const [libraryItemAbierto, setLibraryItemAbierto] = useState<ContentItem | null>(null)
  const [libraryModalOpen, setLibraryModalOpen] = useState(false)

  const hasInitialized = useRef(false)

  // Cargar ganchos al montar
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      generarGanchos('')
    }
  }, [])

  // Inicializar guardadosIds cuando cambian savedHooks
  useEffect(() => {
    setGuardadosIds(new Set(savedHooks.map(h => h.hookId)))
  }, [savedHooks])

  const generarGanchos = useCallback(async (tema: string) => {
    setGenerando(true)
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'ganchos-extra',
          brandProfile,
          context: {
            categoria: tema || undefined,
            tipo: undefined,
            numGanchos: 10,
          },
        }),
      })
      if (data?.result?.ganchos && Array.isArray(data.result.ganchos)) {
        const parsed = data.result.ganchos.map((g: any, i: number) => ({
          id: `hook-${Date.now()}-${i}`,
          titulo: g.titulo || '',
          categoria: g.categoria || tema || 'General',
          tipo: g.tipo || 'Viral',
          objetivo: g.objetivo || 'visibilidad',
          servicio: g.servicio || tema || '',
          impacto: g.impacto || 'Medio',
          explicacion: g.explicacion || '',
          dolor: g.dolor || '',
          deseo: g.deseo || '',
          ideaVisual: g.ideaVisual || '',
        }))
        setGanchos(parsed)
      } else {
        setGanchos(generateFallbackHooks(tema))
      }
    } catch {
      setGanchos(generateFallbackHooks(tema))
    } finally {
      setGenerando(false)
    }
  }, [brandProfile])

  const handleTema = (tema: string) => {
    const nuevo = tema === temaSeleccionado ? '' : tema
    setTemaSeleccionado(nuevo)
    generarGanchos(nuevo)
  }

  const handleRegenerar = () => generarGanchos(temaSeleccionado)

  const estaGuardado = (hookId: string) => guardadosIds.has(hookId)

  // Guardar gancho como idea en savedHooks (sin generar guion todavía)
  const handleGuardar = (gancho: HookCard) => {
    if (estaGuardado(gancho.id)) return
    saveHook({
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
    })
  }

  // Abrir modal de detalle del gancho
  const abrirHook = (gancho: HookCard) => {
    setHookAbierto(gancho)
    setResultado(null)
    setModalOpen(true)
  }

  // Generar guion completo desde el gancho abierto
  const handleGenerarScript = async () => {
    if (!hookAbierto) return
    setGenerandoScript(true)
    setIsLoading(true, 'Generando tu guion completo...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'generar-desde-gancho',
          brandProfile,
          context: {
            gancho: hookAbierto.titulo,
            tipoContenido: 'reel',
            tono: 'cercano',
            modo: 'camara',
            servicio: hookAbierto.servicio,
          },
        }),
      })
      if (!error) setResultado(data?.result)
    } catch (e) {
      console.error('Generate error:', e)
    } finally {
      setGenerandoScript(false)
      setIsLoading(false)
    }
  }

  // Guardar el contenido completo generado en la Biblioteca
  const handleGuardarABiblioteca = () => {
    if (!hookAbierto || !resultado) return
    const titulo = resultado.titulo || hookAbierto.titulo
    const nuevoItem: ContentItem = {
      id: generateId(),
      tipo: 'reel',
      titulo,
      objetivo: hookAbierto.objetivo,
      servicio: hookAbierto.servicio,
      guion: resultado.guion || '',
      copy: resultado.copy || '',
      hashtags: resultado.hashtags || '',
      textoPortada: resultado.textoPortada || '',
      formato: 'hablando a cámara',
      estado: 'borrador',
      fecha: '',
      diaSemana: '',
      slides: resultado.slides || [],
      storiesData: resultado.stories || [],
      descripcion: hookAbierto.titulo,
      planId: '',
      createdAt: new Date().toISOString(),
    }
    addLibraryItem(nuevoItem)
    setModalOpen(false)
    setHookAbierto(null)
    setResultado(null)
    // Mostrar el item recién guardado en el modal de contenido
    setLibraryItemAbierto(nuevoItem)
    setLibraryModalOpen(true)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <div className="brave-float inline-block">
          <BravyBot size={56} expression="excited" animate />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Banco de Ganchos</h1>
        <p className="text-sm text-muted-foreground">
          Elige un tema y te doy ideas que captan atención en los primeros 3 segundos
        </p>
      </div>

      {/* ── Selector de tema simple ── */}
      <div className="brave-glass rounded-2xl p-4 space-y-3">
        <label className="text-sm font-semibold text-foreground">¿De qué quieres ideas?</label>
        <div className="flex flex-wrap gap-2">
          {TEMAS.map(tema => (
            <button
              key={tema}
              onClick={() => handleTema(tema)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                temaSeleccionado === tema
                  ? 'brave-gradient text-white shadow-md'
                  : 'bg-white text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              {tema}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground italic">{tip}</p>
          <Button
            onClick={handleRegenerar}
            disabled={generando}
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-xl text-xs gap-1.5 shrink-0"
          >
            {generando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Regenerar
          </Button>
        </div>
      </div>

      {/* ── Lista de ganchos (formato lista simple) ── */}
      {generando ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="brave-glass rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : ganchos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">No hay ideas todavía. Pulsa "Regenerar".</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ganchos.map((gancho, idx) => {
            const guardado = estaGuardado(gancho.id)
            return (
              <motion.div
                key={gancho.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.25 }}
                className={`brave-glass rounded-xl p-4 flex items-start gap-3 transition-all ${
                  guardado ? 'ring-1 ring-[#FFF1B5]/60 bg-[#FFF1B5]/10' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    "{gancho.titulo}"
                  </p>
                  {gancho.explicacion && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{gancho.explicacion}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    onClick={() => abrirHook(gancho)}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 rounded-lg text-xs gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F5D680]" />
                    Ver
                  </Button>
                  <Button
                    onClick={() => handleGuardar(gancho)}
                    disabled={guardado}
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2.5 rounded-lg text-xs gap-1 ${
                      guardado ? 'text-emerald-600' : 'text-foreground hover:bg-[#FFF1B5]/20'
                    }`}
                  >
                    {guardado ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {guardado ? 'Guardado' : 'Guardar'}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Sección Guardados (lista simple) ── */}
      {savedHooks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#F5D680]" />
            <h2 className="text-sm font-bold text-foreground">Tus ideas guardadas</h2>
            <span className="text-xs text-muted-foreground">({savedHooks.length})</span>
          </div>
          <div className="space-y-2">
            {savedHooks.map(hook => (
              <div
                key={hook.id}
                className="brave-glass rounded-xl p-3 flex items-center gap-3"
              >
                <Lightbulb className="w-4 h-4 text-[#F5D680] shrink-0" />
                <p className="text-sm text-foreground flex-1 min-w-0 truncate">{hook.titulo}</p>
                <button
                  onClick={() => removeSavedHook(hook.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal: detalle del gancho + generar guion ── */}
      {modalOpen && hookAbierto && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-background rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="brave-gradient p-5 text-white sticky top-0 z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 uppercase tracking-wide font-semibold mb-1">
                    Gancho
                  </p>
                  <h3 className="text-lg font-bold leading-snug">"{hookAbierto.titulo}"</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/70 hover:text-white text-2xl leading-none shrink-0"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Explicación */}
              {hookAbierto.explicacion && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Por qué funciona
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{hookAbierto.explicacion}</p>
                </div>
              )}

              {hookAbierto.ideaVisual && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Idea visual
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{hookAbierto.ideaVisual}</p>
                </div>
              )}

              {/* Si no hay resultado generado → botón Generar */}
              {!resultado ? (
                <Button
                  onClick={handleGenerarScript}
                  disabled={generandoScript}
                  className="w-full h-12 rounded-2xl brave-gradient text-white font-semibold text-sm gap-2 shadow-lg"
                >
                  {generandoScript ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generando guion completo...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generar guion completo</>
                  )}
                </Button>
              ) : (
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Resultado generado */}
                  {resultado.guion && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Guion
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line bg-muted/40 rounded-xl p-3">
                        {resultado.guion}
                      </p>
                    </div>
                  )}
                  {resultado.copy && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Copy para el post
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line bg-muted/40 rounded-xl p-3">
                        {resultado.copy}
                      </p>
                    </div>
                  )}
                  {resultado.hashtags && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Hashtags
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line bg-muted/40 rounded-xl p-3">
                        {resultado.hashtags}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleGuardarABiblioteca}
                    className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm gap-2 shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    Guardar en mi Biblioteca
                  </Button>
                </div>
              )}

              {/* CTA inferior */}
              <p className="text-xs text-center text-muted-foreground pt-2">
                {resultado
                  ? 'Al guardar, lo verás en tu Biblioteca listo para agendar.'
                  : 'Genera el guion completo para copiar y guardar fácilmente.'}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modal de contenido completo (después de guardar) ── */}
      <ContentCardModal
        item={libraryItemAbierto}
        isOpen={libraryModalOpen}
        onClose={() => {
          setLibraryModalOpen(false)
          setLibraryItemAbierto(null)
        }}
        showConvertButton={false}
      />
    </div>
  )
}

// ─── Fallback: ganchos genéricos si la IA falla ──────────────
function generateFallbackHooks(tema: string): HookCard[] {
  const base = tema || 'tu salón'
  return [
    {
      id: `fb-1-${Date.now()}`,
      titulo: `Lo que nadie te cuenta sobre ${base}`,
      categoria: tema || 'General',
      tipo: 'Viral',
      objetivo: 'visibilidad',
      servicio: base,
      impacto: 'Alto',
      explicacion: 'Curiosidad pura: la audiencia quiere saber el secreto.',
      dolor: '',
      deseo: '',
      ideaVisual: 'Tu cara sorprendida + texto grande en pantalla',
    },
    {
      id: `fb-2-${Date.now()}`,
      titulo: `3 errores con ${base} que arruinan el resultado`,
      categoria: tema || 'General',
      tipo: 'Educativo',
      objetivo: 'autoridad',
      servicio: base,
      impacto: 'Alto',
      explicacion: 'Educar mientras demuestras autoridad técnica.',
      dolor: '',
      deseo: '',
      ideaVisual: 'Lista visual con fotos de errores reales',
    },
    {
      id: `fb-3-${Date.now()}`,
      titulo: `Antes y después de ${base} que te dejará sin palabras`,
      categoria: tema || 'General',
      tipo: 'Venta',
      objetivo: 'reservas',
      servicio: base,
      impacto: 'Alto',
      explicacion: 'Las transformaciones son el contenido que más convierte.',
      dolor: '',
      deseo: '',
      ideaVisual: 'Split screen antes/después con música potente',
    },
  ]
}
