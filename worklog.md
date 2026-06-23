---
Task ID: 1
Agent: main
Task: Rediseñar Banco de Ganchos - UI simplificada con tarjetas claras, categorías fácil filtrar, modal de guion completo

Work Log:
- Leído todo el código existente: banco-ganchos.tsx (1563 líneas), hooks-data.ts, store.ts, content-modal.tsx, biblioteca.tsx, bravy-bot.tsx, app-sidebar.tsx, page.tsx, globals.css
- Rediseñado completamente banco-ganchos.tsx (~700 líneas vs 1563 anteriores)
- Categorías simplificadas: chips horizontales scrolleables con colores únicos por categoría
- Tarjetas simplificadas: gancho en comillas, explicación breve, 2 botones (Guardar + Ver guion)
- Modal de guion completo: header con gradiente, info rápida, botón generar, resultado con guion/copy/hashtags, análisis colapsable
- Vistas Guardados y Calendario simplificadas con estados visuales claros
- Agregada clase CSS no-scrollbar para chips horizontales
- Verificado con Agent Browser: categoría funciona, modal se abre, guardar funciona, todas las vistas renderizan

Stage Summary:
- Componente banco-ganchos.tsx completamente rediseñado (menos complejo, más intuitivo)
- 3 vistas funcionales: Ganchos (banco), Guardados, Calendario
- Modal funcional con generar guion + copy de publicación
- Lint pasa limpio, servidor compilando correctamente
- Screenshots guardados en /home/z/my-project/download/
---
Task ID: 1
Agent: main
Task: Fix Stories poll to max 2-3 responses, redesign BravyBot, create landing page, rewrite Planificar + Calendario

Work Log:
- Fixed AI prompt in route.ts: encuestas now max 2-3 opciones
- Redesigned BravyBot SVG: white minimalist 3D body, black visor face, blue glowing eyes, antenna, floating
- Added "inicio" module type to store, set as default
- Created inicio-home.tsx: landing page with BravyBot welcome, quick stats, rotating tips, 8 module access cards
- Updated app-sidebar.tsx: added Inicio as first nav item with Home icon, shrink-0 fix
- Updated page.tsx: renders InicioHome for inicio module, overflow-hidden on parent
- Updated API plan case: generates full content (guion, copy, hashtags, proposed dates) per item
- Rewrote planificar.tsx: simple config (semanal/mensual + frecuencia + objetivo), generates full plan, expandable cards, save to biblioteca / send to calendario with conflict dialog
- Rewrote calendario.tsx: calendar + list views, click card to open full content, mobile-friendly, empty state with CTA
- Fixed sidebar bug: added overflow-hidden to parent flex container

Stage Summary:
- All files compile successfully
- New flow: Planificar generates complete content → save to biblioteca or send to calendario
- Calendar handles overlapping plans with replace/add-next-weeks dialog
- Mobile-responsive throughout


---
Task ID: 2
Agent: main
Task: Optimizar app BRAVE STUDIO — enfoque en rendimiento + código, riesgo equilibrado

Work Log:
- Instaladas dependencias (827 paquetes) y generado Prisma client
- Medido baseline: bundle 1.5MB, chunk principal 376KB
- Convertidos 9 módulos a next/dynamic lazy-loading en page.tsx (InicioHome, MiMarca, Planificar, Crear, Biblioteca, CalendarioView, StoriesBrave, AsistenteBrave, BancoGanchos)
- Añadido ModuleSkeleton para estado de carga consistente
- Memoizado módulo activo con useMemo antes del early-return (respeta rules-of-hooks)
- BravyBot envuelto en React.memo (se renderiza en loading, sidebar, headers, floating assistant)
- InicioHome: memoizado getRandomMotivationalTip con useMemo (antes se ejecutaba en cada render)
- AppSidebar: eliminada variable `activeColor` no usada
- Biblioteca: useMemo para filteredItems, useCallback para getTipoIcon/getTipoColor/getEstadoBadge/copyToClipboard
- Calendario: useMemo para scheduledItems/calendarDays/sortedList, useCallback para handlers
- ContentModal: helpers comentados correctamente (no useCallback por early-return)
- API route /api/ai/route.ts: extraídos helpers extractContent() y parseJsonFromContent() para claridad
- API route: eliminada variable `objetivoDesc` no usada en case 'plan'
- Corregidos 5 errores de lint (rules-of-hooks en page.tsx y content-modal.tsx)
- Eliminada carpeta extracted/ que duplicaba archivos y causaba conflicto de lint
- Verificado: lint limpio (0 errores), build exitoso (7.9s), dev server responde 200 OK

