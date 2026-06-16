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
  slides: SlideData[]
  storiesData: StoryData[]
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

export type ModuleType = 'marca' | 'planificar' | 'crear' | 'biblioteca' | 'calendario'

interface AppState {
  activeModule: ModuleType
  brandProfile: BrandProfile | null
  contentPlans: ContentPlan[]
  libraryItems: ContentItem[]
  crearSubModule: 'reels' | 'stories' | 'carruseles'
  isLoading: boolean
  loadingMessage: string

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

      setActiveModule: (module) => set({ activeModule: module }),
      setBrandProfile: (profile) => set({ brandProfile: profile }),
      addContentPlan: (plan) => set((state) => ({ contentPlans: [...state.contentPlans, plan] })),
      removeContentPlan: (id) => set((state) => ({ contentPlans: state.contentPlans.filter(p => p.id !== id) })),
      addLibraryItem: (item) => set((state) => ({ libraryItems: [...state.libraryItems, item] })),
      addLibraryItems: (items) => set((state) => ({ libraryItems: [...state.libraryItems, ...items] })),
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
    }),
    {
      name: 'brave-studio-storage',
      partialize: (state) => ({
        activeModule: state.activeModule,
        brandProfile: state.brandProfile,
        contentPlans: state.contentPlans,
        libraryItems: state.libraryItems,
        crearSubModule: state.crearSubModule,
      }),
    }
  )
)

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
