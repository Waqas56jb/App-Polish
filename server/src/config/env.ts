import dotenv from 'dotenv'

dotenv.config()

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
} as const

export const isProd = env.NODE_ENV === 'production'
