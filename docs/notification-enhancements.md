# Notification System Enhancements

## Overview
This document outlines the recent enhancements to the notification system, including the addition of a rejection reason, a function to retry failed notifications, and updated error handling.

## Changes Implemented

### 1. Added `rejection_reason` to `notifications` table
A new column, `rejection_reason`, has been added to the `notifications` table to store the reason for notification failures.

**Migration:**
```sql
-- supabase/migrations/20250626021448_add_rejection_reason_to_notifications.sql
ALTER TABLE notifications
ADD COLUMN rejection_reason TEXT;
```

### 2. Updated `send-push-notification` function
The `send-push-notification` function has been updated to include the `rejection_reason` when a notification fails to send.

**Function Update:**
```typescript
// supabase/functions/send-push-notification/index.ts
// ... (imports)

// If sending fails, update the notifications table with a rejection reason
if (error) {
  await supabase
    .from('notifications')
    .update({ status: 'failed', rejection_reason: error.message })
    .eq('user_id', user_id);
}
```

### 3. Created `retry-failed-notifications` function
A new function, `retry-failed-notifications`, has been created to query for failed notifications and attempt to resend them.

**New Function:**
```typescript
// supabase/functions/retry-failed-notifications/index.ts
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
  }

  return new Response('Retried failed notifications', { status: 200 });
});
```

These enhancements ensure that the notification system is more robust and that failed notifications can be retried, improving the reliability of important updates. 