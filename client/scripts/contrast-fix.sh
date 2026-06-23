#!/bin/bash
# Fix Pastel Blue (#C1DBE8) with white text -> dark text
# C1DBE8 is light, needs dark text

FILES=(
  "/home/z/my-project/src/components/brave/stories-brave.tsx"
  "/home/z/my-project/src/components/brave/banco-ganchos.tsx"
  "/home/z/my-project/src/components/brave/biblioteca.tsx"
  "/home/z/my-project/src/components/brave/content-modal.tsx"
  "/home/z/my-project/src/components/brave/planificar.tsx"
  "/home/z/my-project/src/components/brave/draggable-card.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing: $file"
    # Fix bg-[#C1DBE8] text-white -> bg-[#C1DBE8] text-[#2A1520]
    sed -i 's/bg-\[#C1DBE8\] text-white/bg-[#C1DBE8] text-[#2A1520]/g' "$file"
    # Fix bg-[#C1DBE8] hover:bg-[#8BB8D0] text-white -> same with dark text
    sed -i 's/bg-\[#C1DBE8\] hover:bg-\[#8BB8D0\] text-white/bg-[#C1DBE8] hover:bg-[#8BB8D0] text-[#2A1520]/g' "$file"
  fi
done

echo "Contrast fixes applied!"
