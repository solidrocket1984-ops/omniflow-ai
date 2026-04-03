import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Building2, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, account } = useOutletContext();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) setForm({ ...account });
  }, [account]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  async function save() {
    if (!account?.id) return;
    setSaving(true);
    try {
      const { id, created_date, updated_date, created_by, ...data } = form;
      await base44.entities.Account.update(account.id, data);
      toast.success('Ajustes guardados');
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (!account) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title="Ajustes"
        description="Configuración general de tu cuenta"
        actions={
          <Button onClick={save} disabled={saving} className="gap-1.5">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="general" className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> General</TabsTrigger>
          <TabsTrigger value="regional" className="gap-1.5"><Globe className="w-3.5 h-3.5" /> Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div><Label>Nombre de la empresa</Label><Input value={form.name || ''} onChange={e => update('name', e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Email de contacto</Label><Input value={form.contact_email || ''} onChange={e => update('contact_email', e.target.value)} /></div>
              <div><Label>Teléfono</Label><Input value={form.contact_phone || ''} onChange={e => update('contact_phone', e.target.value)} /></div>
            </div>
            <div><Label>Sitio web</Label><Input value={form.website || ''} onChange={e => update('website', e.target.value)} /></div>
            <div><Label>Dirección</Label><Input value={form.address || ''} onChange={e => update('address', e.target.value)} /></div>
            <div>
              <Label>Sector</Label>
              <Select value={form.sector || ''} onValueChange={v => update('sector', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar sector" /></SelectTrigger>
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
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <Label>Zona horaria</Label>
              <Input value={form.timezone || 'Europe/Madrid'} onChange={e => update('timezone', e.target.value)} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}