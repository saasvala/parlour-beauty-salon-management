-- Fix overly permissive RLS policies

-- Drop the permissive policies
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can create error logs" ON public.error_logs;

-- Create more restrictive policies for notifications
-- Only authenticated users can receive notifications (system creates them via service role)
CREATE POLICY "Authenticated users can receive notifications" ON public.notifications 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can create error logs for themselves or their salon
CREATE POLICY "Authenticated users can create error logs" ON public.error_logs 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));