Stage Summary:
- Chunk principal: 376KB → 220KB (-41%), bundle se divide en chunks por módulo
- App carga solo el módulo activo; los demás se cargan bajo demanda
- Re-renders reducidos mediante memoización estratégica en componentes de listas (Biblioteca, Calendario) y helpers estables
- API route más legible: 60 líneas de lógica inline → 2 funciones helper reutilizables
- Sin cambios de comportamiento — solo optimizaciones seguras que respetan la funcionalidad existente
- Archivos modificados: src/app/page.tsx, src/components/brave/bravy-bot.tsx, src/components/brave/inicio-home.tsx, src/components/brave/app-sidebar.tsx, src/components/brave/biblioteca.tsx, src/components/brave/calendario.tsx, src/components/brave/content-modal.tsx, src/app/api/ai/route.ts

---
Task ID: 3
Agent: main
Task: Rediseño UX para mujer 30-45 no técnica - Mi Marca, Crear, Stories, Biblioteca, API

Work Log:
- Mi Marca completamente reescrito: 3 opciones simples (Audio+Preguntas / Subir documento / Pegar texto)
  - Opción Audio RECOMENDADA como primera: lista de 13 preguntas para leer mientras se graba
  - Transcripción en vivo con Web Speech API (es-ES, continuous)
  - Subida de archivo de audio (fallback vía /api/asr)
  - Generación de ficha automática desde cualquier método
  - Ficha expandible con todos los campos editables y copiables individualmente
  - Botón de actualizar siempre visible al final (mismas 3 opciones)
- Simplificación de objetivos: 6 opciones → 3 (Autoridad, Venta, Viralidad)
  - Mapeo en API: 'reservas' → 'venta', 'visibilidad' → 'viralidad', 'autoridad' se mantiene
  - Actualizado getObjetivoDescription() con casos para los 3 nuevos valores
- Simplificación de formatos: 3 opciones → 2 (hablando a cámara / voz en off)
- Crear Reels rediseñado:
  - Genera 10 ideas
  - Cada tarjeta clicable: al pulsar se despliega
  - Opciones al desplegar: Generar guion completo / Guardar idea sola / Agendar
  - Date picker inline para agendar directamente
  - Guion con párrafos separados: GANCHO / CONTEXTO / SOLUCIÓN / LLAMADA A LA ACCIÓN
  - Copy + Hashtags unidos en un solo bloque
- Crear Carruseles rediseñado:
  - Estructura obligatoria: gancho → contexto → solución → cta
  - Cada slide con texto corto (max 20-30 palabras) y campo "tipo"
  - Botón copiar individual por slide + copiar todo
  - Copy incluye hashtags en el mismo bloque
- Sección Stories quitada de Crear (solo Reels y Carruseles)
- Stories independiente:
  - "Recomendado: 3" ya estaba como badge (se mantiene)
  - Quitada sección de hashtags (no se usan en stories)
  - Botón copiar individual por story ya existente (se mantiene)
  - API actualizado: último story siempre con CTA explícito, sin hashtags
- Content Modal (Biblioteca) mejorado:
  - Slides del carrusel: copiar individual + copiar todo
  - Stories: copiar texto individual de cada story + copiar todo
  - CTA principal claro: "Agendar en calendario" con date picker inline
  - "Ver en el Calendario" cuando ya está programado
