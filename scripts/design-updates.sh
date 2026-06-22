#!/bin/bash
# Design class updates for BRÄVE STUDIO components
# Adds glass morphism, rounded corners, and design system classes

# 1. Biblioteca - add mascot to empty state and upgrade cards
sed -i 's/className="border-none shadow-md"/className="brave-glass brave-card-hover brave-glow rounded-3xl border-none"/g' /home/z/my-project/src/components/brave/biblioteca.tsx

# Add mascot import
sed -i "1s/^/'use client'\n\nimport { BravyBot } from '\@\/components\/brave\/bravy-bot'\n/" /home/z/my-project/src/components/brave/biblioteca.tsx
# Fix double use client
sed -i '0,/{^'\''use client'\''$/{ N; s/'\''use client'\'\n'\''use client'\''/'\''use client'\''/ }' /home/z/my-project/src/components/brave/biblioteca.tsx

# 2. Calendario - upgrade cards
sed -i 's/className="border-none shadow-md"/className="brave-glass brave-card-hover brave-glow rounded-3xl border-none"/g' /home/z/my-project/src/components/brave/calendario.tsx
sed -i 's/className="border-none shadow-md overflow-hidden"/className="brave-glass brave-glow rounded-3xl border-none overflow-hidden"/g' /home/z/my-project/src/components/brave/calendario.tsx

# 3. DraggableCard - upgrade cards
sed -i 's/className={`bg-white rounded-xl shadow-md border/className={`brave-glass brave-card-hover brave-glow rounded-2xl border/g' /home/z/my-project/src/components/brave/draggable-card.tsx

# 4. Planificar - upgrade cards
sed -i 's/className="border-none shadow-md"/className="brave-glass brave-card-hover brave-glow rounded-3xl border-none"/g' /home/z/my-project/src/components/brave/planificar.tsx

# 5. ContentModal - upgrade dialog
sed -i 's/className="sm:max-w-\[640px\] max-h-\[90vh\] overflow-y-auto border-none shadow-2xl p-0"/className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0 rounded-3xl"/g' /home/z/my-project/src/components/brave/content-modal.tsx

# 6. DameUnaIdea - upgrade dialog
sed -i 's/className="sm:max-w-\[500px\] border-none shadow-2xl p-0 overflow-hidden"/className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden rounded-3xl"/g' /home/z/my-project/src/components/brave/dame-una-idea.tsx

# 7. AsistenteFlotante - update floating button and dialog styling
sed -i 's/className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 px-4 py-3 rounded-full brave-gradient shadow-xl text-white hover:scale-105 transition-transform"/className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 px-4 py-3 rounded-full brave-gradient shadow-xl text-white hover:scale-105 transition-transform brave-glow"/g' /home/z/my-project/src/components/brave/asistente-flotante.tsx
sed -i 's/className="bg-\[#FFFBF0\] w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl max-h-\[95vh\] overflow-hidden flex flex-col"/className="bg-[#FFFBF0] w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col brave-glass-strong"/g' /home/z/my-project/src/components/brave/asistente-flotante.tsx
sed -i 's/w-3 h-3 bg-\[#FFF1B5\]/w-3 h-3 bg-[#591427]/g' /home/z/my-project/src/components/brave/asistente-flotante.tsx

echo "Design class updates applied!"
