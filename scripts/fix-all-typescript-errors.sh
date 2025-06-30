#!/bin/bash
# scripts/fix-all-typescript-errors.sh

# A more robust script to fix common TypeScript errors automatically.

# 1. Fix unused variables and imports
echo "🧹 Fixing unused variables and imports..."
npx eslint --fix 'src/**/*.{ts,tsx}'

# 2. Format code to ensure consistency
echo "💅 Formatting code..."
npm run format

echo "✅ Automated fix-up complete."
echo "Please review the changes and run 'npm run build' again." 