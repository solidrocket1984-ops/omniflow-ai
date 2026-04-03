import { useOutletContext } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { hasPlanFeature } from '@/lib/permissions';
import { MessageSquare, Phone, Instagram, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CHANNELS = [
  { key: 'webchat', label: 'Webchat', description: 'Widget de chat para tu web', icon: MessageSquare, feature: 'webchat' },
  { key: 'whatsapp', label: 'WhatsApp', description: 'Conecta tu número de WhatsApp Business', icon: Phone, feature: 'whatsapp' },
  { key: 'instagram', label: 'Instagram', description: 'Responde mensajes directos de Instagram', icon: Instagram, feature: 'instagram' },
  { key: 'email', label: 'Email', description: 'Gestiona conversaciones por email', icon: Mail, feature: 'webchat' },
];

export default function Channels() {
  const { account } = useOutletContext();
  const plan = account?.plan || 'basic';
  const enabledChannels = account?.channels_enabled || [];

  return (
    <div>
      <PageHeader title="Canales" description="Configura los canales de comunicación de tu agente" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CHANNELS.map(ch => {
          const hasAccess = hasPlanFeature(plan, ch.feature);
          const isEnabled = enabledChannels.includes(ch.key);
          const Icon = ch.icon;
          
          return (
            <div key={ch.key} className={cn(
              "bg-card border rounded-xl p-6 transition-all",
              hasAccess ? 'border-border hover:shadow-md' : 'border-border opacity-60'
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isEnabled ? 'bg-emerald-50' : 'bg-muted'
                  )}>
                    <Icon className={cn("w-5 h-5", isEnabled ? 'text-emerald-600' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{ch.label}</h3>
                    <p className="text-xs text-muted-foreground">{ch.description}</p>
                  </div>
                </div>
                {!hasAccess && <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="mt-4">
                {hasAccess ? (
                  <Button variant={isEnabled ? "outline" : "default"} size="sm" className="w-full">
                    {isEnabled ? 'Configurar' : 'Activar canal'}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Disponible en plan superior
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}