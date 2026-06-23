'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { serverStorage } from './server-storage'

export interface BrandProfile {
  nombre: string
  salon: string
  ciudad: string
  instagram: string
  experiencia: string
  servicios: string[]
  serviciosPrioritarios: string[]
  objetivos: string
  clientaIdeal: string
  preguntasFrecuentes: string
  erroresFrecuentes: string
  nivelCamara: string
  facturacion: string
  documentText?: string
  documentName?: string
}

export interface SlideData {
  numero: number
  texto: string
}

export interface StoryData {
  numero: number
  texto: string
  sticker: string
  ideaVisual: string
}

export interface ContentItem {
  id: string
  tipo: 'reel' | 'carrusel' | 'story'
  titulo: string
  objetivo: string
  servicio: string
  guion: string
  copy: string
  hashtags: string
  textoPortada: string
  formato: string
  estado: 'borrador' | 'aprobado' | 'programado'
  fecha: string
  diaSemana: string
  slides: SlideData[]
  storiesData: StoryData[]
  descripcion: string
  planId: string
  createdAt: string
}

export interface ContentPlan {
  id: string
  tipo: 'semanal' | 'mensual'
  servicios: string[]
  frecuencia: number
  objetivo: string
  contenido: ContentItem[]
  createdAt: string
}

export type ModuleType =
  | 'inicio'
  | 'marca'
  | 'planificar'
  | 'crear'
  | 'biblioteca'
  | 'calendario'
  | 'stories'
  | 'asistente'
  | 'ganchos'

// ============================================================
// BANCO DE GANCHOS
// ============================================================

export type HookTipo =
  | 'Viral'
  | 'Educativo'
  | 'Autoridad'
  | 'Venta'
  | 'Engagement'
  | 'Dolor'
  | 'Deseo'
  | 'Objeción'
  | 'Tendencia'

export type HookImpacto = 'Alto' | 'Medio' | 'Bajo'

export interface HookCard {
  id: string
  titulo: string
  categoria: string
  tipo: HookTipo
  objetivo: string
  servicio: string
  impacto: HookImpacto
  explicacion: string
  dolor: string
  deseo: string
  ideaVisual: string
  esCustom?: boolean
}

export type SavedHookEstado =
  | 'idea'
  | 'pendiente'
  | 'grabado'
  | 'publicado'

export interface SavedHook {
  id: string
  hookId: string
  titulo: string
  tipoContenido: 'reel' | 'story' | 'carrusel' | ''
  servicio: string
  guionGenerado: string
  estado: SavedHookEstado
  fechaProgramada: string | null
  fechaGrabacion: string | null
  createdAt: string
}

// ============================================================
// ASISTENTE BRÄVE
// ============================================================

export type AsistenteRol = 'user' | 'assistant'

export interface AsistenteMessage {
  id: string
  rol: AsistenteRol
  texto: string
  modo: 'texto' | 'audio'
  timestamp: number
  sugerencias?: string[]
}

// ============================================================
// ROADMAP BRÄVE (métricas para recomendaciones del asistente)
// ============================================================

export interface RoadmapScore {
  comunicacion: number
  stories: number
  constancia: number
  autoridad: number
  ventas: number
}

interface AppState {
  activeModule: ModuleType
  brandProfile: BrandProfile | null
  contentPlans: ContentPlan[]
  libraryItems: ContentItem[]
  crearSubModule: 'reels' | 'stories' | 'carruseles'
  isLoading: boolean
  loadingMessage: string
  currentPlanItems: ContentItem[]
  currentPlanConfig: {
    tipo: 'semanal' | 'mensual'
    tipoContenido: 'reels' | 'carruseles' | 'mezcla'
    servicios: string[]
    frecuencia: number
    objetivo: string
  } | null
  // Banco de Ganchos
  customHooks: HookCard[]
  savedHooks: SavedHook[]
  // Asistente BRÄVE
  asistenteMensajes: AsistenteMessage[]
  asistenteAbierto: boolean
  // Roadmap (calcular a partir del estado de la marca)
  roadmapOverride: RoadmapScore | null

