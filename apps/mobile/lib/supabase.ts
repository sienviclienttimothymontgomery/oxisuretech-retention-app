import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

import { Platform } from 'react-native';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[BOOT] Initializing Supabase client...');
console.log('[BOOT] URL:', supabaseUrl ? 'Defined' : 'MISSING');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

console.log('[BOOT] Supabase client initialized.');