- API actualizado:
  - Case 'script': prompt exige estructura GANCHO/CONTEXTO/SOLUCIÓN/LLAMADA A LA ACCIÓN separada por párrafos
  - Case 'script': copy debe INCLUIR hashtags en el mismo texto (no campo separado)
  - Case 'carousel': pide "tipo" por slide, textos cortos, copy con hashtags incluidos
  - Case 'stories': último story con CTA explícito, sin hashtags
  - Case 'plan': eliminada variable objetivoDesc no usada
- Toast notifications (sonner) añadidas a content-modal y crear para feedback claro
- Verificado: lint limpio (0 errores), build exitoso (8.9s), dev server 200 OK

Stage Summary:
- Mi Marca: de formulario complejo de 3 pestañas → 3 opciones claras con audio como recomendado
- Crear: de 6 objetivos + 3 formatos + 3 submódulos → 3 objetivos + 2 formatos + 2 submódulos (sin Stories)
- Guiones: siempre con estructura clara en 4 párrafos etiquetados
- Copy + Hashtags: siempre juntos en un solo bloque copiable
- Stories: sin hashtags, siempre con CTA en el último
- Biblioteca: cada slide y cada story copiable individualmente además de "copiar todo"
- Sin cambios en el store o base de datos - compatible con datos existentes

---
Task ID: 4
Agent: main
Task: Fix error en planificación + añadir 5 publicaciones/semana + temáticas de servicios + simplificar vista

Work Log:
- Bug fix: API devolvía JSON envuelto en fences ```json ... ``` causando parseo como {raw: ...} y error en planificación
- Solución: parseJsonFromContent() ahora limpia fences de markdown antes del parseo
- Probado: curl al endpoint devuelve JSON limpio, parseable
- Añadida frecuencia 5 (5 publicaciones/semana, "Muy intenso")
- FRECUENCIAS ahora: 2, 3, 4, 5 (antes 2, 3, 4)
- Badge "TOP" en frecuencia 3 (recomendado) como indicador visual
- Añadido selector de temáticas de servicios (paso 4 de la config):
  - Combina servicios del perfil + 24 temáticas base (Balayage, Rubios, Mitos del sector, Errores comunes, etc.)
  - Multi-selección con chips
  - Contador "X seleccionadas"
  - Inicializa con los servicios prioritarios del perfil (o 3 por defecto)
  - El plan usa estas temáticas en lugar de solo servicios prioritarios
- Vista de resultado simplificada:
  - Lista simple de ideas (no tarjetas grandes expandibles por defecto)
  - Cada idea muestra: tipo + fecha + servicio + título
  - Botón expandir (chevron) para ver descripción y acciones (regenerar / ver ficha)
  - CTA fijo abajo: Guardar en Biblioteca / Mover al Calendario
  - Modal simple para ver ficha (sin sobrecargar con campos vacíos)
- Timeout aumentado a 120s para planes mensuales (más contenidos a generar)
- Validación: si no hay temáticas seleccionadas, no permite generar
- Toast feedback para todos los estados (éxito, error, info)
- Verificado: lint limpio, build exitoso, dev server 200 OK, API devuelve JSON parseable

Stage Summary:
- Error de planificación resuelto: el JSON ahora se parsea correctamente sin importar si la IA lo envuelve en markdown
- Frecuencia configurable: 2, 3 (recomendado), 4, 5 publicaciones por semana
- Temáticas personalizables: combinación de servicios del perfil + 24 temáticas base
- Vista de resultado más ligera: solo lo esencial, expandir opcional para detalle
- Flujo simplificado: genera ideas → revisa → elige guardar en biblioteca o mover a calendario

---
Task ID: 5
Agent: main
Task: 8 mejoras UX - temáticas max 3, bocadillo bravybot, ficha completa planificar, reactivar módulo, tipo contenido, botones visibles, días repartidos, calendario drag&drop

