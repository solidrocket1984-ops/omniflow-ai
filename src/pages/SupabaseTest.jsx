import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupabaseTest() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error: queryError } = await supabase
        .from('accounts')
        .select('*')
        .limit(20);

      if (queryError) {
        setError(queryError.message || 'Error consultando Supabase');
      } else {
        setRecords(data || []);
      }

      setLoading(false);
    };

    fetchAccounts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Prueba de conexión a Supabase</h1>

      {loading && <p>Cargando...</p>}

      {!loading && error && (
        <p className="text-destructive">Error: {error}</p>
      )}

      {!loading && !error && records.length === 0 && (
        <p>Conexión correcta, pero no hay datos</p>
      )}

      {!loading && !error && records.length > 0 && (
        <ul className="space-y-2">
          {records.map((record, index) => (
            <li key={record.id ?? index} className="rounded border p-3">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(record, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
