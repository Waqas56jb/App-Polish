import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { audioBase64 } = body

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return NextResponse.json({ error: 'audioBase64 is required' }, { status: 400 })
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const response: any = await zai.audio.asr.create({
      file_base64: audioBase64,
    })

    const text = response?.text || response?.transcription || (typeof response === 'string' ? response : '')

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('ASR error:', error)
    return NextResponse.json(
      { error: 'Error transcribing audio', details: error.message },
      { status: 500 }
    )
  }
}
