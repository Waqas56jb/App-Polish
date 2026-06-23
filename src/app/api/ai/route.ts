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
        const { tipo, servicios, frecuencia, objetivo, tipoContenido, fechaInicio } = context
        const totalSemanas = tipo === 'semanal' ? 1 : 4
        const totalItems = frecuencia * totalSemanas
        const today = fechaInicio || new Date().toISOString().split('T')[0]

        systemPrompt = `Eres una experta en marketing para salones de belleza. Generas planes de contenido RÁPIDOS y efectivos. Respondes SOLO en JSON válido, en español. Sé concisa.`

        userPrompt = [
          brandContext || 'No hay perfil de marca configurado aún.',
          '',
          `Planificación ${tipo} de contenido para Instagram:`,
          `- ${totalSemanas} semana(s), ${frecuencia} posts/semana = ${totalItems} contenidos`,
          `- Servicios: ${servicios?.join(', ') || 'principales del salón'}`,
          `- Objetivo: ${objetivo}`,
          '- Inicio: ' + today,
          '',
          'REGLAS:',
          '- Distribuye en días laborables, alternando reel y carrusel.',
          '- Fechas reales empezando desde ' + today + '.',
          '- NO generes guion, copy ni hashtags ahora. Solo la propuesta.',
          '',
          'Responde SOLO con un JSON array:',
          '[{',
          '  "titulo": "título atractivo (máx 8 palabras)",',
          '  "tipo": "reel" o "carrusel",',
          '  "diaSemana": "Martes",',
          '  "fecha": "2025-01-14",',
          '  "servicio": "Balayage",',
          '  "descripcion": "qué mostrar y por qué funciona (1 frase)"',
          '}]',
        ].filter(Boolean).join('\n')
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
        systemPrompt = `Eres una guionista experta en contenido para Instagram de salones de belleza. Creas guiones claros y efectivos. Siempre respondes en español. El formato de salida debe ser JSON válido.`
        userPrompt = `${brandContext}

Crea un guión completo para un ${tipo} con estas especificaciones:
- Título: ${titulo}
- Objetivo: ${objetivo} — ${objetivoDesc}
- Servicio: ${servicio}
- Formato: ${formato || 'hablando a cámara'}

IMPORTANTE - El guión debe estar alineado con el objetivo "${objetivo}":
${objetivoDesc}

- Si es AUTORIDAD: el CTA debe invitar a guardar, compartir o seguir para más contenido educativo
- Si es VENTA: el CTA debe invitar a reservar cita, escribir por DM, con urgencia
- Si es VIRALIDAD: el CTA debe invitar a comentar, etiquetar amigas, compartir

El guión debe seguir esta estructura, SEPARADA EN PÁRRAFOS CLAROS (cada parte con su etiqueta en mayúsculas en una línea propia, seguida del texto en la siguiente línea y una línea en blanco entre secciones):

1. GANCHO - Primera frase que captura la atención (3-5 segundos)
2. CONTEXTO - Desarrolla el tema (15-25 segundos)
3. SOLUCIÓN - Presenta la solución o valor (10-15 segundos)
4. LLAMADA A LA ACCIÓN - CTA claro alineado al objetivo (3-5 segundos)

Formato EXACTO del guion (cada etiqueta en su propia línea, separadas por líneas en blanco):
GANCHO
"[frase de gancho aquí]"

CONTEXTO
[párrafo de contexto aquí]

SOLUCIÓN
[párrafo de solución aquí]

LLAMADA A LA ACCIÓN
[frase de CTA aquí]

Duración total del reel: 40-50 segundos.

IMPORTANTE SOBRE EL COPY:
- El copy debe INCLUIR los hashtags al final, en el mismo texto
- NO generes un campo "hashtags" separado
- Pon 5-8 hashtags relevantes al final del copy

Responde SOLO con un JSON con esta estructura:
{
  "guion": "guión con la estructura GANCHO/CONTEXTO/SOLUCIÓN/LLAMADA A LA ACCIÓN separada por párrafos como se indicó",
  "copy": "texto para la descripción del post INCLUYENDO los hashtags al final en el mismo texto",
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
          'REGLAS:',
          '- Story 1: CAPTAR ATENCIÓN (con encuesta, pregunta o sticker interactivo)',
          '- Story 2: DESARROLLAR (problema/solución, historia, consejo o caso real)',
          '- Story 3: LLAMADA A LA ACCIÓN clara (reservar, escribir DM, visitar perfil)',
          '- El ÚLTIMO story SIEMPRE debe tener un CTA explícito',
          '- NO incluyas hashtags (no se usan en stories)',
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
        const { trabajoRealizado, servicio, modo, descripcionExtra, numStories } = context
        const totalStories = Math.min(Math.max(parseInt(numStories, 10) || 3, 1), 10)
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
          'ESTRUCTURA OFICIAL BRÄVE (secuencia de ' + totalStories + ' historias):',
          'STORY 1 - Problema, intriga o identificación',
          '  · Abrir una conversación con: un problema real, una frase real de clienta, una duda frecuente,',
          '    una encuesta, una curiosidad, un error común o un deseo.',
          '  · Objetivo: conseguir que la persona se quede viendo.',
          '',
          'STORIES INTERMEDIAS - Autoridad (pueden ser 1 o varias)',
          '  · No explicar solo lo que hiciste.',
          '  · Explicar: qué problema detectaste, qué analizaste, qué decidiste hacer, por qué.',
          '  · Responder: ¿Por qué una profesional haría esto?',
          '  · Convertir el servicio en autoridad demostrada.',
          '',
          'ÚLTIMA STORY - Resultado + Acción',
          '  · Centrarse en el beneficio para la clienta (más luz, naturalidad, movimiento, menos mantenimiento, brillo, confianza).',
          '  · Añadir CTA corto, humano, conversacional.',
          '  · El CTA debe incluir una palabra clave que la clienta escriba por DM (ej: RUBIO, CAMBIO, COLOR, BALAYAGE, ALISADO).',
          '',
          'ENCUESTAS:',
          'En AL MENOS UNA de las stories (preferiblemente la primera o una intermedia) incluye una encuesta',
          'para generar interacción. La encuesta debe tener: la pregunta exacta y SOLO 2 o 3 opciones de respuesta como máximo (nunca más de 3).',
          'Solo incluye encuesta si aporta valor real a la historia, no por obligación.',
          '',
          'CTA OFICIAL BRÄVE (cortos, humanos, conversacionales):',
          '  · "Si te gustaría conseguir algo así, escribe RUBIO y te asesoro encantada."',
          '  · "Si llevas tiempo pensando en hacer un cambio, escribe CAMBIO y vemos qué opción puede encajar contigo."',
          '  · "¿Te gustaría saber si este servicio es para ti? Escribe COLOR y te orientaré personalmente."',
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
          'Genera exactamente ' + totalStories + ' Stories aplicando la METODOLOGÍA OFICIAL BRÄVE.',
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
          'En al menos UNA story, añade el objeto "encuesta" con la pregunta y las opciones de respuesta.',
          'En las demás, deja "encuesta" como null.',
          '',
          'Responde SOLO con un JSON OBJECT (no un array) con esta estructura exacta. NO devuelvas solo el array stories:',
          '{',
          '  "trabajo": "resumen del trabajo realizado",',
          '  "problemaCliente": "qué problema/deseo/emoción de la clienta resuelve este trabajo (1 frase)",',
          '  "palabraClave": "palabra clave para el CTA (ej: RUBIO, CAMBIO, COLOR, BALAYAGE, ALISADO)",',
          '  "stories": [',
          '    {',
          '      "numero": 1,',
          '      "tipo": "Problema, intriga o identificación" | "Autoridad" | "Resultado + Acción",',
          '      "texto": "texto exacto para la story, listo para copiar o grabar según el modo",',
          '      "sticker": "sticker recomendado (encuesta, pregunta, pregunta deslizable, ninguna, etc.)",',
          '      "ideaVisual": "idea visual concreta de una de las categorías BRÄVE",',
          '      "encuesta": {',
          '        "pregunta": "texto de la pregunta de la encuesta",',
          '        "respuestas": ["opción 1", "opción 2"]  // SOLO 2 o 3 opciones máximo, nunca más',
          '      } o null',
          '    }',
          '    // ... ' + totalStories + ' stories en total',
          '  ],',
          '  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5"',
          '}',
          '',
          'Recuerda: NO incluyas copyCaption. Solo el array de stories y los hashtags.',
        ].filter(Boolean).join('\n')
        break
      }

      case 'preguntas-caja': {
        const { servicios, numPreguntas, modo } = context
        const totalPreguntas = Math.min(Math.max(parseInt(numPreguntas, 10) || 5, 1), 20)
        const modoDesc = modo === 'camara'
          ? 'MODO HABLANDO A CÁMARA: las respuestas deben ser guiones conversacionales listos para grabar, en primera persona, naturales.'
          : 'MODO TEXTO: las respuestas deben ser textos listos para escribir como respuesta en Instagram, claros y directos.'
        systemPrompt = [
          'Eres una experta en marketing para salones de belleza y estilistas.',
          'Especializada en generar contenido para CAJAS DE PREGUNTAS de Instagram.',
          'Siempre respondes en español.',
          'El formato de salida debe ser JSON válido.',
          '',
          'Tu objetivo: generar preguntas ficticias pero realistas que las clientas harían',
          'a una estilista sobre los servicios seleccionados, junto con una posible respuesta',
          'para cada una. Las preguntas deben sonar como preguntas reales de clientas reales,',
          'con miedos, dudas, curiosidades y objeciones comunes del sector.',
        ].join('\n')

        userPrompt = [
          brandContext,
          '',
          'SERVICIOS SOBRE LOS QUE LA ESTILISTA QUIERE RESPONDER PREGUNTAS:',
          (servicios && servicios.length > 0) ? servicios.map((s: string, i: number) => (i + 1) + '. ' + s).join('\n') : '- No especificado',
          '',
          'NÚMERO DE PREGUNTAS A GENERAR: ' + totalPreguntas,
          '',
          'MODO DE RESPUESTA: ' + modoDesc,
          '',
          'Genera ' + totalPreguntas + ' preguntas ficticias pero realistas que las clientas harían',
          'sobre estos servicios en una caja de preguntas de Instagram.',
          '',
          'Cada pregunta debe:',
          '- Sonar como una pregunta real de clienta (no como un guion de marketing).',
          '- Reflejar miedos, dudas, curiosidades u objeciones reales.',
          '- Estar distribuida entre los servicios seleccionados (si hay varios).',
          '',
          'Cada respuesta debe:',
          '- Ser honesta, profesional y cercana.',
          '- Demostrar autoridad sin sonar pretenciosa.',
          '- Estar alineada con el tono de la marca.',
          '- Tener entre 2 y 5 frases (suficiente para una respuesta en Instagram).',
          '- Si el modo es "camara", sonar natural al hablar.',
          '- Si el modo es "texto", estar lista para escribir.',
          '',
          'Responde SOLO con un JSON OBJECT con esta estructura exacta:',
          '{',
          '  "servicios": ["lista de servicios sobre los que se generaron preguntas"],',
          '  "preguntas": [',
          '    {',
          '      "id": 1,',
          '      "servicio": "servicio al que pertenece la pregunta",',
          '      "pregunta": "texto exacto de la pregunta ficticia de la clienta",',
          '      "respuesta": "texto de la respuesta que daría la estilista",',
          '      "modo": "' + modo + '"',
          '    }',
          '    // ... ' + totalPreguntas + ' preguntas en total',
          '  ]',
          '}',
        ].filter(Boolean).join('\n')
        break
      }

      case 'carousel': {
        const { servicio, objetivo, numSlides } = context
        systemPrompt = 'Eres una experta en Carruseles de Instagram para salones de belleza. Creas contenido educativo y atractivo con textos CORTOS. Siempre respondes en español. El formato de salida debe ser JSON válido.'
        userPrompt = [
          brandContext,
          '',
          'Genera un carrusel de ' + numSlides + ' slides para Instagram:',
          '- Servicio: ' + servicio,
          '- Objetivo: ' + objetivo,
          '- Número de slides: ' + numSlides,
          '',
          'REGLAS IMPORTANTES:',
          '- Cada slide debe tener TEXTO CORTO (máximo 20-30 palabras por slide)',
          '- El primer slide debe ser un GANCHO que capte la atención',
          '- Los slides del medio deben dar CONTEXTO y SOLUCIÓN paso a paso',
          '- El último slide debe ser una LLAMADA A LA ACCIÓN clara',
          '- Cada slide debe tener un campo "tipo" indicando: gancho, contexto, solución o cta',
          '- El copy debe INCLUIR los hashtags al final en el mismo texto (5-7 hashtags)',
          '',
          'Responde SOLO con un JSON con esta estructura:',
          '{',
          '  "slides": [',
          '    {',
          '      "numero": 1,',
          '      "texto": "texto corto del slide",',
          '      "tipo": "gancho"',
          '    }',
          '  ],',
          '  "copy": "descripción del post INCLUYENDO hashtags al final"',
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

      case 'asistente-brave': {
        const { mensaje, historial, roadmap } = context
        const scores = roadmap || { comunicacion: 5, stories: 5, constancia: 5, autoridad: 5, ventas: 5 }
        const weakerAreas = Object.entries(scores)
          .sort((a: any, b: any) => a[1] - b[1])
          .slice(0, 2)
          .map(([k]) => k)
        systemPrompt = [
          'Eres el Asistente BRÄVE, el acompañante estratégico de estilistas y dueñas de salón de belleza.',
          'Hablas en español, en primera persona, con un tono cercano, claro, profesional y motivador.',
          'NO hablas como una marketer avanzada. Hablas como una amiga experta que acompaña paso a paso.',
          'Sin tecnicismos. Sin emojis excesivos. Sin listas largas cuando basta una respuesta corta.',
          '',
          'PRINCIPIOS DE TUS RESPUESTAS:',
          '· Empieza validando lo que siente la clienta (bloqueo, duda, cansancio, incertidumbre).',
          '· Da UN siguiente paso concreto y pequeño, no cinco.',
          '· Si la clienta no sabe qué publicar, ofrece 2-3 opciones concretas y pide que elija.',
          '· Si la clienta está bloqueada, ofrece una sola micro-acción de 5 minutos.',
          '· Siempre cierras con una pregunta que invite a continuar la conversación.',
          '',
          'PUEDES RESPONDER CON:',
          '· Ideas de contenido concretas',
          '· Esquemas cortos de guion (GANCHO → CONTEXTO → SOLUCIÓN → CTA)',
          '· Secuencias de stories (problema → autoridad → resultado + CTA)',
          '· Recomendaciones del día (qué publicar/grabar/mejorar hoy)',
          '· Sugerencias basadas en el roadmap (métricas internas)',
          '· Explicaciones sencillas de cualquier parte de la plataforma',
          '',
          'CONEXIÓN CON EL ROADMAP:',
          'El roadmap tiene 5 áreas: comunicación, stories, constancia, autoridad, ventas (escala 0-10).',
          'Si un área está baja, puedes sugerir trabajo enfocado en esa área.',
          'Las áreas más débiles actuales de la clienta son: ' + weakerAreas.join(' y ') + '.',
          'Si la clienta pregunta "qué debería mejorar primero", orienta por esas áreas.',
          '',
          'REGLAS DE FORMATO:',
          '· Responde en texto plano, no en JSON.',
          '· Máximo 3 párrafos cortos por respuesta.',
          '· Si ofreces ideas, enuméralas en líneas separadas (1. 2. 3.) pero sin listas largas.',
          '· Si la respuesta requiere generar contenido completo (guion, stories), dile que vaya a la sección correspondiente y ofrécele un resumen aquí.',
          '· Termina SIEMPRE con 2-3 sugerencias rápidas en este formato:',
          '',
          'SUGERENCIAS:',
          '· Sugerencia 1',
          '· Sugerencia 2',
          '· Sugerencia 3',
          '',
          'Las sugerencias deben ser frases cortas que la clienta pueda pulsar para continuar la conversación.',
        ].join('\n')

        const historialTexto = (historial || [])
          .slice(-6)
          .map((m: any) => (m.rol === 'user' ? 'CLIENTA: ' : 'ASISTENTE: ') + m.texto)
          .join('\n\n')

        userPrompt = [
          brandContext,
          '',
          'ESTADO ACTUAL DEL ROADMAP (0-10):',
          '· Comunicación: ' + scores.comunicacion,
          '· Stories: ' + scores.stories,
          '· Constancia: ' + scores.constancia,
          '· Autoridad: ' + scores.autoridad,
          '· Ventas: ' + scores.ventas,
          '',
          'HISTORIAL RECIENTE:',
          historialTexto || '(primera interacción)',
          '',
          'MENSAJE ACTUAL DE LA CLIENTA:',
          mensaje,
          '',
          'Responde como el Asistente BRÄVE siguiendo todas las reglas anteriores.',
          'Recuerda terminar con la sección SUGERENCIAS: y 2-3 sugerencias rápidas.',
        ].filter(Boolean).join('\n')
        break
      }

      case 'generar-desde-gancho': {
        const { gancho, tipoContenido, tono, modo, servicio } = context
        const tonoDesc = tono === 'educativo'
          ? 'EDUCATIVO: enseña, explica, demuestra conocimiento. Tono didáctico pero cercano.'
          : tono === 'cercano'
          ? 'CERCANO: conversacional, como si hablaras con una amiga. Tono cálido y personal.'
          : tono === 'vendedor'
          ? 'VENDEDOR: enfocado en conversión, con CTA claro para reservar o escribir por DM.'
          : 'Tono equilibrado entre educativo y cercano.'

        const modoDesc = modo === 'camara'
          ? 'HABLANDO A CÁMARA: guion conversacional en primera persona, listo para grabar, natural.'
          : 'TEXTO EN PANTALLA: textos cortos para superponer en el vídeo o carrusel, frases directas.'

        systemPrompt = [
          'Eres una experta en contenido para Instagram de salones de belleza.',
          'Generas contenido siguiendo la METODOLOGÍA BRÄVE.',
          'Siempre respondes en español.',
          'El formato de salida debe ser JSON válido.',
          '',
          'METODOLOGÍA BRÄVE:',
          '· GANCHO: primera frase que captura la atención en 3-5 segundos.',
          '· CONTEXTO: desarrolla el tema conectando con un problema/deseo de la clienta.',
          '· SOLUCIÓN: presenta el valor o la solución desde la autoridad.',
          '· CTA: llamada a la acción clara, humana, conversacional.',
        ].join('\n')

        userPrompt = [
          brandContext,
          '',
          'GANCHO DE PARTIDA:',
          gancho,
          '',
          'ESPECIFICACIONES:',
          '· Tipo de contenido: ' + (tipoContenido || 'reel'),
          '· Tono: ' + tonoDesc,
          '· Modo: ' + modoDesc,
          '· Servicio relacionado: ' + (servicio || 'no especificado'),
          '',
          'Genera el contenido aplicando la METODOLOGÍA BRÄVE.',
          '',
          tipoContenido === 'carrusel'
            ? 'Para CARRUSEL: genera 5 slides. Slide 1 = gancho. Slides 2-4 = desarrollo. Slide 5 = CTA.'
            : tipoContenido === 'story'
            ? 'Para STORIES: genera 3 stories. Story 1 = problema/intriga. Story 2 = autoridad. Story 3 = resultado + CTA.'
            : 'Para REEL: genera un guion de 40-50 segundos con marcadores GANCHO, CONTEXTO, SOLUCIÓN, CTA.',
          '',
          'Responde SOLO con un JSON OBJECT con esta estructura:',
          tipoContenido === 'carrusel'
            ? ['{',
               '  "tipo": "carrusel",',
               '  "titulo": "título adaptado del gancho",',
               '  "slides": [{"numero": 1, "texto": "..."}, {"numero": 2, "texto": "..."}],',
               '  "copy": "descripción del post",',
               '  "hashtags": "#h1 #h2 #h3 #h4 #h5",',
               '  "textoPortada": "texto para la portada"',
               '}'].join('\n')
            : tipoContenido === 'story'
            ? ['{',
               '  "tipo": "story",',
               '  "titulo": "título de la secuencia",',
               '  "stories": [',
               '    {"numero": 1, "tipo": "Problema", "texto": "...", "sticker": "...", "ideaVisual": "..."},',
               '    {"numero": 2, "tipo": "Autoridad", "texto": "...", "sticker": "...", "ideaVisual": "..."},',
               '    {"numero": 3, "tipo": "Resultado+Acción", "texto": "...", "sticker": "...", "ideaVisual": "..."}',
               '  ],',
               '  "hashtags": "#h1 #h2 #h3 #h4 #h5"',
               '}'].join('\n')
            : ['{',
               '  "tipo": "reel",',
               '  "titulo": "título adaptado del gancho",',
               '  "guion": "guion completo con marcadores GANCHO, CONTEXTO, SOLUCIÓN, CTA",',
               '  "copy": "descripción del post",',
               '  "hashtags": "#h1 #h2 #h3 #h4 #h5",',
               '  "textoPortada": "texto corto para la portada"',
               '}'].join('\n'),
        ].filter(Boolean).join('\n')
        break
      }

      case 'ganchos-extra': {
        const { categoria, tipo, numGanchos } = context
        const total = Math.min(Math.max(parseInt(numGanchos, 10) || 10, 1), 30)
        systemPrompt = [
          'Eres una experta en ganchos para contenido de Instagram de salones de belleza.',
          'Generas ganchos llamativos, estratégicos y originales para reels, stories y carruseles.',
          'Siempre respondes en español.',
          'El formato de salida debe ser JSON válido.',
          '',
          'Cada gancho debe tener un ángulo diferente: dolor, deseo, objeción, mito, tendencia, autoridad, etc.',
          'Los ganchos NO deben repetir patrones. Cada uno debe abordar el tema desde un ángulo distinto.',
        ].join('\n')

        userPrompt = [
          brandContext,
          '',
          'Genera ' + total + ' ganchos para contenido de salón de belleza.',
          categoria ? ('Categoría: ' + categoria) : 'Categoría: libre (mezcla variada)',
          tipo ? ('Tipo de gancho: ' + tipo) : 'Tipo: libre (mezcla viral, educativo, autoridad, etc.)',
          '',
          'Cada gancho debe tener:',
          '· titulo: el texto del gancho (máximo 12 palabras, llamativo)',
          '· categoria: una de las categorías BRÄVE (Balayage, Rubios, Color, Tratamientos, Alisados, Cortes, Canas, Cuidado en casa, Errores comunes, Tendencias, Mitos, Antes y después, Autoridad, Ventas, Stories, Reels virales)',
          '· tipo: uno de (Viral, Educativo, Autoridad, Venta, Engagement, Dolor, Deseo, Objeción, Tendencia)',
          '· objetivo: autoridad, reservas o visibilidad',
          '· servicio: servicio relacionado concreto',
          '· impacto: Alto, Medio o Bajo',
          '· explicacion: por qué funciona este gancho (1-2 frases)',
          '· dolor: qué dolor de la clienta toca',
          '· deseo: qué deseo activa',
          '· ideaVisual: idea visual concreta para el contenido',
          '',
          'Responde SOLO con un JSON OBJECT:',
          '{',
          '  "ganchos": [',
          '    {',
          '      "titulo": "...",',
          '      "categoria": "...",',
          '      "tipo": "...",',
          '      "objetivo": "...",',
          '      "servicio": "...",',
          '      "impacto": "...",',
          '      "explicacion": "...",',
          '      "dolor": "...",',
          '      "deseo": "...",',
          '      "ideaVisual": "..."',
          '    }',
          '    // ... ' + total + ' ganchos',
          '  ]',
          '}',
        ].filter(Boolean).join('\n')
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

    const content = extractContent(response)
    const parsed = parseJsonFromContent(content)

    return NextResponse.json({ result: parsed })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Error generando contenido', details: error.message },
      { status: 500 }
    )
  }
}

// ─── Helpers extraídos para claridad y reutilización ─────────
function extractContent(response: any): string {
  if (typeof response === 'string') return response
  if (response?.choices?.[0]?.message?.content) return response.choices[0].message.content
  if (response?.content) return response.content
  return JSON.stringify(response)
}

function parseJsonFromContent(content: string): any {
  try {
    return JSON.parse(content)
  } catch {
    const trimmed = content.trim()
    let jsonMatch: string | null = null
    if (trimmed.startsWith('{')) {
      jsonMatch = (content.match(/\{[\s\S]*\}/) || [])[0] || null
    } else if (trimmed.startsWith('[')) {
      jsonMatch = (content.match(/\[[\s\S]*\]/) || [])[0] || null
    } else {
      jsonMatch = (content.match(/\{[\s\S]*\}/) || content.match(/\[[\s\S]*\]/) || [])[0] || null
    }
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch)
      } catch {
        return { raw: content }
      }
    }
    return { raw: content }
  }
}

function getObjetivoDescription(objetivo: string): string {
  switch ((objetivo || '').toLowerCase()) {
    case 'autoridad':
      return 'Posiciónate como experta. El contenido debe demostrar conocimiento técnico, educar a la audiencia, desmentir mitos del sector, compartir consejos profesionales y mostrar tu experiencia. El tono es didáctico pero cercano.'
    case 'venta':
    case 'reservas':
      return 'Genera conversaciones y citas. El contenido debe enfocarse en transformaciones (antes/después), casos de éxito reales, ofertas limitadas, urgencia (citas limitadas, descuentos por tiempo), y siempre con un claro llamado a reservar o escribir por DM.'
    case 'viralidad':
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

