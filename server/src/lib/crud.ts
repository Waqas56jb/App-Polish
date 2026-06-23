import { Router } from 'express'
import { asyncHandler } from './async-handler'

/**
 * Generic REST CRUD router factory for a Prisma model delegate.
 *
 * Produces: GET / (list), GET /:id, POST /, PUT /:id, DELETE /:id.
 *
 * `jsonFields` are columns stored as JSON strings in SQLite — they are parsed
 * on the way out and stringified on the way in, so API consumers work with
 * real arrays/objects while the DB keeps simple TEXT columns.
 */
export interface CrudOptions {
  /** A Prisma model delegate, e.g. `prisma.brandProfile`. */
  delegate: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any | null>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
  jsonFields?: string[]
}

function deserialize(row: any, jsonFields: string[]): any {
  if (!row) return row
  const out = { ...row }
  for (const f of jsonFields) {
    if (typeof out[f] === 'string') {
      try {
        out[f] = JSON.parse(out[f])
      } catch {
        /* leave as-is if not valid JSON */
      }
    }
  }
  return out
}

function serialize(data: any, jsonFields: string[]): any {
  const out = { ...data }
  for (const f of jsonFields) {
    if (out[f] !== undefined && typeof out[f] !== 'string') {
      out[f] = JSON.stringify(out[f])
    }
  }
  return out
}

export function createCrudRouter({ delegate, jsonFields = [] }: CrudOptions): Router {
  const router = Router()

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const rows = await delegate.findMany({ orderBy: { createdAt: 'desc' } })
      res.json(rows.map((r) => deserialize(r, jsonFields)))
    })
  )

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const row = await delegate.findUnique({ where: { id: req.params.id } })
      if (!row) return res.status(404).json({ error: 'Not found' })
      res.json(deserialize(row, jsonFields))
    })
  )

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const created = await delegate.create({ data: serialize(req.body, jsonFields) })
      res.status(201).json(deserialize(created, jsonFields))
    })
  )

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const { id: _ignore, createdAt, updatedAt, ...rest } = req.body ?? {}
      const updated = await delegate.update({
        where: { id: req.params.id },
        data: serialize(rest, jsonFields),
      })
      res.json(deserialize(updated, jsonFields))
    })
  )

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await delegate.delete({ where: { id: req.params.id } })
      res.status(204).end()
    })
  )

  return router
}
