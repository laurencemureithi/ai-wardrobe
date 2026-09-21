import { createClient } from '@supabase/supabase-js';
import { createMockSupabase } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

function initSupabase() {
  if (isConfigured) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'implicit' as const,
          storage: {
            getItem: (key: string) => {
              try {
                return localStorage.getItem(key);
              } catch {
                return null;
              }
            },
            setItem: (key: string, value: string) => {
              try {
                localStorage.setItem(key, value);
              } catch {
                /* ignore */
              }
            },
            removeItem: (key: string) => {
              try {
                localStorage.removeItem(key);
              } catch {
                /* ignore */
              }
            },
          },
        },
      });
    } catch (e) {
      console.warn('[AI Studio] Failed to initialize Supabase client, using mock:', e);
    }
  }
  return createMockSupabase() as unknown as ReturnType<typeof createClient>;
}

export const supabase = initSupabase();
