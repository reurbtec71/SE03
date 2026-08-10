import { createClient } from "@supabase/supabase-js";

// Cliente server-side (usa a Service Role Key — NUNCA exponha no browser).
// As rotas de API (src/app/api/**) são as únicas que devem importar este arquivo.
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
