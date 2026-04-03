import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';
import StatusBadge from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Save, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function LeadDetail() {
  const { id } = useParams();
  const { user } = useOutletContext();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const leads = await base44.entities.Lead.filter({ id });
        if (leads.length > 0) setLead(leads[0]);
        const acts = await base44.entities.LeadActivity.filter({ lead_id: id }, '-created_date', 20);
        setActivities(acts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function updateStatus(status) {
    await base44.entities.Lead.update(lead.id, { status });
    setLead({ ...lead, status });
    toast.success('Estado actualizado');
  }

  async function addNote() {
    if (!note.trim()) return;
    await base44.entities.LeadActivity.create({
      account_id: lead.account_id,
      lead_id: lead.id,
      type: 'note',
      description: note,
      performed_by: user?.email,
    });
    setActivities([{ id: Date.now(), type: 'note', description: note, performed_by: user?.email, created_date: new Date().toISOString() }, ...activities]);
    setNote('');
    toast.success('Nota añadida');
  }

  if (loading) return <LoadingScreen />;
  if (!lead) return <div className="text-center py-20 text-muted-foreground">Lead no encontrado</div>;

  return (
    <div>
      <Link to="/leads" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main */}
        <div className="flex-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{lead.name}</h2>
                  {lead.is_opportunity && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{lead.email}{lead.phone ? ` · ${lead.phone}` : ''}</p>
              </div>
              <StatusBadge status={lead.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><span className="text-xs text-muted-foreground">Score</span><div className="font-semibold">{lead.score || 0}/100</div></div>
              <div><span className="text-xs text-muted-foreground">Urgencia</span><div><StatusBadge status={lead.urgency} /></div></div>
              <div><span className="text-xs text-muted-foreground">Origen</span><div className="capitalize">{lead.source || '—'}</div></div>
              <div><span className="text-xs text-muted-foreground">Creado</span><div>{moment(lead.created_date).format('DD/MM/YYYY')}</div></div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-3">Añadir nota</h3>
            <Textarea placeholder="Escribe una nota..." value={note} onChange={e => setNote(e.target.value)} rows={3} />
            <Button size="sm" className="mt-3 gap-1.5" onClick={addNote}><Save className="w-3.5 h-3.5" /> Guardar nota</Button>
          </div>

          {/* Activity feed */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">Actividad</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin actividad registrada</p>
            ) : (
              <div className="space-y-3">
                {activities.map(act => (
                  <div key={act.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-foreground">{act.description}</p>
                      <p className="text-xs text-muted-foreground">{act.performed_by} · {moment(act.created_date).fromNow()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Cambiar estado</h3>
            <Select value={lead.status} onValueChange={updateStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualified">Cualificado</SelectItem>
                <SelectItem value="proposal">Propuesta</SelectItem>
                <SelectItem value="negotiation">Negociación</SelectItem>
                <SelectItem value="won">Ganado</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {lead.conversation_summary && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-2">Resumen conversación</h3>
              <p className="text-sm text-muted-foreground">{lead.conversation_summary}</p>
            </div>
          )}

          {lead.next_step && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-2">Siguiente paso</h3>
              <p className="text-sm text-muted-foreground">{lead.next_step}</p>
            </div>
          )}
          
          {lead.conversation_id && (
            <Link to={`/conversations/${lead.conversation_id}`}>
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <MessageSquare className="w-4 h-4" /> Ver conversación
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}