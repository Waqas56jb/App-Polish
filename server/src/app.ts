import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import apiRoutes from './routes'
import { notFound } from './middlewares/not-found'
import { errorHandler } from './middlewares/error-handler'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
  // Audio (base64) and content payloads can be large.
  app.use(express.json({ limit: '25mb' }))

  app.get('/', (_req, res) => {
    res.json({ message: 'BRÄVE Studio API', docs: '/api/health' })
  })

  app.use('/api', apiRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
