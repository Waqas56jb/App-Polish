import { Router } from 'express'
import { postAsr } from './asr.controller'

const router = Router()

// POST /api/asr — transcribe base64 audio to text
router.post('/', postAsr)

export default router
