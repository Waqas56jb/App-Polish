'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export type ModuleType = 'marca' | 'planificar' | 'crear' | 'biblioteca' | 'calendario' | 'stories'

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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeModule: 'marca',
      brandProfile: null,
      contentPlans: [],
      libraryItems: [],
      crearSubModule: 'reels',
      isLoading: false,
      loadingMessage: '',
      currentPlanItems: [],
      currentPlanConfig: null,

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
    }),
    {
      name: 'brave-studio-storage',
      partialize: (state) => ({
        activeModule: state.activeModule,
        brandProfile: state.brandProfile,
        contentPlans: state.contentPlans,
        libraryItems: state.libraryItems,
        crearSubModule: state.crearSubModule,
        currentPlanItems: state.currentPlanItems,
        currentPlanConfig: state.currentPlanConfig,
      }),
    }
  )
)

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
