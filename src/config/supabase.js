import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wzgcvnkupeomvkiazqsj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.warn('WARNING: SUPABASE_ANON_KEY is not defined in environment variables. Supabase Auth operations will fail.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-anon-key');

export default supabase;
