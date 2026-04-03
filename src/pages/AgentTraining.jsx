import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Bot, Building2, MessageSquare, Shield, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentTraining() {
  const { user, account } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (!user?.account_id) return;
        const profiles = await base44.entities.AgentProfile.filter({ account_id: user.account_id }, '-created_date', 1);
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          setProfile({
            account_id: user.account_id,
            business_name: account?.name || '',
            tone: 'professional',
            commercial_style: 'consultative',
            languages: ['es'],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, account]);

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  async function save() {
    setSaving(true);
    try {
      if (profile.id) {
        const { id, created_date, updated_date, created_by, ...data } = profile;
        await base44.entities.AgentProfile.update(profile.id, data);
      } else {
        const created = await base44.entities.AgentProfile.create(profile);
        setProfile(created);
      }
      toast.success('Perfil del agente guardado');
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title="Entrenamiento del Agente IA"
        description="Configura cómo tu agente interactúa con los clientes"
        actions={
          <Button onClick={save} disabled={saving} className="gap-1.5">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        }
      />

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="business" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Negocio</TabsTrigger>
          <TabsTrigger value="communication" className="gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Comunicación</TabsTrigger>
          <TabsTrigger value="commercial" className="gap-1.5"><Target className="w-3.5 h-3.5" /> Comercial</TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Reglas</TabsTrigger>
          <TabsTrigger value="operations" className="gap-1.5"><Clock className="w-3.5 h-3.5" /> Operativa</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <FormSection title="Información del negocio">
            <Field label="Nombre del negocio" value={profile?.business_name} onChange={v => updateField('business_name', v)} />
            <FieldTextarea label="Descripción del negocio" value={profile?.business_description} onChange={v => updateField('business_description', v)} placeholder="¿Qué hace tu negocio?" />
            <FieldTextarea label="Historia del negocio" value={profile?.business_history} onChange={v => updateField('business_history', v)} placeholder="Contexto e historia relevante" />
            <FieldTextarea label="Propuesta de valor" value={profile?.value_proposition} onChange={v => updateField('value_proposition', v)} placeholder="¿Qué te hace diferente?" />
          </FormSection>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <FormSection title="Tono y estilo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Tono</Label>
                <Select value={profile?.tone || 'professional'} onValueChange={v => updateField('tone', v)}>
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
              <div>
                <Label className="text-sm mb-1.5 block">Estilo comercial</Label>
                <Select value={profile?.commercial_style || 'consultative'} onValueChange={v => updateField('commercial_style', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultative">Consultivo</SelectItem>
                    <SelectItem value="direct">Directo</SelectItem>
                    <SelectItem value="soft_sell">Soft Sell</SelectItem>
                    <SelectItem value="educational">Educativo</SelectItem>
                    <SelectItem value="aggressive">Agresivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <FieldTextarea label="Mensaje de bienvenida" value={profile?.greeting_message} onChange={v => updateField('greeting_message', v)} placeholder="¿Cómo saluda el agente?" />
            <FieldTextarea label="Mensaje cuando no sabe responder" value={profile?.fallback_message} onChange={v => updateField('fallback_message', v)} />
            <FieldTextarea label="Mensaje de escalación a humano" value={profile?.escalation_message} onChange={v => updateField('escalation_message', v)} />
          </FormSection>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-4">
          <FormSection title="Configuración comercial">
            <FieldTextarea label="Reglas de precios" value={profile?.pricing_rules} onChange={v => updateField('pricing_rules', v)} placeholder="Rangos autorizados, descuentos permitidos..." />
            <FieldTextarea label="Manejo de objeciones" value={profile?.objection_handling} onChange={v => updateField('objection_handling', v)} placeholder="Cómo debe responder ante objeciones..." />
            <FieldTextarea label="Criterios de lead caliente" value={profile?.lead_qualification_criteria} onChange={v => updateField('lead_qualification_criteria', v)} placeholder="¿Qué define un lead cualificado?" />
            <FieldTextarea label="Promociones activas" value={profile?.active_promotions} onChange={v => updateField('active_promotions', v)} />
          </FormSection>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <FormSection title="Reglas y límites">
            <FieldTextarea label="Reglas de escalación" value={profile?.escalation_rules} onChange={v => updateField('escalation_rules', v)} placeholder="¿Cuándo debe derivar a un humano?" />
            <FieldTextarea label="Temas prohibidos" value={profile?.forbidden_topics} onChange={v => updateField('forbidden_topics', v)} placeholder="Temas que el agente no debe tocar" />
            <FieldTextarea label="Frases prohibidas" value={profile?.forbidden_phrases} onChange={v => updateField('forbidden_phrases', v)} placeholder="Frases que nunca debe usar" />
            <FieldTextarea label="Instrucciones personalizadas" value={profile?.custom_instructions} onChange={v => updateField('custom_instructions', v)} placeholder="Instrucciones adicionales para el agente" rows={6} />
          </FormSection>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <FormSection title="Datos operativos">
            <FieldTextarea label="Información de contacto" value={profile?.contact_info} onChange={v => updateField('contact_info', v)} placeholder="Teléfono, email, dirección..." />
            <FieldTextarea label="Horarios de atención" value={profile?.business_hours} onChange={v => updateField('business_hours', v)} placeholder="Lunes a viernes 9:00-18:00" />
            <FieldTextarea label="Zonas de atención" value={profile?.service_areas} onChange={v => updateField('service_areas', v)} placeholder="Ciudades, regiones, países..." />
          </FormSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <Label className="text-sm mb-1.5 block">{label}</Label>
      <Input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <Label className="text-sm mb-1.5 block">{label}</Label>
      <Textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
    </div>
  );
}