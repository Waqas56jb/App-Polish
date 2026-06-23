import { createCrudRouter } from '../../lib/crud'
import { prisma } from '../../lib/prisma'

// REST resource: /api/brand-profiles
export default createCrudRouter({
  delegate: prisma.brandProfile,
  jsonFields: ['servicios', 'serviciosPrioritarios'],
})
