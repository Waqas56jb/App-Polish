import { createCrudRouter } from '../../lib/crud'
import { prisma } from '../../lib/prisma'

// REST resource: /api/content-plans
export default createCrudRouter({
  delegate: prisma.contentPlan,
  jsonFields: ['servicios', 'contenido'],
})
