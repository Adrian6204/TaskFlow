
import { createClient } from '@supabase/supabase-js';

// Access environment variables directly. 
// Vite (via vite.config.ts) will inject these during the build process on Vercel.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // This error will appear in the browser console if you forgot to add the variables in Vercel
  throw new Error("Supabase URL or Key is missing. Please check your Vercel Environment Variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
