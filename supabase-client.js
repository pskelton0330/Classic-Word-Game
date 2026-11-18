import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

// This publishable key is intended for browser use. Database access is protected by RLS.
export const supabase = createClient(
  'https://uvhqfkjodnhpacxhcpan.supabase.co',
  'sb_publishable_bQx2BRwoexDYKnYuJcvepg_6_yRvroD',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: localStorage } }
);