Work Log:
- BravyBot: bocadillo reposicionado de -top-14 (tapando robot) a la derecha (left-full ml-2)
  - Cola del bocadillo ahora apunta a la izquierda (hacia el robot)
  - Ya no tapa al robot en ninguna expresión
- Sidebar: clic en módulo activo dispara CustomEvent 'module-reactivate'
  - Cada módulo puede escucharlo para resetear su estado
  - Planificar escucha el evento y vuelve a la pantalla de configuración
- Planificar: añadido máximo 3 temáticas con aviso visual (X/3)
  - Chips deshabilitados con opacidad cuando se alcanza el máximo
  - Mensaje "Máximo 3 temáticas" al intentar añadir más
  - Checkmark ✓ en temáticas seleccionadas
- Planificar: añadido paso 4 "Tipo de contenido" (reels / carruseles / mixto)
  - Mixto = mayoría reels (70%) + algunos carruseles (30%)
  - API case 'plan' actualizado con reparto automático según tipoContenido
- Planificar: ficha completa con guion al pulsar idea
  - Modal nuevo (FichaCompletaModal) genera guion bajo demanda
  - Muestra: descripción + guion completo + copy+hashtags
  - Botones: Guardar en Biblioteca / Agendar
  - Si ya tenía guion (regenerado), lo muestra directamente
- Planificar: botones visibles en cada idea sin desplegar
  - Cada ficha tiene 3 botones siempre visibles: Regenerar / Biblioteca / Calendario
  - Plus CTA global abajo: Todo a Biblioteca / Todo al Calendario
- Planificar: días repartidos proporcionalmente
  - Nueva función repartirFechasSemana() en cliente
  - Prioridad: Martes (2), Jueves (4), Domingo (0), Miércoles (3), Sábado (6), Lunes (1), Viernes (5)
  - Si hay conflictos de fecha, avanza a siguiente semana
  - Resultado: 3 publicaciones → Martes, Jueves, Domingo (no seguidas)
- Calendario: rediseñado con drag & drop completo
  - Vista calendario: HTML5 drag, arrastrar idea a otro día del grid
  - Vista lista: @dnd-kit/sortable, reordenar con drag handle (GripVertical)
  - Al reordenar lista, se reasignan fechas manteniendo orden cronológico
  - Highlight verde al hacer drag over un día
  - Toast feedback al mover
- Calendario: modal ahora permite cambiar fecha
  - Para items ya agendados: botón "Cambiar fecha" abre selector inline
  - Mantiene "Ver en el Calendario" como acción secundaria
- Imports corregidos: useSensors y useSensor en @dnd-kit/core, sortableKeyboardCoordinates en @dnd-kit/sortable
- Verificado: lint limpio, build exitoso, dev server 200 OK, API funciona con tipoContenido

Stage Summary:
- 8 mejoras implementadas y verificadas
- UX más clara para mujer no técnica: límites visuales, botones siempre visibles, drag intuitivo
- Días de publicación repartidos estratégicamente (Mar/Jue/Dom preferidos, evita Lun/Vie/Sáb)
- Calendario ahora totalmente interactivo: drag en vista calendario + drag en vista lista
- Modularidad mejorada: evento 'module-reactivate' permite reset desde sidebar

---
Task ID: 6
Agent: main
Task: Adaptar a formato móvil - navegación clara y usable

Work Log:
- Sidebar rediseñado responsive:
  - Desktop (md+): sidebar vertical expandible a la izquierda (sin cambios)
  - Móvil (< md): bottom navigation bar con 5 módulos principales + botón "Más"
    - 5 principales: Inicio, Planificar, Crear, Biblioteca, Calendario
    - Botón "Más" abre sheet con grid 3x3 de todos los módulos
    - Cada item muestra icono + label corto (Inicio, Marca, Plan, Crear, Stories, Ganchos, Asist., Biblio., Calend.)
    - Item activo se resalta con su color de marca + scale 1.1
    - Labels siempre visibles (no solo iconos) - mejor entendimiento para usuaria no técnica
