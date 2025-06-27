#!/bin/bash

# Script to remove unused imports from TypeScript files

echo "🧹 Cleaning up unused imports..."

# Remove standalone unused devLog imports
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Check if devLog is used in the file
  if ! grep -q "devLog(" "$file" 2>/dev/null; then
    # Remove the devLog import line
    sed -i '' '/import.*devLog.*from.*errorHandlers/d' "$file" 2>/dev/null || true
  fi
done

# Clean up empty import statements
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Remove empty lines created by import removal
  sed -i '' '/^$/N;/^\n$/d' "$file" 2>/dev/null || true
done

echo "✅ Unused import cleanup complete!" 