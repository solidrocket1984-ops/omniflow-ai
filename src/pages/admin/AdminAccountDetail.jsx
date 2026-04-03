import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PLAN_FEATURES } from '@/lib/permissions';

export default function AdminAccountDetail() {
  const { id } = useParams();
  const { user } = useOutletContext();
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const accs = await base44.entities.Account.filter({ id });
        if (accs.length > 0) {
          setAccount(accs[0]);
          setForm(accs[0]);
        }
        const users = await base44.entities.User.list('-created_date', 100);
        setMembers(users.filter(u => u.account_id === id));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const { id: _id, created_date, updated_date, created_by, ...data } = form;
      await base44.entities.Account.update(account.id, data);
      toast.success('Cuenta actualizada');
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (user?.role !== 'super_admin') return <div className="text-center py-20 text-muted-foreground">Acceso denegado</div>;
  if (!account) return <div className="text-center py-20 text-muted-foreground">Cuenta no encontrada</div>;

  return (
    <div>
      <Link to="/admin/accounts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{account.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={account.plan} />
            <StatusBadge status={account.subscription_status} />
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="gap-1.5">
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold">Datos de la cuenta</h3>
            <div><Label>Nombre</Label><Input value={form.name || ''} onChange={e => update('name', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input value={form.contact_email || ''} onChange={e => update('contact_email', e.target.value)} /></div>
              <div><Label>Teléfono</Label><Input value={form.contact_phone || ''} onChange={e => update('contact_phone', e.target.value)} /></div>
            </div>
            <div><Label>Web</Label><Input value={form.website || ''} onChange={e => update('website', e.target.value)} /></div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold">Plan y suscripción</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plan</Label>
                <Select value={form.plan || 'basic'} onValueChange={v => update('plan', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado suscripción</Label>
                <Select value={form.subscription_status || 'trial'} onValueChange={v => update('subscription_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Prueba</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="past_due">Pendiente</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Máx. usuarios</Label><Input type="number" value={form.max_users || ''} onChange={e => update('max_users', Number(e.target.value))} /></div>
              <div><Label>Máx. agentes</Label><Input type="number" value={form.max_agents || ''} onChange={e => update('max_agents', Number(e.target.value))} /></div>
              <div><Label>Máx. conv./mes</Label><Input type="number" value={form.max_conversations_monthly || ''} onChange={e => update('max_conversations_monthly', Number(e.target.value))} /></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Usuarios ({members.length})</h3>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin usuarios</p>
            ) : (
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.id} className="text-sm">
                    <div className="font-medium">{m.full_name || m.email}</div>
                    <div className="text-xs text-muted-foreground capitalize">{m.role}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}