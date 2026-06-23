import { Router } from 'express'
import { postAi } from './ai.controller'

const router = Router()

// POST /api/ai — generate content (plan, reel-ideas, script, stories, ...)
router.post('/', postAi)

export default router
