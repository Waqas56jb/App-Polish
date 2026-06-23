'use client'

import type { StateStorage } from 'zustand/middleware'

/**
 * Server-backed storage adapter for Zustand `persist`.
 *
 * Replaces browser localStorage: the whole persisted workspace slice is read
 * from / written to the backend (`/api/workspace`, proxied to the Express
 * server) so application data lives in the server's SQLite database (Prisma)
 * instead of the browser.
 *
 * The `value` strings handed to us by `createJSONStorage` are opaque
 * (a serialized `{ state, version }` envelope) — we store and return them
 * verbatim so persistence is lossless. The server also decomposes the payload
 * into the relational domain tables for its REST API.
 */
const WORKSPACE_URL = '/api/workspace'

const isBrowser = typeof window !== 'undefined'

export const serverStorage: StateStorage = {
  getItem: async (_name: string): Promise<string | null> => {
    if (!isBrowser) return null
    try {
      const res = await fetch(WORKSPACE_URL, { method: 'GET' })
      if (!res.ok) return null
      const json = await res.json()
      return typeof json?.payload === 'string' ? json.payload : null
    } catch (err) {
      console.error('[serverStorage] getItem failed:', err)
      return null
    }
  },

  setItem: async (_name: string, value: string): Promise<void> => {
    if (!isBrowser) return
    try {
      await fetch(WORKSPACE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: value }),
      })
    } catch (err) {
      console.error('[serverStorage] setItem failed:', err)
    }
  },

  removeItem: async (_name: string): Promise<void> => {
    if (!isBrowser) return
    try {
      await fetch(WORKSPACE_URL, { method: 'DELETE' })
    } catch (err) {
      console.error('[serverStorage] removeItem failed:', err)
    }
  },
}
