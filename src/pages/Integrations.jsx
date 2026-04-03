import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plug, Plus, Webhook, Mail, Database, FileSpreadsheet } from 'lucide-react';

const INTEGRATION_ICONS = {
  webhook: Webhook,
  email: Mail,
  crm: Database,
  google_sheets: FileSpreadsheet,
};

export default function Integrations() {
  const { user } = useOutletContext();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.account_id) { setLoading(false); return; }
      try {
        const data = await base44.entities.Integration.filter({ account_id: user.account_id }, '-created_date', 50);
        setIntegrations(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title="Integraciones"
        description="Conecta tu cuenta con herramientas externas"
        actions={<Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Nueva integración</Button>}
      />

      {integrations.length === 0 ? (
        <EmptyState icon={Plug} title="Sin integraciones" description="Conecta webhooks, CRM, email y más" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {integrations.map(int => {
            const Icon = INTEGRATION_ICONS[int.type] || Plug;
            return (
              <div key={int.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{int.name}</h4>
                    <span className="text-xs text-muted-foreground capitalize">{int.type}</span>
                  </div>
                </div>
                <StatusBadge status={int.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}