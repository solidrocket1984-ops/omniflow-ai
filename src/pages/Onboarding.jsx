import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Building2, Palette, Package, HelpCircle, Phone, Bot, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = [
  { icon: Building2, label: 'Tu negocio' },
  { icon: Palette, label: 'Tono' },
  { icon: Package, label: 'Servicios' },
  { icon: HelpCircle, label: 'FAQs' },
  { icon: Phone, label: 'Contacto' },
  { icon: Bot, label: 'Agente' },
];

export default function Onboarding() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', sector: '', description: '',
    tone: 'professional', greeting: '',
    services: '', faqs: '',
    email: '', phone: '', hours: '',
    agentInstructions: '',
  });
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  async function finish() {
    setSaving(true);
    try {
      // Create account
      const account = await base44.entities.Account.create({
        name: data.name,
        sector: data.sector,
        plan: 'basic',
        subscription_status: 'trial',
        contact_email: data.email,
        contact_phone: data.phone,
        onboarding_completed: true,
        channels_enabled: ['webchat'],
      });

      // Link user to account
      await base44.auth.updateMe({ account_id: account.id, role: 'account_admin' });

      // Create agent profile
      await base44.entities.AgentProfile.create({
        account_id: account.id,
        business_name: data.name,
        business_description: data.description,
        tone: data.tone,
        greeting_message: data.greeting,
        contact_info: `${data.email} - ${data.phone}`,
        business_hours: data.hours,
        custom_instructions: data.agentInstructions,
      });

      // Create services
      if (data.services.trim()) {
        const services = data.services.split('\n').filter(s => s.trim());
        for (const s of services) {
          await base44.entities.ProductService.create({ account_id: account.id, name: s.trim() });
        }
      }

      // Create FAQs
      if (data.faqs.trim()) {
        const pairs = data.faqs.split('\n').filter(s => s.trim());
        for (const pair of pairs) {
          const [q, a] = pair.split('|').map(s => s?.trim());
          if (q) {
            await base44.entities.FAQ.create({ account_id: account.id, question: q, answer: a || '' });
          }
        }
      }

      toast.success('¡Tu cuenta está lista!');
      navigate('/');
    } catch (e) {
      toast.error('Error al crear la cuenta');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
              i < step ? 'bg-primary text-primary-foreground' :
              i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
              'bg-muted text-muted-foreground'
            )}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={cn("w-8 h-0.5", i < step ? 'bg-primary' : 'bg-border')} />}
          </div>
        ))}
      </div>

      <div className="w-full bg-card border border-border rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-1">{STEPS[step].label}</h2>
        <p className="text-sm text-muted-foreground mb-6">Paso {step + 1} de {STEPS.length}</p>

        {step === 0 && (
          <div className="space-y-4">
            <div><Label>Nombre de tu negocio</Label><Input value={data.name} onChange={e => update('name', e.target.value)} placeholder="Mi Empresa" /></div>
            <div>
              <Label>Sector</Label>
              <Select value={data.sector} onValueChange={v => update('sector', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospitality">Hostelería</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Salud</SelectItem>
                  <SelectItem value="real_estate">Inmobiliaria</SelectItem>
                  <SelectItem value="education">Educación</SelectItem>
                  <SelectItem value="professional_services">Servicios profesionales</SelectItem>
                  <SelectItem value="ecommerce">Ecommerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Descripción breve</Label><Textarea value={data.description} onChange={e => update('description', e.target.value)} placeholder="¿A qué se dedica tu negocio?" rows={3} /></div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Tono de comunicación del agente</Label>
              <Select value={data.tone} onValueChange={v => update('tone', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profesional</SelectItem>
                  <SelectItem value="friendly">Amigable</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="empathetic">Empático</SelectItem>
                  <SelectItem value="energetic">Enérgico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Mensaje de bienvenida</Label><Textarea value={data.greeting} onChange={e => update('greeting', e.target.value)} placeholder="¡Hola! ¿En qué puedo ayudarte hoy?" rows={3} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Servicios o productos (uno por línea)</Label>
              <Textarea value={data.services} onChange={e => update('services', e.target.value)} placeholder="Consultoría estratégica&#10;Diseño web&#10;Marketing digital" rows={6} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Preguntas frecuentes (formato: pregunta | respuesta)</Label>
              <Textarea value={data.faqs} onChange={e => update('faqs', e.target.value)} placeholder="¿Cuál es el precio?|Nuestros servicios empiezan desde 50€/mes&#10;¿Ofrecen prueba gratis?|Sí, 14 días de prueba" rows={6} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div><Label>Email de contacto</Label><Input type="email" value={data.email} onChange={e => update('email', e.target.value)} /></div>
            <div><Label>Teléfono</Label><Input value={data.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div><Label>Horarios de atención</Label><Input value={data.hours} onChange={e => update('hours', e.target.value)} placeholder="Lun-Vie 9:00-18:00" /></div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <Label>Instrucciones adicionales para tu agente</Label>
              <Textarea value={data.agentInstructions} onChange={e => update('agentInstructions', e.target.value)} placeholder="Instrucciones especiales, restricciones, comportamiento deseado..." rows={6} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} className="gap-1.5">
              Siguiente <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving} className="gap-1.5">
              {saving ? 'Creando...' : 'Completar configuración'} <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}