
import { createClient } from '@supabase/supabase-js';

// We prioritize environment variables if they exist, but fallback to the 
// hardcoded values provided for this specific project.
const supabaseUrl = process.env.SUPABASE_URL || 'https://vteqdozrlxvcahsxvgzz.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZXFkb3pybHh2Y2Foc3h2Z3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTkzMTgsImV4cCI6MjA4NTY3NTMxOH0.nOv7l98XCOMZ0FuPk2ce4YkToTz333xoQIDgqLmKLBE';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing. Data persistence will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
