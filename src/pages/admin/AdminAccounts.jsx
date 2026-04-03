import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function AdminAccounts() {
  const { user } = useOutletContext();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await base44.entities.Account.list('-created_date', 100);
        setAccounts(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = accounts.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name?.toLowerCase().includes(q) || a.contact_email?.toLowerCase().includes(q);
  });

  async function createAccount(data) {
    const created = await base44.entities.Account.create(data);
    setAccounts(prev => [created, ...prev]);
    setDialogOpen(false);
    toast.success('Cuenta creada');
  }

  if (loading) return <LoadingScreen />;
  if (user?.role !== 'super_admin') return <div className="text-center py-20 text-muted-foreground">Acceso denegado</div>;

  return (
    <div>
      <PageHeader
        title="Cuentas"
        description="Administración de todas las cuentas del sistema"
        actions={<Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4" /> Nueva cuenta</Button>}
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar cuentas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Cuenta</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Plan</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Suscripción</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Sector</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Creada</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => (
              <tr key={acc.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/admin/accounts/${acc.id}`} className="hover:underline">
                    <div className="text-sm font-medium">{acc.name}</div>
                    <div className="text-xs text-muted-foreground">{acc.contact_email || '—'}</div>
                  </Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={acc.plan} /></td>
                <td className="px-4 py-3 hidden md:table-cell"><StatusBadge status={acc.subscription_status} /></td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground capitalize">{acc.sector || '—'}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">{moment(acc.created_date).format('DD/MM/YYYY')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateAccountDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={createAccount} />
    </div>
  );
}

function CreateAccountDialog({ open, onOpenChange, onSave }) {
  const [form, setForm] = useState({ plan: 'basic', subscription_status: 'trial' });
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva cuenta</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nombre</Label><Input value={form.name || ''} onChange={e => update('name', e.target.value)} /></div>
          <div><Label>Email de contacto</Label><Input value={form.contact_email || ''} onChange={e => update('contact_email', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Plan</Label>
              <Select value={form.plan} onValueChange={v => update('plan', v)}>
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
              <Label>Sector</Label>
              <Select value={form.sector || ''} onValueChange={v => update('sector', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospitality">Hostelería</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Salud</SelectItem>
                  <SelectItem value="ecommerce">Ecommerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" onClick={() => onSave(form)}>Crear cuenta</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}