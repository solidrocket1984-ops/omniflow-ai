import { useOutletContext } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { PLAN_FEATURES } from '@/lib/permissions';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAN_DISPLAY = {
  basic: { name: 'Basic', price: '29€/mes', color: 'border-gray-200' },
  pro: { name: 'Pro', price: '79€/mes', color: 'border-blue-200' },
  premium: { name: 'Premium', price: '199€/mes', color: 'border-purple-200' },
  enterprise: { name: 'Enterprise', price: 'Personalizado', color: 'border-amber-200' },
};

const FEATURE_LABELS = {
  webchat: 'Webchat',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  advanced_dashboard: 'Dashboard avanzado',
  export: 'Exportación',
  campaigns: 'Campañas',
  automations: 'Automatizaciones',
  integrations: 'Integraciones',
  lead_scoring: 'Lead scoring',
  custom_branding: 'Branding personalizado',
  multi_location: 'Multi-sede',
  api_access: 'API Access',
  priority_support: 'Soporte prioritario',
};

export default function Billing() {
  const { account } = useOutletContext();
  const currentPlan = account?.plan || 'basic';

  return (
    <div>
      <PageHeader title="Facturación" description="Gestiona tu plan y suscripción" />

      {/* Current plan */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Plan actual</div>
            <div className="text-xl font-bold text-foreground capitalize">{currentPlan}</div>
          </div>
          <StatusBadge status={account?.subscription_status || 'trial'} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Usuarios</span>
            <div className="font-medium">{PLAN_FEATURES[currentPlan]?.max_users === -1 ? 'Ilimitados' : PLAN_FEATURES[currentPlan]?.max_users}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Agentes IA</span>
            <div className="font-medium">{PLAN_FEATURES[currentPlan]?.max_agents === -1 ? 'Ilimitados' : PLAN_FEATURES[currentPlan]?.max_agents}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Conv. mensuales</span>
            <div className="font-medium">{PLAN_FEATURES[currentPlan]?.max_conversations_monthly === -1 ? 'Ilimitadas' : PLAN_FEATURES[currentPlan]?.max_conversations_monthly?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Plans comparison */}
      <h3 className="text-lg font-semibold mb-4">Comparar planes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PLAN_DISPLAY).map(([key, display]) => {
          const planConfig = PLAN_FEATURES[key];
          const isCurrent = key === currentPlan;
          return (
            <div key={key} className={cn(
              "bg-card border-2 rounded-xl p-5 transition-all",
              isCurrent ? 'border-primary shadow-md' : display.color
            )}>
              <div className="mb-4">
                <h4 className="text-base font-bold">{display.name}</h4>
                <div className="text-lg font-bold text-primary mt-1">{display.price}</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">
                  {planConfig.max_users === -1 ? 'Usuarios ilimitados' : `${planConfig.max_users} usuarios`}
                </li>
                <li className="text-muted-foreground">
                  {planConfig.max_conversations_monthly === -1 ? 'Conv. ilimitadas' : `${planConfig.max_conversations_monthly.toLocaleString()} conv./mes`}
                </li>
                {Object.entries(FEATURE_LABELS).map(([feat, label]) => (
                  <li key={feat} className="flex items-center gap-2">
                    {planConfig.features.includes(feat) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground/40" />
                    )}
                    <span className={planConfig.features.includes(feat) ? 'text-foreground' : 'text-muted-foreground/60'}>{label}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? "outline" : "default"}
                size="sm"
                className="w-full mt-4"
                disabled={isCurrent}
              >
                {isCurrent ? 'Plan actual' : 'Cambiar plan'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}