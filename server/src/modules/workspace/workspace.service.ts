import { prisma } from '../../lib/prisma'

const WORKSPACE_ID = 'singleton'
const BRAND_PROFILE_ID = 'current'

/** Read the persisted workspace snapshot string (or null if none yet). */
export async function getWorkspacePayload(): Promise<string | null> {
  const row = await prisma.workspace.findUnique({ where: { id: WORKSPACE_ID } })
  return row?.payload ? row.payload : null
}

/**
 * Persist the workspace snapshot (lossless) and project it into the normalized
 * domain tables so the REST API reflects the live data. Projection failures are
 * non-fatal — the snapshot remains the source of truth.
 */
export async function saveWorkspacePayload(payload: string): Promise<void> {
  await prisma.workspace.upsert({
    where: { id: WORKSPACE_ID },
    create: { id: WORKSPACE_ID, payload },
    update: { payload },
  })

  try {
    const envelope = JSON.parse(payload)
    const state = envelope?.state ?? envelope
    await projectToDomain(state)
  } catch (err) {
    console.warn('[workspace] domain projection skipped:', (err as Error)?.message)
  }
}

/** Clear the snapshot and all projected domain rows. */
export async function clearWorkspace(): Promise<void> {
  await prisma.$transaction([
    prisma.workspace.deleteMany({}),
    prisma.contentItem.deleteMany({}),
    prisma.contentPlan.deleteMany({}),
    prisma.brandProfile.deleteMany({}),
  ])
}

function str(v: unknown): string {
  return v == null ? '' : String(v)
}

function json(v: unknown): string {
  return JSON.stringify(v ?? [])
}

async function projectToDomain(state: any): Promise<void> {
  const ops: any[] = []

  // Brand profile (singleton row).
  if (state?.brandProfile) {
    const bp = state.brandProfile
    const data = {
      nombre: str(bp.nombre),
      salon: str(bp.salon),
      ciudad: str(bp.ciudad),
      instagram: str(bp.instagram),
      experiencia: str(bp.experiencia),
      servicios: json(bp.servicios),
      serviciosPrioritarios: json(bp.serviciosPrioritarios),
      objetivos: str(bp.objetivos),
      clientaIdeal: str(bp.clientaIdeal),
      preguntasFrecuentes: str(bp.preguntasFrecuentes),
      erroresFrecuentes: str(bp.erroresFrecuentes),
      nivelCamara: str(bp.nivelCamara),
      facturacion: str(bp.facturacion),
    }
    ops.push(
      prisma.brandProfile.upsert({
        where: { id: BRAND_PROFILE_ID },
        create: { id: BRAND_PROFILE_ID, ...data },
        update: data,
      })
    )
  }

  // Library items -> ContentItem table (full replace).
  const libraryItems: any[] = Array.isArray(state?.libraryItems) ? state.libraryItems : []
  ops.push(prisma.contentItem.deleteMany({}))
  for (const item of libraryItems) {
    ops.push(
      prisma.contentItem.create({
        data: {
          id: str(item.id) || undefined,
          tipo: str(item.tipo) || 'reel',
          titulo: str(item.titulo),
          objetivo: str(item.objetivo),
          servicio: str(item.servicio),
          guion: str(item.guion),
          copy: str(item.copy),
          hashtags: str(item.hashtags),
          textoPortada: str(item.textoPortada),
          formato: str(item.formato),
          estado: str(item.estado) || 'borrador',
          fecha: str(item.fecha),
          slides: json(item.slides),
          storiesData: json(item.storiesData),
          planId: str(item.planId),
        },
      })
    )
  }

  // Content plans -> ContentPlan table (full replace).
  const contentPlans: any[] = Array.isArray(state?.contentPlans) ? state.contentPlans : []
  ops.push(prisma.contentPlan.deleteMany({}))
  for (const plan of contentPlans) {
    ops.push(
      prisma.contentPlan.create({
        data: {
          id: str(plan.id) || undefined,
          tipo: str(plan.tipo) || 'semanal',
          servicios: json(plan.servicios),
          frecuencia: typeof plan.frecuencia === 'number' ? plan.frecuencia : 3,
          objetivo: str(plan.objetivo),
          contenido: json(plan.contenido),
        },
      })
    )
  }

  await prisma.$transaction(ops)
}
