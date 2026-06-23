import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { getWorkspace, putWorkspace, deleteWorkspace } from './workspace.controller'

const router = Router()

// GET    /api/workspace  — read persisted workspace snapshot
// PUT    /api/workspace  — save snapshot (+ project to domain tables)
// DELETE /api/workspace  — clear snapshot and domain data
router.get('/', asyncHandler(getWorkspace))
router.put('/', asyncHandler(putWorkspace))
router.delete('/', asyncHandler(deleteWorkspace))

export default router
