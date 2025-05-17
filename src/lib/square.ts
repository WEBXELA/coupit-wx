import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Ensure environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const squareAppId = import.meta.env.VITE_SQUARE_APP_ID;
const squareAppSecret = import.meta.env.VITE_SQUARE_APP_SECRET;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

if (!squareAppId || !squareAppSecret) {
  throw new Error('Missing Square environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});