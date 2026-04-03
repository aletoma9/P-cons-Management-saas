import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://centdvslooaksvrstasn.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbnRkdnNsb29ha3N2cnN0YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMDgxMTYsImV4cCI6MjA5MDc4NDExNn0.T_O1Z7M9v6DCqL0-k2JJ9r-JlBpseLoIQjXwdiOLJCk';

// Initialize Supabase client only if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;