  setActiveModule: (module: ModuleType) => void
  setBrandProfile: (profile: BrandProfile) => void
  addContentPlan: (plan: ContentPlan) => void
  removeContentPlan: (id: string) => void
  addLibraryItem: (item: ContentItem) => void
  addLibraryItems: (items: ContentItem[]) => void
  updateLibraryItem: (id: string, updates: Partial<ContentItem>) => void
  removeLibraryItem: (id: string) => void
  approveContentItem: (id: string) => void
  scheduleContentItem: (id: string, fecha: string) => void
  setCrearSubModule: (sub: 'reels' | 'stories' | 'carruseles') => void
  setIsLoading: (loading: boolean, message?: string) => void
  replaceLibraryItem: (id: string, newItem: ContentItem) => void
  reorderLibraryItems: (ids: string[]) => void
  setCurrentPlanItems: (items: ContentItem[]) => void
  updateCurrentPlanItem: (id: string, updates: Partial<ContentItem>) => void
  removeCurrentPlanItem: (id: string) => void
  addCurrentPlanItem: (item: ContentItem) => void
  setCurrentPlanConfig: (config: AppState['currentPlanConfig']) => void
  clearCurrentPlan: () => void
  // Banco de Ganchos
  addCustomHook: (hook: HookCard) => void
  updateCustomHook: (id: string, updates: Partial<HookCard>) => void
  removeCustomHook: (id: string) => void
  saveHook: (hook: SavedHook) => void
  updateSavedHook: (id: string, updates: Partial<SavedHook>) => void
  removeSavedHook: (id: string) => void
  // Asistente BRÄVE
  addAsistenteMensaje: (msg: AsistenteMessage) => void
  clearAsistenteMensajes: () => void
  setAsistenteAbierto: (abierto: boolean) => void
  // Roadmap
  setRoadmapOverride: (scores: RoadmapScore | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeModule: 'inicio',
      brandProfile: null,
      contentPlans: [],
      libraryItems: [],
      crearSubModule: 'reels',
      isLoading: false,
      loadingMessage: '',
      currentPlanItems: [],
      currentPlanConfig: null,
      customHooks: [],
      savedHooks: [],
      asistenteMensajes: [],
      asistenteAbierto: false,
      roadmapOverride: null,

      setActiveModule: (module) => set({ activeModule: module }),
      setBrandProfile: (profile) => set({ brandProfile: profile }),
      addContentPlan: (plan) => set((state) => {
        // Idempotent: skip if plan with same id exists
        if (state.contentPlans.some(p => p.id === plan.id)) return state
        return { contentPlans: [...state.contentPlans, plan] }
      }),
      removeContentPlan: (id) => set((state) => ({ contentPlans: state.contentPlans.filter(p => p.id !== id) })),
      addLibraryItem: (item) => set((state) => {
        if (state.libraryItems.some(i => i.id === item.id)) return state
        return { libraryItems: [...state.libraryItems, item] }
      }),
      addLibraryItems: (items) => set((state) => {
        const existingIds = new Set(state.libraryItems.map(i => i.id))
        const newItems = items.filter(i => !existingIds.has(i.id))
        if (newItems.length === 0) return state
        return { libraryItems: [...state.libraryItems, ...newItems] }
      }),
      updateLibraryItem: (id, updates) => set((state) => ({
        libraryItems: state.libraryItems.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
      removeLibraryItem: (id) => set((state) => ({
        libraryItems: state.libraryItems.filter(item => item.id !== id)
      })),
      approveContentItem: (id) => set((state) => ({
        libraryItems: state.libraryItems.map(item => item.id === id ? { ...item, estado: 'aprobado' } : item)
      })),
      scheduleContentItem: (id, fecha) => set((state) => ({
        libraryItems: state.libraryItems.map(item => item.id === id ? { ...item, estado: 'programado', fecha } : item)
      })),
      setCrearSubModule: (sub) => set({ crearSubModule: sub }),
      setIsLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
      replaceLibraryItem: (id, newItem) => set((state) => ({
        libraryItems: state.libraryItems.map(item => item.id === id ? newItem : item)
      })),
      reorderLibraryItems: (ids) => set((state) => {
        const map = new Map(state.libraryItems.map(item => [item.id, item]))
        const reordered = ids.map(id => map.get(id)).filter(Boolean) as ContentItem[]
        const others = state.libraryItems.filter(item => !ids.includes(item.id))
        return { libraryItems: [...reordered, ...others] }
      }),
      setCurrentPlanItems: (items) => set({ currentPlanItems: items }),
      updateCurrentPlanItem: (id, updates) => set((state) => ({
        currentPlanItems: state.currentPlanItems.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
      removeCurrentPlanItem: (id) => set((state) => ({
        currentPlanItems: state.currentPlanItems.filter(item => item.id !== id)
      })),
      addCurrentPlanItem: (item) => set((state) => ({
        currentPlanItems: [...state.currentPlanItems, item]
      })),
      setCurrentPlanConfig: (config) => set({ currentPlanConfig: config }),
      clearCurrentPlan: () => set({ currentPlanItems: [], currentPlanConfig: null }),
      // Banco de Ganchos
      addCustomHook: (hook) => set((state) => ({
        customHooks: [hook, ...state.customHooks]
      })),
      updateCustomHook: (id, updates) => set((state) => ({
        customHooks: state.customHooks.map(h => h.id === id ? { ...h, ...updates } : h)
      })),
      removeCustomHook: (id) => set((state) => ({
        customHooks: state.customHooks.filter(h => h.id !== id)
      })),
      saveHook: (hook) => set((state) => ({
        savedHooks: state.savedHooks.some(h => h.id === hook.id)
          ? state.savedHooks.map(h => h.id === hook.id ? hook : h)
          : [hook, ...state.savedHooks]
      })),
      updateSavedHook: (id, updates) => set((state) => ({
        savedHooks: state.savedHooks.map(h => h.id === id ? { ...h, ...updates } : h)
      })),
      removeSavedHook: (id) => set((state) => ({
        savedHooks: state.savedHooks.filter(h => h.id !== id)
      })),
      // Asistente BRÄVE
      addAsistenteMensaje: (msg) => set((state) => ({
        asistenteMensajes: [...state.asistenteMensajes, msg]
      })),
      clearAsistenteMensajes: () => set({ asistenteMensajes: [] }),
      setAsistenteAbierto: (abierto) => set({ asistenteAbierto: abierto }),
      setRoadmapOverride: (scores) => set({ roadmapOverride: scores }),
    }),
    {
      name: 'brave-studio-storage',
      // Persist to the backend SQLite DB (via /api/workspace) instead of
      // browser localStorage. Hydration is async (network round-trip).
      storage: createJSONStorage(() => serverStorage),
      partialize: (state) => ({
        activeModule: state.activeModule,
        brandProfile: state.brandProfile,
        contentPlans: state.contentPlans,
        libraryItems: state.libraryItems,
        crearSubModule: state.crearSubModule,
        currentPlanItems: state.currentPlanItems,
        currentPlanConfig: state.currentPlanConfig,
        customHooks: state.customHooks,
        savedHooks: state.savedHooks,
        asistenteMensajes: state.asistenteMensajes,
      }),
    }
  )
)

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