- Top bar móvil: logo BRAVE Studio + botón "Dame una idea" (siempre accesible)
- Sheet "Más" en móvil:
  - Animación spring desde abajo
  - Overlay con blur backdrop
  - Grid 3x3 de módulos con icono + label completo
  - Botón "Dame una idea" al final
  - Cierre con X, overlay, o Escape
- Layout ajustado en page.tsx:
  - Móvil: pt-16 pb-20 (espacio para top bar 56px + bottom nav 64px)
  - Desktop: p-8 normal
  - Safe-area CSS para iPhones con notch (env safe-area-inset-top/bottom)
- Asistente flotante ajustado:
  - En móvil: bottom-20 (sube para no solapar con bottom nav)
  - En desktop: bottom-6 (sin cambios)
  - Modal en móvil: pt-14 (espacio para top bar)
- CSS añadido: .safe-area-pt, .safe-area-pb, .safe-area-pb-nav
- Verificado: lint limpio, build exitoso, dev server 200 OK

Stage Summary:
- Móvil: navegación inferior clara con labels visibles, sheet expandible para módulos secundarios
- Desktop: sidebar expandible igual que antes (sin regresiones)
- Top bar móvil siempre visible con logo y acceso rápido a "Dame una idea"
- Safe areas para iPhones con notch/home indicator
- Asistente flotante reposicionado en móvil para no solapar con bottom nav

---
Task ID: 7
Agent: main
Task: Fix botones planificar + guion con valor/estructura + copy con emojis y 4 hashtags + modal biblioteca

Work Log:
- Investigación: botones SÍ funcionaban (verificado con agent-browser), pero no había feedback claro
  - El item SÍ se guardaba en biblioteca/calendario, pero la usuaria no veía el resultado
  - Solución: navegación automática al módulo correspondiente tras guardar individualmente
  - saveItemToBiblioteca: setTimeout → setActiveModule('biblioteca') tras 800ms
  - saveItemToCalendario: setTimeout → setActiveModule('calendario') tras 800ms
  - Toast permanece 2s para confirmar acción antes de navegar
- API script rediseñado completamente:
  - System prompt: "guionista que aporta VALOR REAL: trucos, información útil, datos que la audiencia no conoce"
  - Reglas explícitas: sé específica (NO "cuida tu pelo" → SÍ "usa agua tibia, no caliente")
  - Solución debe tener 2-3 trucos/puntos concretos accionables
  - Estructura guion: GANCHO / CONTEXTO / SOLUCIÓN / LLAMADA A LA ACCIÓN en párrafos separados
  - Copy con estructura de 4 partes con emojis (🔥 📝 💡 💬) + MÁXIMO 4 hashtags
  - Copy no demasiado largo (4-6 líneas + hashtags)
  - Formato EXACTO especificado en el prompt para que la IA lo siga
- Probado con curl: guion viene con 3 trucos concretos (48h sin lavar, champú sin sulfatos, etc.)
- Probado con curl: copy viene con emojis y 4 hashtags exactos
- Content Modal mejorado:
  - Botón "Generar guion completo" aparece si el item no tiene guion (visible en biblioteca)
  - Botón "Agendar en calendario" ahora visible para items 'aprobado' Y 'borrador' (no solo borrador)
  - Esto permite agendar ideas guardadas desde Planificar (que vienen con estado 'aprobado')
- Import añadido: Sparkles en content-modal.tsx
- Verificado: lint limpio, build exitoso, dev server 200 OK, API devuelve guion con valor real

Stage Summary:
- Botones de Planificar ahora navegan automáticamente a Biblioteca/Calendario tras guardar
- Guiones con valor real: trucos concretos, específicos, accionables (no relleno)
- Guiones con estructura clara en 4 párrafos etiquetados
- Copy con estructura visual (emojis 🔥📝💡💬) + máximo 4 hashtags
- Biblioteca: ficha muestra guion + copy completos, con opción de generar si no existen
- Biblioteca: botón "Agendar en calendario" siempre visible (borrador o aprobado)
