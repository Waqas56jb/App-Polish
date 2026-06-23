#!/bin/bash
# Bulk color replacement script for BRÄVE STUDIO redesign

COLOR_MAP=(
  's/#2D1F22/#2A1520/g'
  's/#7D2E42/#591427/g'
  's/#C17C83/#C1DBE8/g'
  's/#C9A96E/#FFF1B5/g'
  's/#FBF7F5/#FFFBF0/g'
  's/#F3E8E5/#F5F0EB/g'
  's/#E0D5D1/#E8DDD5/g'
  's/#933A54/#7A2A40/g'
  's/#B06B74/#8BB8D0/g'
  's/#a86570/#8BB8D0/g'
  's/#D4B87E/#F5D680/g'
  's/#5d2334/#3D0E1B/g'
  's/#5D2334/#3D0E1B/g'
)

FILES=(
  "/home/z/my-project/src/components/brave/planificar.tsx"
  "/home/z/my-project/src/components/brave/biblioteca.tsx"
  "/home/z/my-project/src/components/brave/calendario.tsx"
  "/home/z/my-project/src/components/brave/draggable-card.tsx"
  "/home/z/my-project/src/components/brave/stories-brave.tsx"
  "/home/z/my-project/src/components/brave/banco-ganchos.tsx"
  "/home/z/my-project/src/components/brave/asistente-brave.tsx"
  "/home/z/my-project/src/components/brave/asistente-flotante.tsx"
  "/home/z/my-project/src/components/brave/dame-una-idea.tsx"
  "/home/z/my-project/src/components/brave/content-modal.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    for replacement in "${COLOR_MAP[@]}"; do
      sed -i "$replacement" "$file"
    done
    echo "  Done!"
  else
    echo "NOT FOUND: $file"
  fi
done

echo ""
echo "All files processed!"
