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
