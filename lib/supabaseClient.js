import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://wgqwizwyftdoxizhrljg.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
