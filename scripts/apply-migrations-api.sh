#!/bin/bash

# Supabase project details
PROJECT_REF="nireplgrlwhwppjtfxbb"
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyNjMzMywiZXhwIjoyMDY2MTAyMzMzfQ.JhUCiklNO9vHWLrmrBYwDGbdaQtLUSBXmKTIoB4b7G8"

echo "Applying migrations to Supabase project..."

# Function to execute SQL via Supabase Management API
execute_sql() {
    local sql_content="$1"
    local migration_name="$2"
    
    echo "Applying migration: $migration_name"
    
    # Use the SQL Editor endpoint
    response=$(curl -s -X POST \
        "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$sql_content" | jq -Rs .)}")
    
    if [[ $? -eq 0 ]]; then
        echo "✓ Applied $migration_name"
    else
        echo "✗ Failed to apply $migration_name"
    fi
}

# Migration files in order
migrations=(
    "20240726120000_initial_schema.sql"
    "20250625172839-66ca9baf-4d70-4bba-8e42-617c64bde92b.sql"
    "20250625173458-3e095ecd-665e-453f-95c3-642e2ba5dbe8.sql"
    "20250625180052-3d00cc6a-5f04-42c0-a6f9-b1da13720ef1.sql"
    "20250625195323-3e56a093-c6c4-4560-8b8f-b0aabc0a4ebf.sql"
    "20250625212832-8b063d34-785f-49b6-b15e-3bbb697102ad.sql"
    "20250625215428-cd3da499-a788-48f4-9b55-53a735fde8c3.sql"
    "20250625222350-d0246534-3ec7-4c11-8feb-fabdeb18f550.sql"
    "20250625225126-1791d62d-f5b2-41bb-ad7e-e491e4e22b63.sql"
    "20250625230052-cd465e40-a1ef-40c5-bad3-6c84eec6ace6.sql"
    "20250625232055-d3b98397-42a9-4fbc-89e2-139274d22dc5.sql"
    "20250625235917-6540272f-e996-47f3-b771-c211bf6651ac.sql"
    "20250626012153-fcacfa58-fce6-47eb-ae19-d3225bd6b7ac.sql"
    "20250626021448-1b72c7d9-d84c-4909-97fc-cc4259301aa2.sql"
    "20250626043048-673b9fd5-68d2-40e7-b65e-07735d926ab1.sql"
    "20250626145346-aad23903-2a51-41a3-a00c-99a5897316b5.sql"
    "20250626180359-d9106761-8a66-4ff1-bbd1-27d17d22e293.sql"
    "20250101000000_trip_wizard_schema.sql"
    "20250101000001_add_country_support.sql"
    "20250101000002_add_ai_assistant_tables.sql"
    "20250627000000_add_ai_usage_and_push_tables.sql"
)

# Apply each migration
for migration in "${migrations[@]}"; do
    if [[ -f "supabase/migrations/$migration" ]]; then
        sql_content=$(cat "supabase/migrations/$migration")
        execute_sql "$sql_content" "$migration"
    else
        echo "✗ Migration file not found: $migration"
    fi
    
    # Small delay between migrations
    sleep 1
done

echo ""
echo "Migration process completed!" 