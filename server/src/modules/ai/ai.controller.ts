import type { Request, Response } from 'express'
import { generateContent } from './ai.service'
import { InvalidPromptTypeError } from './ai.prompts'

export async function postAi(req: Request, res: Response): Promise<void> {
  try {
    const result = await generateContent(req.body)
    res.json({ result })
  } catch (error: any) {
    if (error instanceof InvalidPromptTypeError) {
      res.status(400).json({ error: error.publicMessage })
      return
    }
    console.error('AI generation error:', error)
    res.status(500).json({ error: 'Error generando contenido', details: error?.message })
  }
}
