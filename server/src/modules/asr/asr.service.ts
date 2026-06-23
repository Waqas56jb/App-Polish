import { createZai } from '../../lib/zai'

/** Transcribe a base64-encoded audio clip to text using the ASR provider. */
export async function transcribeAudio(audioBase64: string): Promise<string> {
  const zai = await createZai()
  const response: any = await zai.audio.asr.create({ file_base64: audioBase64 })
  return (
    response?.text ||
    response?.transcription ||
    (typeof response === 'string' ? response : '')
  )
}
