'use client'

import { useState, useEffect } from 'react'
import { useAppStore, ContentItem, generateId } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Lightbulb, RefreshCw, Save, FileText, Sparkles, X } from 'lucide-react'
import { BravyBot } from './bravy-bot'
import { motion } from 'framer-motion'
import { fetchJSON } from '@/lib/fetch-safe'

export function DameUnaIdea() {
  const { brandProfile, addLibraryItems, setIsLoading, isLoading } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [idea, setIdea] = useState<any>(null)

  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('openDameUnaIdea', handler)
    return () => window.removeEventListener('openDameUnaIdea', handler)
  }, [])

  const generateIdea = async () => {
    setIsLoading(true, 'Pensando una idea para ti...')
    try {
      const { data, error } = await fetchJSON('/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          type: 'quick-idea',
          brandProfile,
        }),
      })
      if (!error && data?.result && !data.result.raw) {
        setIdea(data.result)
      } else {
        setIdea(generateFallbackIdea())
      }
    } catch {
      setIdea(generateFallbackIdea())
    } finally {
      setIsLoading(false)
    }
  }

  const generateFallbackIdea = () => {
    const servicios = brandProfile?.serviciosPrioritarios || brandProfile?.servicios || ['Balayage']
    const servicio = servicios[Math.floor(Math.random() * servicios.length)]
    const tipos = ['reel', 'carrusel', 'story'] as const
    const tipo = tipos[Math.floor(Math.random() * tipos.length)]
    const objetivos = ['autoridad', 'reservas', 'educación', 'visibilidad']
    const objetivo = objetivos[Math.floor(Math.random() * objetivos.length)]

    const ideas = [
      `3 cosas que nadie te dijo sobre ${servicio}`,
      `El error #1 que arruina tu ${servicio.toLowerCase()}`,
      `¿Por qué las clientas vuelven a mi salón por ${servicio.toLowerCase()}?`,
      `Antes y después: transformación con ${servicio.toLowerCase()}`,
      `Respondo la pregunta que más me hacen sobre ${servicio.toLowerCase()}`,
      `Mi secreto para un ${servicio.toLowerCase()} perfecto`,
      `Esto es lo que pasa cuando confías en una experta para tu ${servicio.toLowerCase()}`,
    ]

    return {
      titulo: ideas[Math.floor(Math.random() * ideas.length)],
      tipo,
      objetivo,
      descripcion: `Publica un ${tipo} sobre ${servicio} enfocado en ${objetivo}. Muestra tu trabajo y genera interacción con tu audiencia.`,
      guion: `GANCHO: "¿Sabías que el 80% de las mujeres cometen este error con su ${servicio.toLowerCase()}?"\n\nCONTEXTO: Te cuento lo que veo todos los días en mi salón...\n\nSOLUCIÓN: La clave está en... (explica tu método)\n\nCTA: Si quieres un ${servicio.toLowerCase()} que realmente te favorezca, escríbeme por DM.`,
    }
  }

  const handleSave = () => {
    if (!idea) return
    addLibraryItems([{
      id: generateId(),
      tipo: idea.tipo || 'reel',
      titulo: idea.titulo,
      objetivo: idea.objetivo || '',
      servicio: brandProfile?.serviciosPrioritarios?.[0] || brandProfile?.servicios?.[0] || '',
      guion: idea.guion || '',
      copy: idea.descripcion || '',
      hashtags: '',
      textoPortada: idea.titulo,
      formato: '',
      estado: 'borrador',
      fecha: '',
      slides: [],
      storiesData: [],
      planId: '',
      createdAt: new Date().toISOString(),
    }])
    setIsOpen(false)
    setIdea(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden rounded-3xl">
        {/* Header with gradient */}
        <div className="brave-gradient p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              ¡Dame una idea!
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-sm mt-2">
            La IA analiza tu marca y te dice exactamente qué publicar hoy
          </p>
        </div>

        <div className="p-6 space-y-4">
          {!idea && !isLoading && (
            <div className="text-center py-8">
              <div className="brave-float inline-block mb-4">
                <BravyBot size={72} expression="excited" animate speechBubble="Pide una idea!" />
              </div>
              <p className="text-muted-foreground mb-6">
                ¿No sabes qué publicar hoy? <br />
                Deja que la IA te dé una idea
              </p>
              <Button
                onClick={generateIdea}
                className="px-8 py-6 text-base font-bold rounded-2xl shadow-lg brave-gradient hover:opacity-90 text-white"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                DAME UNA IDEA
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-[#C1DBE8] animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Pensando la mejor idea para ti...</p>
            </div>
          )}

          {idea && !isLoading && (
            <div className="space-y-4">
              <Card className="border-l-4 border-l-[#FFF1B5] shadow-md bg-[#FFFBF0]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      idea.tipo === 'reel' ? 'bg-[#C1DBE8]' : idea.tipo === 'carrusel' ? 'bg-[#FFF1B5]' : 'bg-[#591427]'
                    }`}>
                      {String(idea.tipo || 'REEL').toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-[#591427] capitalize">
                      {idea.objetivo}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#2A1520]">{idea.titulo}</h3>
                  {idea.descripcion && (
                    <p className="text-sm text-muted-foreground mt-1">{idea.descripcion}</p>
                  )}
                </CardContent>
              </Card>

              {idea.guion && (
                <Card className="border-none shadow-md">
                  <CardContent className="p-4">
                    <label className="text-sm font-bold text-[#591427] flex items-center gap-1 mb-2">
                      <FileText className="w-4 h-4" />
                      Guión rápido
                    </label>
                    <div className="bg-[#FFFBF0] p-3 rounded-xl whitespace-pre-line text-sm text-[#2A1520]">
                      {idea.guion}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={generateIdea}
                  variant="outline"
                  className="flex-1 border-[#C1DBE8] text-[#C1DBE8] hover:bg-[#F5F0EB]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Otra idea
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-[#591427] hover:bg-[#7A2A40] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
