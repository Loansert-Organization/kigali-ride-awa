import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: failedNotifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('status', 'failed');

  if (error) {
    console.error('Error fetching failed notifications:', error);
    return new Response('Error fetching failed notifications', { status: 500 });
  }

  for (const notification of failedNotifications) {
    // Retry sending the notification
    // You can reuse the logic from the send-push-notification function
    // or call it directly if it's accessible
  }

  return new Response('Retried failed notifications', { status: 200 });
}); 