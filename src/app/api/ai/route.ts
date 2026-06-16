import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, brandProfile, context } = body

    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    let systemPrompt = ''
    let userPrompt = ''

    const brandContext = brandProfile
      ? `Información de la marca:
- Nombre: ${brandProfile.nombre}
- Salón: ${brandProfile.salon}
- Ciudad: ${brandProfile.ciudad}
- Instagram: ${brandProfile.instagram}
- Experiencia: ${brandProfile.experiencia} años
- Servicios: ${brandProfile.servicios?.join(', ')}
- Servicios prioritarios: ${brandProfile.serviciosPrioritarios?.join(', ')}
- Objetivos: ${brandProfile.objetivos}
- Clienta ideal: ${brandProfile.clientaIdeal}
- Preguntas frecuentes: ${brandProfile.preguntasFrecuentes}
- Errores frecuentes: ${brandProfile.erroresFrecuentes}
- Nivel de comodidad a cámara: ${brandProfile.nivelCamara}
- Facturación: ${brandProfile.facturacion}`
      : ''

    switch (type) {
      case 'plan': {
        const { tipo, servicios, frecuencia, objetivo } = context
        systemPrompt = `Eres una experta en marketing para salones de belleza y estilistas. Generas contenido estratégico para Instagram. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Genera una planificación ${tipo} de contenido para Instagram con estas especificaciones:
- Tipo: ${tipo}
- Servicios a potenciar: ${servicios?.join(', ')}
- Frecuencia: ${frecuencia} publicaciones por semana
- Objetivo principal: ${objetivo}

Genera un listado de contenidos. Cada contenido debe tener:
- dia: día de la semana o fecha
- tipo: "reel" o "carrusel"
- titulo: título atractivo del contenido
- objetivo: "autoridad", "reservas", o "visibilidad"
- servicio: servicio relacionado

Responde SOLO con un JSON array, sin texto adicional. Ejemplo:
[{"dia":"Martes","tipo":"reel","titulo":"...","objetivo":"...","servicio":"..."}]`
        break
      }

      case 'reel-ideas': {
        const { servicio, objetivo, formato } = context
        systemPrompt = `Eres una experta en contenido para Instagram enfocada en salones de belleza. Generas ideas creativas para Reels. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Genera 10 ideas de Reel para Instagram con estas especificaciones:
- Servicio: ${servicio}
- Objetivo: ${objetivo}
- Formato: ${formato}

Cada idea debe tener:
- titulo: título atractivo y corto
- objetivo: objetivo del reel
- servicio: servicio relacionado
- formato: formato del reel

Responde SOLO con un JSON array de 10 elementos, sin texto adicional.`
        break
      }

      case 'script': {
        const { titulo, tipo, objetivo, servicio, formato } = context
        systemPrompt = `Eres una guionista experta en contenido para Instagram de salones de belleza. Creas guiones cortos y efectivos. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Crea un guión completo para un ${tipo} con estas especificaciones:
- Título: ${titulo}
- Objetivo: ${objetivo}
- Servicio: ${servicio}
- Formato: ${formato || 'hablando a cámara'}

El guión debe seguir esta estructura:
1. GANCHO - Primera frase que captura la atención (3-5 segundos)
2. CONTEXTO - Desarrolla el tema (15-25 segundos)
3. SOLUCIÓN - Presenta la solución o valor (10-15 segundos)
4. CTA - Llamada a la acción clara (3-5 segundos)

Duración total: 40-50 segundos.

Responde SOLO con un JSON con esta estructura:
{
  "guion": "guión completo con marcadores GANCHO, CONTEXTO, SOLUCIÓN, CTA",
  "copy": "texto para la descripción del post",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
  "textoPortada": "texto corto para la portada del reel/carrusel"
}`
        break
      }

      case 'stories': {
        const { servicio, objetivo } = context
        systemPrompt = `Eres una experta en Stories de Instagram para salones de belleza. Creas secuencias simples y efectivas. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Genera una secuencia de 3 Stories para Instagram:
- Servicio: ${servicio}
- Objetivo: ${objetivo}

Story 1: Captar atención (con encuesta, pregunta o sticker interactivo)
Story 2: Problema/Solución (con historia, consejo o caso real)
Story 3: CTA (con mensaje, reserva o interacción)

Responde SOLO con un JSON con esta estructura:
{
  "stories": [
    {
      "numero": 1,
      "texto": "texto exacto para la story",
      "sticker": "sticker recomendado",
      "ideaVisual": "descripción de la imagen/video"
    }
  ]
}`
        break
      }

      case 'carousel': {
        const { servicio, objetivo, numSlides } = context
        systemPrompt = `Eres una experta en Carruseles de Instagram para salones de belleza. Creas contenido educativo y atractivo. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Genera un carrusel de ${numSlides} slides para Instagram:
- Servicio: ${servicio}
- Objetivo: ${objetivo}
- Número de slides: ${numSlides}

Responde SOLO con un JSON con esta estructura:
{
  "slides": [
    {
      "numero": 1,
      "texto": "texto completo del slide"
    }
  ],
  "copy": "texto para la descripción del post",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
  "cta": "llamada a la acción del último slide"
}`
        break
      }

      case 'extract-brand': {
        const { documentText } = context
        systemPrompt = `Eres una experta en marketing para salones de belleza. Analizas documentos de marca y extraes información estructurada. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `Analiza el siguiente documento de marca de un salón de belleza y extrae la información estructurada.

DOCUMENTO:
${documentText}

Extrae toda la información relevante y reorganízala en estos campos. Si algún campo no está presente en el documento, déjalo como string vacío "".

Responde SOLO con un JSON con esta estructura exacta:
{
  "nombre": "nombre de la estilista",
  "salon": "nombre del salón",
  "ciudad": "ciudad",
  "instagram": "usuario de instagram con @",
  "experiencia": "años de experiencia como string",
  "servicios": ["lista de servicios que ofrece"],
  "serviciosPrioritarios": ["máximo 3 servicios prioritarios"],
  "objetivos": "objetivos con el contenido",
  "clientaIdeal": "descripción de la clienta ideal",
  "preguntasFrecuentes": "preguntas frecuentes de las clientas",
  "erroresFrecuentes": "errores frecuentes que ven en las clientas",
  "nivelCamara": "nivel de comodidad a cámara: 'Muy cómoda', 'Bastante cómoda', 'Algo incómoda' o 'Nada cómoda'",
  "facturacion": "facturación mensual aproximada"
}`
        break
      }

      case 'quick-idea': {
        systemPrompt = `Eres una experta en contenido para Instagram de salones de belleza. Das ideas rápidas y accionables. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Dame una idea rápida de contenido para publicar HOY en Instagram.

Responde SOLO con un JSON:
{
  "titulo": "título atractivo",
  "tipo": "reel o carrusel o story",
  "objetivo": "objetivo de la publicación",
  "descripcion": "breve descripción de qué publicar",
  "guion": "guion rápido si aplica"
}`
        break
      }

      default:
        return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
    }

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
    })

    let content = ''
    if (typeof response === 'string') {
      content = response
    } else if (response?.choices?.[0]?.message?.content) {
      content = response.choices[0].message.content
    } else if (response?.content) {
      content = response.content
    } else {
      content = JSON.stringify(response)
    }

    // Try to extract JSON from the response
    let parsed = null
    try {
      // First try direct parse
      parsed = JSON.parse(content)
    } catch {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch {
          parsed = { raw: content }
        }
      } else {
        parsed = { raw: content }
      }
    }

    return NextResponse.json({ result: parsed })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Error generando contenido', details: error.message },
      { status: 500 }
    )
  }
}
