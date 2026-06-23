import { Router } from 'express'
import aiRoutes from '../modules/ai/ai.routes'
import asrRoutes from '../modules/asr/asr.routes'
import workspaceRoutes from '../modules/workspace/workspace.routes'
import brandProfileRoutes from '../modules/brand-profile/brand-profile.routes'
import contentItemRoutes from '../modules/content-item/content-item.routes'
import contentPlanRoutes from '../modules/content-plan/content-plan.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'brave-studio-server' })
})

// AI + speech
router.use('/ai', aiRoutes)
router.use('/asr', asrRoutes)

// Client workspace persistence (server-backed Zustand store)
router.use('/workspace', workspaceRoutes)

// REST resources (normalized domain projection)
router.use('/brand-profiles', brandProfileRoutes)
router.use('/content-items', contentItemRoutes)
router.use('/content-plans', contentPlanRoutes)

export default router
