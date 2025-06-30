#!/bin/bash

# Supabase configuration
SUPABASE_URL="https://nireplgrlwhwppjtfxbb.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyNjMzMywiZXhwIjoyMDY2MTAyMzMzfQ.JhUCiklNO9vHWLrmrBYwDGbdaQtLUSBXmKTIoB4b7G8"

# Direct database connection
DB_HOST="db.nireplgrlwhwppjtfxbb.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASS="o1cD5V9cTekPpt62"

echo "Running Supabase migrations..."

# Export password for psql
export PGPASSWORD="$DB_PASS"

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

# Run each migration
for migration in "${migrations[@]}"; do
  echo "Applying migration: $migration"
  
  # Try to run the migration
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "supabase/migrations/$migration" 2>&1
  
  if [ $? -eq 0 ]; then
    echo "✓ Successfully applied $migration"
  else
    echo "✗ Failed to apply $migration (may already exist)"
  fi
  
  echo ""
done

echo "Migration process completed!"

# Unset password
unset PGPASSWORD 