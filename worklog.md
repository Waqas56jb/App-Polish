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
