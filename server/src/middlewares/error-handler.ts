import type { Request, Response, NextFunction } from 'express'
import { isProd } from '../config/env'

/** Centralised error handler — keeps responses JSON and logs server-side. */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[error]', err)
  const status = typeof err?.status === 'number' ? err.status : 500
  res.status(status).json({
    error: err?.publicMessage || 'Internal server error',
    ...(isProd ? {} : { details: err?.message }),
  })
}
