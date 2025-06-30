import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// TODO configure these via env vars
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !anonKey) {
  console.error('Missing env for RLS test');
  process.exit(1);
}

const anon = createClient(supabaseUrl, anonKey);
const owner = createClient(supabaseUrl, anonKey, {
  global: { headers: { Authorization: `Bearer ${serviceKey}` } }
});

(async () => {
  console.log('🔒  RLS smoke test');
  const { error: e1 } = await anon.from('ai_draft_trips').insert({ user_id: '000', payload: {}, generated_for: new Date().toISOString() });
  if (!e1) {
    console.error('❌ Anon insert unexpectedly succeeded');
    process.exit(1);
  }
  console.log('✅ Anon insert blocked as expected');

  const { error: e2 } = await owner.from('dialog_messages').insert({ user_id: 'test', role: 'system', content: 'hello' });
  if (e2) {
    console.error('❌ Owner insert failed', e2);
    process.exit(1);
  }
  console.log('✅ Owner insert succeeded');
  process.exit(0);
})(); 