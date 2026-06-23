/**
 * Safe fetch wrapper that:
 * 1. Adds AbortController timeout (default 60s)
 * 2. Checks response before parsing JSON
 * 3. Returns { data, error } instead of throwing
 */

export interface SafeFetchResult<T = any> {
  data: T | null
  error: string | null
}

export async function fetchJSON<T = any>(
  url: string,
  options?: RequestInit & { timeoutMs?: number }
): Promise<SafeFetchResult<T>> {
  const { timeoutMs = 60000, ...fetchOpts } = options || {}

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      ...fetchOpts,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOpts.headers,
      },
    })

    const text = await res.text()

    // HTML response = server error page
    if (text.trimStart().startsWith('<')) {
      console.error('[fetchJSON] HTML response:', url, res.status)
      return {
        data: null,
        error: res.status >= 500
          ? 'Error del servidor. Recarga e intenta de nuevo.'
          : `Error inesperado (${res.status}).`,
      }
    }

    let data: T
    try {
      data = JSON.parse(text)
    } catch {
      console.error('[fetchJSON] Invalid JSON:', url, text.substring(0, 200))
      return { data: null, error: 'Respuesta inválida del servidor.' }
    }

    // API-level error
    if (data && typeof data === 'object' && 'error' in (data as any)) {
      return { data: null, error: (data as any).error || 'Error desconocido' }
    }

    return { data, error: null }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('[fetchJSON] Timeout:', url, timeoutMs)
      return { data: null, error: 'La petición tardó demasiado. Intenta de nuevo.' }
    }
    console.error('[fetchJSON] Error:', url, err.message)
    return { data: null, error: err.message || 'Error de conexión.' }
  } finally {
    clearTimeout(timeoutId)
  }
}