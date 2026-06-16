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
        const { tipo, servicios, frecuencia, objetivo, tipoContenido } = context
        const objetivoDesc = getObjetivoDescription(objetivo)
        const tipoContenidoDesc = getTipoContenidoDescription(tipoContenido)
        systemPrompt = `Eres una experta en marketing para salones de belleza y estilistas. Generas contenido estratégico para Instagram. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Genera una planificación ${tipo} de contenido para Instagram con estas especificaciones:
- Tipo: ${tipo}
- Servicios a potenciar: ${servicios?.join(', ')}
- Frecuencia: ${frecuencia} publicaciones por semana
- Objetivo principal: ${objetivo} — ${objetivoDesc}
- Tipo de contenido: ${tipoContenidoDesc}

IMPORTANTE - El objetivo "${objetivo}" debe guiar el ENFOQUE de cada idea:
${objetivoDesc}

Cada idea generada debe estar claramente alineada con este objetivo. Por ejemplo:
- Si es "autoridad": ideas educativas, tutoriales, consejos de experta, mitos que desmentir
- Si es "reservas": ideas que generan conversión, antes/después, casos de éxito, ofertas, urgencia
- Si es "visibilidad": ideas virales, tendencias, retos, polémicas suaves, contenido compartible

Genera un listado de contenidos. Cada contenido debe tener:
- dia: día de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)
- tipo: ${tipoContenido === 'reels' ? "'reel'" : tipoContenido === 'carruseles' ? "'carrusel'" : "'reel' o 'carrusel'"}
- titulo: título atractivo del contenido, alineado al objetivo
- objetivo: "${objetivo}"
- servicio: servicio relacionado de los seleccionados
- descripcion: breve descripción de qué tratará el contenido (1-2 frases)

Responde SOLO con un JSON array, sin texto adicional. Ejemplo:
[{"dia":"Martes","tipo":"reel","titulo":"...","objetivo":"autoridad","servicio":"...","descripcion":"..."}]`
        break
      }

      case 'reel-ideas': {
        const { servicio, objetivo, formato } = context
        const objetivoDesc = getObjetivoDescription(objetivo)
        systemPrompt = `Eres una experta en contenido para Instagram enfocada en salones de belleza. Generas ideas creativas para Reels. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Genera 10 ideas de Reel para Instagram con estas especificaciones:
- Servicio: ${servicio}
- Objetivo: ${objetivo} — ${objetivoDesc}
- Formato: ${formato}

IMPORTANTE - El objetivo "${objetivo}" debe guiar el ENFOQUE de cada idea:
${objetivoDesc}

Ejemplos de ENFOQUE según objetivo:
- AUTORIDAD: educar, desmentir mitos, enseñar técnica, mostrar experiencia
- RESERVAS: mostrar transformaciones, casos reales, ofertas, urgencia, llamado a reserva
- VISIBILIDAD: tendencias, retos, polémicas suaves, contenido viral y compartible

Cada idea debe tener:
- titulo: título atractivo y corto (máximo 8 palabras)
- objetivo: "${objetivo}"
- servicio: "${servicio}"
- formato: "${formato}"
- descripcion: breve descripción de qué tratará (1 frase)

Responde SOLO con un JSON array de 10 elementos, sin texto adicional.`
        break
      }

      case 'script': {
        const { titulo, tipo, objetivo, servicio, formato } = context
        const objetivoDesc = getObjetivoDescription(objetivo)
        systemPrompt = `Eres una guionista experta en contenido para Instagram de salones de belleza. Creas guiones cortos y efectivos. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Crea un guión completo para un ${tipo} con estas especificaciones:
- Título: ${titulo}
- Objetivo: ${objetivo} — ${objetivoDesc}
- Servicio: ${servicio}
- Formato: ${formato || 'hablando a cámara'}

IMPORTANTE - El guión debe estar alineado con el objetivo "${objetivo}":
${objetivoDesc}

- Si es AUTORIDAD: el CTA debe invitar a guardar, compartir o seguir para más contenido educativo
- Si es RESERVAS: el CTA debe invitar a reservar cita, escribir por DM, con urgencia
- Si es VISIBILIDAD: el CTA debe invitar a comentar, etiquetar amigas, compartir

El guión debe seguir esta estructura:
1. GANCHO - Primera frase que captura la atención (3-5 segundos)
2. CONTEXTO - Desarrolla el tema (15-25 segundos)
3. SOLUCIÓN - Presenta la solución o valor (10-15 segundos)
4. CTA - Llamada a la acción clara alineada al objetivo (3-5 segundos)

Duración total: 40-50 segundos.

Responde SOLO con un JSON con esta estructura:
{
  "guion": "guión completo con marcadores GANCHO, CONTEXTO, SOLUCIÓN, CTA",
  "copy": "texto para la descripción del post, alineado al objetivo",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
  "textoPortada": "texto corto para la portada del reel/carrusel"
}`
        break
      }

      case 'convert-content': {
        const { titulo, objetivo, servicio, formato, fromTipo, toTipo, guion, copy, hashtags } = context
        const objetivoDesc = getObjetivoDescription(objetivo)
        systemPrompt = 'Eres una experta en contenido para Instagram de salones de belleza. Adaptas contenido entre formatos manteniendo la idea principal. Siempre respondes en español. El formato de salida debe ser JSON válido.'

        const header = [
          brandContext,
          '',
          'Convierte el siguiente contenido de ' + fromTipo + ' a ' + toTipo + ', MANTENIENDO la misma idea principal pero adaptando el formato:',
          '',
          'CONTENIDO ORIGINAL (' + fromTipo + '):',
          '- Título: ' + titulo,
          '- Objetivo: ' + objetivo,
          '- Servicio: ' + servicio,
          '- Formato original: ' + formato,
          guion ? '- Guión original: ' + guion : '',
          copy ? '- Copy original: ' + copy : '',
          '',
          'OBJETIVO: ' + objetivo + ' — ' + objetivoDesc,
          '',
        ].filter(Boolean).join('\n')

        if (toTipo === 'carrusel') {
          userPrompt = header + [
            'Conviértelo en un CARRUSEL de 4 slides:',
            '- Slide 1: Portada con el título/gancho',
            '- Slides 2-3: Desarrollo del contenido',
            '- Slide 4: CTA claro alineado al objetivo',
            '',
            'Responde SOLO con un JSON con esta estructura:',
            '{',
            '  "slides": [{"numero": 1, "texto": "..."}],',
            '  "copy": "descripción del post",',
            '  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",',
            '  "textoPortada": "texto de portada",',
            '  "titulo": "título adaptado si es necesario"',
            '}',
          ].join('\n')
        } else {
          userPrompt = header + [
            'Conviértelo en un REEL de 40-50 segundos manteniendo la idea:',
            '- Estructura GANCHO, CONTEXTO, SOLUCIÓN, CTA',
            '- El CTA debe estar alineado al objetivo "' + objetivo + '"',
            '',
            'Responde SOLO con un JSON con esta estructura:',
            '{',
            '  "guion": "guión completo con marcadores GANCHO, CONTEXTO, SOLUCIÓN, CTA",',
            '  "copy": "descripción del post",',
            '  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",',
            '  "textoPortada": "texto corto para la portada",',
            '  "titulo": "título adaptado si es necesario"',
            '}',
          ].join('\n')
        }
        break
      }

      case 'stories': {
        const { servicio, objetivo } = context
        systemPrompt = 'Eres una experta en Stories de Instagram para salones de belleza. Creas secuencias simples y efectivas. Siempre respondes en español. El formato de salida debe ser JSON válido.'
        userPrompt = [
          brandContext,
          '',
          'Genera una secuencia de 3 Stories para Instagram:',
          '- Servicio: ' + servicio,
          '- Objetivo: ' + objetivo,
          '',
          'Story 1: Captar atención (con encuesta, pregunta o sticker interactivo)',
          'Story 2: Problema/Solución (con historia, consejo o caso real)',
          'Story 3: CTA (con mensaje, reserva o interacción)',
          '',
          'Responde SOLO con un JSON con esta estructura:',
          '{',
          '  "stories": [',
          '    {',
          '      "numero": 1,',
          '      "texto": "texto exacto para la story",',
          '      "sticker": "sticker recomendado",',
          '      "ideaVisual": "descripción de la imagen/video"',
          '    }',
          '  ]',
          '}',
        ].filter(Boolean).join('\n')
        break
      }

      case 'stories-brave': {
        const { trabajoRealizado, servicio, modo, descripcionExtra } = context
        const modoDesc = modo === 'camara'
          ? 'MODO HABLANDO A CÁMARA: entrega un guion conversacional listo para grabar, en primera persona, natural, como si estuvieras hablando a una amiga.'
          : 'MODO TEXTO: entrega textos listos para copiar y pegar en la Story, frases cortas, directas, sin necesidad de grabación.'
        systemPrompt = [
          'Eres una experta en Stories de Instagram para salones de belleza.',
          'Sigues LA METODOLOGÍA OFICIAL BRÄVE de creación de Stories.',
          'Siempre respondes en español.',
          'El formato de salida debe ser JSON válido.',
          '',
          'PRINCIPIO FUNDAMENTAL BRÄVE:',
          'Las Stories BRÄVE no se construyen alrededor del servicio.',
          'Se construyen alrededor de la clienta.',
          'Las clientas no reservan porque vean un trabajo bonito.',
          'Reservan porque se identifican con un problema y entienden que existe una solución para ellas.',
          '',
          'Tu tarea es traducir automáticamente el trabajo realizado en los problemas,',
          'deseos y emociones que ese servicio resuelve para la clienta.',
          '',
          'ESTRUCTURA OFICIAL BRÄVE (3 historias):',
          'STORY 1 - Problema, intriga o identificación',
          '  · Abrir una conversación con: un problema real, una frase real de clienta, una duda frecuente,',
          '    una encuesta, una curiosidad, un error común o un deseo.',
          '  · Objetivo: conseguir que la persona se quede viendo.',
          '  · La encuesta/sticker es opcional, solo si aporta valor.',
          '',
          'STORY 2 - AUTORIDAD (la más importante)',
          '  · No explicar solo lo que hiciste.',
          '  · Explicar: qué problema detectaste, qué analizaste, qué decidiste hacer, por qué.',
          '  · Responder: ¿Por qué una profesional haría esto?',
          '  · Convertir el servicio en autoridad demostrada.',
          '',
          'STORY 3 - Resultado + Acción',
          '  · Centrarse en el beneficio para la clienta (más luz, naturalidad, movimiento, menos mantenimiento, brillo, confianza).',
          '  · Añadir CTA corto, humano, conversacional.',
          '  · El CTA debe incluir una palabra clave que la clienta escriba por DM (ej: RUBIO, CAMBIO, COLOR, BALAYAGE, ALISADO).',
          '',
          'CTA OFICIAL BRÄVE (cortos, humanos, conversacionales):',
          '  · "Si te gustaría conseguir algo así, escribe RUBIO y te asesoro encantada."',
          '  · "Si llevas tiempo pensando en hacer un cambio, escribe CAMBIO y vemos qué opción puede encajar contigo."',
          '  · "¿Te gustaría saber si este servicio es para ti? Escribe COLOR y te orientaré personalmente."',
          '  · "Si buscas más luminosidad sin perder naturalidad, escribe BALAYAGE y te cuento cómo podríamos conseguirlo."',
          '',
          'REGLA FINAL: La estilista no necesita pensar como una marketer.',
          'Solo necesita contar lo que ha ocurrido en el salón.',
          'La metodología transforma automáticamente:',
          'Servicio → Problema → Solución → Autoridad → Conversación → Reserva.',
        ].join('\n')

        userPrompt = [
          brandContext,
          '',
          'TRABAJO REALIZADO HOY (lo que la estilista hizo en el salón):',
          '- Servicio principal: ' + (servicio || 'no especificado'),
          '- Trabajo realizado: ' + (trabajoRealizado || servicio || 'no especificado'),
          descripcionExtra ? '- Detalles adicionales: ' + descripcionExtra : '',
          '',
          'MODO DE CREACIÓN: ' + modoDesc,
          '',
          'Aplica la METODOLOGÍA OFICIAL BRÄVE para generar una secuencia de 3 Stories.',
          '',
          'IMPORTANTE - Traducción automática servicio → cliente:',
          'NO hables del servicio. Habla del problema, deseo o emoción que ese servicio resuelve.',
          'Ejemplo: si el servicio es "balayage", NO digas "hice un balayage".',
          'Di: "una clienta sentía que su cabello había perdido luz" o similar.',
          '',
          'Para cada story, incluye UNA idea visual de las categorías BRÄVE:',
          '- Selfies: frontal, espejo, con la clienta, mostrando resultado',
          '- Autoridad: mirando a cámara, trabajando, explicando, formándote',
          '- Salón: vista general, tocador, zona de lavado, herramientas',
          '- Resultados: frontal, lateral, movimiento, antes/después, brillo',
          '- Humanización: café, preparación del día, equipo, detrás de cámaras',
          '',
          'Responde SOLO con un JSON OBJECT (no un array) con esta estructura exacta. NO devuelvas solo el array stories, devuelve el objeto completo:',
          '{',
          '  "trabajo": "resumen del trabajo realizado",',
          '  "problemaCliente": "qué problema/deseo/emoción de la clienta resuelve este trabajo (1 frase)",',
          '  "palabraClave": "palabra clave para el CTA (ej: RUBIO, CAMBIO, COLOR, BALAYAGE, ALISADO)",',
          '  "stories": [',
          '    {',
          '      "numero": 1,',
          '      "tipo": "Problema, intriga o identificación",',
          '      "texto": "texto exacto para la story, listo para copiar o grabar según el modo",',
          '      "sticker": "sticker recomendado (encuesta, pregunta, pregunta deslizable, ninguna, etc.)",',
          '      "ideaVisual": "idea visual concreta de una de las categorías BRÄVE"',
          '    },',
          '    {',
          '      "numero": 2,',
          '      "tipo": "Autoridad",',
          '      "texto": "texto explicando QUÉ problema detectaste, QUÉ analizaste, POR QUÉ decidiste esa solución",',
          '      "sticker": "sticker recomendado o ninguna",',
          '      "ideaVisual": "idea visual de autoridad"',
          '    },',
          '    {',
          '      "numero": 3,',
          '      "tipo": "Resultado + Acción",',
          '      "texto": "texto centrado en el beneficio para la clienta + CTA con palabra clave",',
          '      "sticker": "sticker recomendado (enlace, pregunta, etc.)",',
          '      "ideaVisual": "idea visual del resultado"',
          '    }',
          '  ],',
          '  "copyCaption": "texto corto para acompañar en el feed o reels relacionados",',
          '  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5"',
          '}',
        ].filter(Boolean).join('\n')
        break
      }

      case 'carousel': {
        const { servicio, objetivo, numSlides } = context
        systemPrompt = 'Eres una experta en Carruseles de Instagram para salones de belleza. Creas contenido educativo y atractivo. Siempre respondes en español. El formato de salida debe ser JSON válido.'
        userPrompt = [
          brandContext,
          '',
          'Genera un carrusel de ' + numSlides + ' slides para Instagram:',
          '- Servicio: ' + servicio,
          '- Objetivo: ' + objetivo,
          '- Número de slides: ' + numSlides,
          '',
          'Responde SOLO con un JSON con esta estructura:',
          '{',
          '  "slides": [',
          '    {',
          '      "numero": 1,',
          '      "texto": "texto completo del slide"',
          '    }',
          '  ],',
          '  "copy": "texto para la descripción del post",',
          '  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",',
          '  "cta": "llamada a la acción del último slide"',
          '}',
        ].filter(Boolean).join('\n')
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
    let parsed: any = null
    try {
      // First try direct parse
      parsed = JSON.parse(content)
    } catch {
      // Detect top-level structure to prefer the right regex
      const trimmed = content.trim()
      let jsonMatch: string | null = null
      if (trimmed.startsWith('{')) {
        jsonMatch = (content.match(/\{[\s\S]*\}/) || [])[0] || null
      } else if (trimmed.startsWith('[')) {
        jsonMatch = (content.match(/\[[\s\S]*\]/) || [])[0] || null
      } else {
        // Fallback: try object first (more informative), then array
        jsonMatch = (content.match(/\{[\s\S]*\}/) || content.match(/\[[\s\S]*\]/) || [])[0] || null
      }
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch)
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

function getObjetivoDescription(objetivo: string): string {
  switch ((objetivo || '').toLowerCase()) {
    case 'autoridad':
      return 'Posiciónate como experta. El contenido debe demostrar conocimiento técnico, educar a la audiencia, desmentir mitos del sector, compartir consejos profesionales y mostrar tu experiencia. El tono es didáctico pero cercano.'
    case 'reservas':
      return 'Genera conversaciones y citas. El contenido debe enfocarse en transformaciones (antes/después), casos de éxito reales, ofertas limitadas, urgencia (citas limitadas, descuentos por tiempo), y siempre con un claro llamado a reservar o escribir por DM.'
    case 'visibilidad':
      return 'Llega a más personas y consigue más alcance. El contenido debe ser viral, usar tendencias actuales, retos, polémicas suaves del sector, contenido muy compartible, preguntas que generen debate y comentarios.'
    default:
      return 'Genera contenido atractivo para tu audiencia.'
  }
}

function getTipoContenidoDescription(tipoContenido: string): string {
  switch (tipoContenido) {
    case 'reels':
      return 'Solo Reels (videos cortos verticales)'
    case 'carruseles':
      return 'Solo Carruseles (varias imágenes deslizables)'
    case 'mezcla':
      return 'Mezcla de Reels y Carruseles (alternar entre ambos)'
    default:
      return 'Mezcla de Reels y Carruseles'
  }
}

