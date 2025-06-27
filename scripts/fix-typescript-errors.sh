#!/bin/bash

# Script to fix common TypeScript errors in the codebase

echo "🔧 Starting TypeScript error fixes..."

# Fix catch block any types
echo "📝 Fixing catch block any types..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/} catch (error: any) {/} catch (error) {/g' "$file"
done

# Fix console.log statements - import devLog where needed
echo "📝 Adding devLog imports where console.log is used..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "console\.log" "$file" && ! grep -q "import.*devLog" "$file"; then
    # Add import after the last import statement
    sed -i '' '/^import.*from/h;$!d;x;s/.*/&\nimport { devLog } from "@\/utils\/errorHandlers";/' "$file"
  fi
done

# Replace console.log with devLog
echo "📝 Replacing console.log with devLog..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/console\.log(/devLog(/g' "$file"
done

# Fix unused variables by adding underscore prefix
echo "📝 Fixing unused variables..."
# This is more complex and would need proper AST parsing, so we'll leave it for manual fixes

echo "✅ Automated fixes complete!"
echo "📊 Remaining issues to fix manually:"
echo "   - Complex any types that need proper interfaces"
echo "   - Unused variables that need underscore prefix"
echo "   - Empty interfaces"
echo "   - React hooks dependencies"

# Count remaining errors
echo ""
echo "📈 Error summary:"
npm run lint 2>&1 | grep -E "@typescript-eslint/no-explicit-any|no-console|no-unused-vars" | wc -l 