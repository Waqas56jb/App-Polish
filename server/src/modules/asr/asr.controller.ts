import type { Request, Response } from 'express'
import { transcribeAudio } from './asr.service'

export async function postAsr(req: Request, res: Response): Promise<void> {
  try {
    const { audioBase64 } = req.body ?? {}
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'audioBase64 is required' })
      return
    }
    const text = await transcribeAudio(audioBase64)
    res.json({ text })
  } catch (error: any) {
    console.error('ASR error:', error)
    res.status(500).json({ error: 'Error transcribing audio', details: error?.message })
  }
}
