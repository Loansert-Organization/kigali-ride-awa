
#!/bin/bash

echo "🔍 Running comprehensive type checking..."

# Run TypeScript compiler
echo "📝 Checking TypeScript types..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript types are valid"
else
    echo "❌ TypeScript type errors found"
    exit 1
fi

# Run ESLint
echo "🔧 Running ESLint..."
npx eslint . --ext .ts,.tsx

if [ $? -eq 0 ]; then
    echo "✅ ESLint checks passed"
else
    echo "❌ ESLint errors found"
    exit 1
fi

# Build check
echo "🏗️  Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 All checks passed!"
