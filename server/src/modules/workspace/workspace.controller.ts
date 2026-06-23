import type { Request, Response } from 'express'
import {
  getWorkspacePayload,
  saveWorkspacePayload,
  clearWorkspace,
} from './workspace.service'

export async function getWorkspace(_req: Request, res: Response): Promise<void> {
  const payload = await getWorkspacePayload()
  res.json({ payload })
}

export async function putWorkspace(req: Request, res: Response): Promise<void> {
  const { payload } = req.body ?? {}
  if (typeof payload !== 'string') {
    res.status(400).json({ error: 'payload (string) is required' })
    return
  }
  await saveWorkspacePayload(payload)
  res.json({ ok: true })
}

export async function deleteWorkspace(_req: Request, res: Response): Promise<void> {
  await clearWorkspace()
  res.status(204).end()
}
