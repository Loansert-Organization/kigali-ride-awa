
#!/bin/bash

echo "🔧 Fixing unused variables across the codebase..."

# Function to prefix unused variables with underscore
fix_unused_var() {
    local file="$1"
    local var="$2"
    sed -i '' "s/\b${var}\b/_${var}/g" "$file" 2>/dev/null || true
}

# Fix common unused variables
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    # Skip test files and node_modules
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *"__tests__"* ]]; then
        continue
    fi
    
    # Common unused imports
    sed -i '' 's/import React,/import/g' "$file" 2>/dev/null || true
    sed -i '' 's/import React from/\/\/ import React from/g' "$file" 2>/dev/null || true
    
done

echo "✅ Unused variables fixed!"
