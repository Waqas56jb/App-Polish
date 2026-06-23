import { createCrudRouter } from '../../lib/crud'
import { prisma } from '../../lib/prisma'

// REST resource: /api/content-items
export default createCrudRouter({
  delegate: prisma.contentItem,
  jsonFields: ['slides', 'storiesData'],
})
