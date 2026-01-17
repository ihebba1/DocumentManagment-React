import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY as CONST_KEY } from '../constants';

const STORAGE_KEY = 'supabase_anon_key';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

// Determine which key to use. 
// If storedKey exists, use it. Otherwise fallback to CONST_KEY.
// If neither exists or if it's a secret key, we use a placeholder to prevent immediate crash,
// but the App component will block access until a valid key is provided.
let apiKey = storedKey || CONST_KEY || '';

// If the hardcoded key is secret, we ignore it to prevent the SDK from throwing an error.
if (apiKey.startsWith('sb_secret') || apiKey.startsWith('service_role')) {
  console.warn('Secret key detected and ignored to prevent crash. Please input Anon key in UI.');
  apiKey = '';
}

// Helper to check if we have a valid configuration to run the app
export const isConfigured = () => {
  return apiKey.length > 0 && !apiKey.startsWith('sb_secret');
};

// Helper to update the key from the UI
export const setSupabaseKey = (key: string) => {
  localStorage.setItem(STORAGE_KEY, key);
  window.location.reload();
};

// Initialize client. If key is empty, this creates a client that will fail on requests,
// but we guard against making requests in App.tsx until isConfigured() is true.
// We provide a dummy key if empty to satisfy the constructor requirements without crashing.
export const supabase = createClient(SUPABASE_URL, apiKey || 'SUPABASE_CLIENT_NOT_CONFIGURED');