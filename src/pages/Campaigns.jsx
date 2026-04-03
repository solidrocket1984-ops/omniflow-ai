import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Megaphone, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function Campaigns() {
  const { user } = useOutletContext();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const accountId = user?.account_id;

  useEffect(() => {
    async function load() {
      if (!accountId) { setLoading(false); return; }
      try {
        const data = await base44.entities.Campaign.filter({ account_id: accountId }, '-created_date', 50);
        setCampaigns(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [accountId]);

  async function save(data) {
    if (data.id) {
      const { id, created_date, updated_date, created_by, ...rest } = data;
      await base44.entities.Campaign.update(id, rest);
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...rest } : c));
    } else {
      const created = await base44.entities.Campaign.create({ ...data, account_id: accountId });
      setCampaigns(prev => [created, ...prev]);
    }
    setDialogOpen(false);
    setEditing(null);
    toast.success('Campaña guardada');
  }

  async function remove(id) {
    await base44.entities.Campaign.delete(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success('Campaña eliminada');
  }

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title="Campañas"
        description="Gestiona tus campañas de captación y comunicación"
        actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="w-4 h-4" /> Nueva campaña</Button>}
      />

      {campaigns.length === 0 ? (
        <EmptyState icon={Megaphone} title="Sin campañas" description="Crea tu primera campaña para potenciar la captación" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(camp => (
            <div key={camp.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">{camp.name}</h4>
                <StatusBadge status={camp.status} />
              </div>
              {camp.objective && <p className="text-sm text-muted-foreground mb-2">{camp.objective}</p>}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="capitalize">{camp.channel || '—'}</span>
                {camp.start_date && <span>{moment(camp.start_date).format('DD/MM')}</span>}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">{camp.leads_generated || 0} leads</span>
                <span className="text-muted-foreground">{camp.conversations_count || 0} conv.</span>
              </div>
              <div className="flex gap-1 mt-3 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(camp); setDialogOpen(true); }}><Pencil className="w-3 h-3 mr-1" /> Editar</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => remove(camp.id)}><Trash2 className="w-3 h-3 mr-1" /> Eliminar</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CampaignDialog open={dialogOpen} onOpenChange={setDialogOpen} campaign={editing} onSave={save} />
    </div>
  );
}

function CampaignDialog({ open, onOpenChange, campaign, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(campaign || { status: 'draft' });
  }, [campaign, open]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{campaign ? 'Editar' : 'Nueva'} campaña</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nombre</Label><Input value={form.name || ''} onChange={e => update('name', e.target.value)} /></div>
          <div><Label>Objetivo</Label><Textarea value={form.objective || ''} onChange={e => update('objective', e.target.value)} rows={2} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Canal</Label>
              <Select value={form.channel || ''} onValueChange={v => update('channel', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="webchat">Webchat</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status || 'draft'} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Mensaje / CTA</Label><Textarea value={form.message || ''} onChange={e => update('message', e.target.value)} rows={3} /></div>
          <div><Label>Promoción asociada</Label><Input value={form.promotion || ''} onChange={e => update('promotion', e.target.value)} /></div>
          <Button className="w-full" onClick={() => onSave(form)}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}