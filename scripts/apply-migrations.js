const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyNjMzMywiZXhwIjoyMDY2MTAyMzMzfQ.JhUCiklNO9vHWLrmrBYwDGbdaQtLUSBXmKTIoB4b7G8';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Migration files in order
const migrations = [
  '20240726120000_initial_schema.sql',
  '20250625172839-66ca9baf-4d70-4bba-8e42-617c64bde92b.sql',
  '20250625173458-3e095ecd-665e-453f-95c3-642e2ba5dbe8.sql',
  '20250625180052-3d00cc6a-5f04-42c0-a6f9-b1da13720ef1.sql',
  '20250625195323-3e56a093-c6c4-4560-8b8f-b0aabc0a4ebf.sql',
  '20250625212832-8b063d34-785f-49b6-b15e-3bbb697102ad.sql',
  '20250625215428-cd3da499-a788-48f4-9b55-53a735fde8c3.sql',
  '20250625222350-d0246534-3ec7-4c11-8feb-fabdeb18f550.sql',
  '20250625225126-1791d62d-f5b2-41bb-ad7e-e491e4e22b63.sql',
  '20250625230052-cd465e40-a1ef-40c5-bad3-6c84eec6ace6.sql',
  '20250625232055-d3b98397-42a9-4fbc-89e2-139274d22dc5.sql',
  '20250625235917-6540272f-e996-47f3-b771-c211bf6651ac.sql',
  '20250626012153-fcacfa58-fce6-47eb-ae19-d3225bd6b7ac.sql',
  '20250626021448-1b72c7d9-d84c-4909-97fc-cc4259301aa2.sql',
  '20250626043048-673b9fd5-68d2-40e7-b65e-07735d926ab1.sql',
  '20250626145346-aad23903-2a51-41a3-a00c-99a5897316b5.sql',
  '20250626180359-d9106761-8a66-4ff1-bbd1-27d17d22e293.sql',
  '20250101000000_trip_wizard_schema.sql',
  '20250101000001_add_country_support.sql',
  '20250101000002_add_ai_assistant_tables.sql',
  '20250627000000_add_ai_usage_and_push_tables.sql'
];

async function applyMigrations() {
  console.log('Starting migration process...\n');

  for (const migration of migrations) {
    console.log(`Applying migration: ${migration}`);
    
    try {
      // Read migration file
      const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute SQL using Supabase client
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: sql 
      });
      
      if (error) {
        console.error(`Error applying ${migration}:`, error.message);
        // Continue with next migration
      } else {
        console.log(`✓ Successfully applied ${migration}`);
      }
      
    } catch (err) {
      console.error(`Failed to read or apply ${migration}:`, err.message);
    }
    
    console.log('');
  }
  
  console.log('Migration process completed!');
}

// Run migrations
applyMigrations().catch(console.error); 