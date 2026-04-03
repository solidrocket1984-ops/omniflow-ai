import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Zap, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Automations() {
  const { user } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const accountId = user?.account_id;

  useEffect(() => {
    async function load() {
      if (!accountId) { setLoading(false); return; }
      try {
        const data = await base44.entities.AutomationRule.filter({ account_id: accountId }, '-created_date', 50);
        setRules(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [accountId]);

  async function toggleRule(rule) {
    const updated = !rule.is_active;
    await base44.entities.AutomationRule.update(rule.id, { is_active: updated });
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: updated } : r));
    toast.success(updated ? 'Automatización activada' : 'Automatización desactivada');
  }

  async function save(data) {
    if (data.id) {
      const { id, created_date, updated_date, created_by, ...rest } = data;
      await base44.entities.AutomationRule.update(id, rest);
      setRules(prev => prev.map(r => r.id === id ? { ...r, ...rest } : r));
    } else {
      const created = await base44.entities.AutomationRule.create({ ...data, account_id: accountId });
      setRules(prev => [created, ...prev]);
    }
    setDialogOpen(false);
    setEditing(null);
    toast.success('Automatización guardada');
  }

  async function remove(id) {
    await base44.entities.AutomationRule.delete(id);
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success('Automatización eliminada');
  }

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title="Automatizaciones"
        description="Configura reglas automáticas para tu negocio"
        actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="w-4 h-4" /> Nueva regla</Button>}
      />

      {rules.length === 0 ? (
        <EmptyState icon={Zap} title="Sin automatizaciones" description="Crea reglas para automatizar notificaciones, asignaciones y más" />
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Switch checked={rule.is_active} onCheckedChange={() => toggleRule(rule)} />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{rule.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{(rule.trigger_type || '').replace('_', ' ')}</span>
                    {' → '}
                    <span className="capitalize">{(rule.action_type || '').replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(rule); setDialogOpen(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(rule.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AutomationDialog open={dialogOpen} onOpenChange={setDialogOpen} rule={editing} onSave={save} />
    </div>
  );
}

function AutomationDialog({ open, onOpenChange, rule, onSave }) {
  const [form, setForm] = useState({});
  useEffect(() => { setForm(rule || { is_active: true }); }, [rule, open]);
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{rule ? 'Editar' : 'Nueva'} automatización</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nombre</Label><Input value={form.name || ''} onChange={e => update('name', e.target.value)} /></div>
          <div>
            <Label>Disparador</Label>
            <Select value={form.trigger_type || ''} onValueChange={v => update('trigger_type', v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new_lead">Nuevo lead</SelectItem>
                <SelectItem value="lead_score_change">Cambio de score</SelectItem>
                <SelectItem value="lead_status_change">Cambio de estado</SelectItem>
                <SelectItem value="conversation_escalated">Conversación escalada</SelectItem>
                <SelectItem value="new_conversation">Nueva conversación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Acción</Label>
            <Select value={form.action_type || ''} onValueChange={v => update('action_type', v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="send_notification">Enviar notificación</SelectItem>
                <SelectItem value="send_email">Enviar email</SelectItem>
                <SelectItem value="assign_lead">Asignar lead</SelectItem>
                <SelectItem value="change_status">Cambiar estado</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={() => onSave(form)}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}