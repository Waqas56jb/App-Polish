import { buildPrompt } from './ai.prompts'
import { createZai, extractContent, parseJsonFromContent } from '../../lib/zai'

export interface GenerateContentBody {
  type: string
  brandProfile?: any
  context?: any
}

/** Build prompts for the request, call the LLM, and return parsed JSON. */
export async function generateContent(body: GenerateContentBody): Promise<any> {
  const { type, brandProfile, context } = body
  const { systemPrompt, userPrompt } = buildPrompt(type, brandProfile, context ?? {})

  const zai = await createZai()
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: false,
  })

  const content = extractContent(response)
  return parseJsonFromContent(content)
}
