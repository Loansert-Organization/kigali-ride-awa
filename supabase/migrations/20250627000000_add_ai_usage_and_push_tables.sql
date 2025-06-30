-- AI usage cost tracking
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  usd NUMERIC(8,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own ai_usage" ON public.ai_usage FOR SELECT USING (user_id = auth.uid());

-- Web-push subscriptions
CREATE TABLE IF NOT EXISTS public.user_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own subs" ON public.user_push_subscriptions FOR ALL USING (user_id = auth.uid()); 