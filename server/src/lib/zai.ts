/**
 * Thin wrapper around `z-ai-web-dev-sdk`.
 *
 * The SDK ships no type declarations, so it is imported dynamically and typed
 * as `any`. A fresh client is created per request (matches the original
 * behaviour) to avoid sharing mutable SDK state across concurrent calls.
 */
export async function createZai(): Promise<any> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  return ZAI.create()
}

/** Extract the text content from a chat completion response of varying shape. */
export function extractContent(response: any): string {
  if (typeof response === 'string') return response
  if (response?.choices?.[0]?.message?.content) return response.choices[0].message.content
  if (response?.content) return response.content
  return JSON.stringify(response)
}

/** Parse a JSON object/array out of an LLM response, tolerating markdown fences. */
export function parseJsonFromContent(content: string): any {
  let cleaned = content.trim()
  // Strip leading ```json / ``` fence and trailing ``` fence.
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '')
  cleaned = cleaned.replace(/\n?```\s*$/i, '')
  cleaned = cleaned.trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const trimmed = cleaned
    let jsonMatch: string | null = null
    if (trimmed.startsWith('{')) {
      jsonMatch = (cleaned.match(/\{[\s\S]*\}/) || [])[0] || null
    } else if (trimmed.startsWith('[')) {
      jsonMatch = (cleaned.match(/\[[\s\S]*\]/) || [])[0] || null
    } else {
      jsonMatch = (cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/) || [])[0] || null
    }
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch)
      } catch {
        return { raw: content }
      }
    }
    return { raw: content }
  }
}
