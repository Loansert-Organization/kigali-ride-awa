#!/bin/bash

# This script finds and removes unused TypeScript imports across the project.
# It uses the `ts-prune` utility, which needs to be installed locally as a dev dependency.

TS_PRUNE_CMD="./node_modules/.bin/ts-prune"

# First, ensure ts-prune is available
if [ ! -f "$TS_PRUNE_CMD" ]; then
    echo "ts-prune could not be found. Please install it as a dev dependency:"
    echo "npm install --save-dev ts-prune"
    exit 1
fi

echo "Running ts-prune to find unused exports..."

# Generate the list of unused exports
# The output format is `path/to/file:line:col: identifier`
UNUSED=$($TS_PRUNE_CMD)

if [ -z "$UNUSED" ]; then
  echo "✅ No unused exports found. Excellent!"
  exit 0
fi

echo "Found unused exports. Attempting to auto-remove..."
echo "$UNUSED"

# This part is tricky because auto-removing can be destructive.
# A safer approach is to manually review. However, for a quick cleanup:
# We can use sed to comment out the lines.

echo "$UNUSED" | while IFS=: read -r file line col ident; do
  # Skip node_modules
  if [[ "$file" == *"node_modules"* ]]; then
    continue
  fi

  # Check if file and line number are valid
  if [ -f "$file" ] && [ -n "$line" ]; then
    # Use sed to comment out the line.
    # This is safer than deleting.
    # Note: sed syntax varies. This is for GNU sed. On macOS, you might need 'gsed'.
    # For simplicity, we will use a perl command which is more consistent.
    
    # Check if the line is already commented
    LINE_CONTENT=$(sed -n "${line}p" "$file")
    if [[ "$LINE_CONTENT" == *'//'* ]] || [[ "$LINE_CONTENT" == *'/*'* ]]; then
      echo "Skipping already commented line in $file:$line"
      continue
    fi

    # This is still risky. A better approach for now is to just report them.
    # The user can then use the IDE to fix them quickly.
    
    # Let's try to fix unused 'React' imports specifically, as that's very common and safe.
    if [[ "$ident" == *"React' is declared but its value is never read"* ]]; then
        echo "Fixing unused React import in $file"
        # This will remove the entire line containing 'import React'
        sed -i.bak "/import React/d" "$file"
    fi
  fi
done

echo "---"
echo "Manual cleanup might be required for the following:"
echo "$UNUSED"

# To get a list of just the files:
# echo "$UNUSED" | cut -d: -f1 | sort -u

echo "For best results, open the files in your IDE and use the 'Organize Imports' command." 