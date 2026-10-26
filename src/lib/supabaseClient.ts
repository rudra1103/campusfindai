// Optional Supabase connector & configuration validator
// If environment variables are absent, CampusFind AI transparently utilizes
// the local persistent database engine with identical schema and RLS semantics.

export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project')
);

export interface BackendStatus {
  mode: 'supabase_cloud' | 'local_persistent_storage';
  configured: boolean;
  aiEngine: 'multi_signal_deterministic' | 'external_gemini_api';
  description: string;
}

export function getBackendStatus(): BackendStatus {
  if (isSupabaseConfigured) {
    return {
      mode: 'supabase_cloud',
      configured: true,
      aiEngine: 'multi_signal_deterministic',
      description: 'Connected to Supabase PostgreSQL & Storage via environment configuration.',
    };
  }

  return {
    mode: 'local_persistent_storage',
    configured: true,
    aiEngine: 'multi_signal_deterministic',
    description: 'Local persistent storage active with full RLS simulation, audit logs, and deterministic MAS scoring engine.',
  };
}
