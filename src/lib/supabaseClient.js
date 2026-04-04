const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function hasSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[supabase] Missing environment variables. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vite environment.'
    );
    return false;
  }

  return true;
}

export async function fetchAccounts() {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/accounts?select=*`, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[supabase] Request failed (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}
