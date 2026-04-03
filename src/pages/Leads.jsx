import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users, Search, Plus, Star } from 'lucide-react';
import moment from 'moment';

export default function Leads() {
  const { user } = useOutletContext();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const filter = user?.account_id ? { account_id: user.account_id } : {};
        const data = await base44.entities.Lead.filter(filter, '-created_date', 50);
        setLeads(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <LoadingScreen />;

  const filtered = leads.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (l.name || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Gestiona y da seguimiento a tus leads"
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Nuevo lead
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Nuevo</SelectItem>
            <SelectItem value="contacted">Contactado</SelectItem>
            <SelectItem value="qualified">Cualificado</SelectItem>
            <SelectItem value="proposal">Propuesta</SelectItem>
            <SelectItem value="won">Ganado</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Sin leads" description="Los leads aparecerán aquí cuando sean capturados" />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Lead</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Origen</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Score</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Urgencia</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/leads/${lead.id}`} className="hover:underline">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-foreground">{lead.name}</div>
                        {lead.is_opportunity && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{lead.email || lead.phone || ''}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground capitalize">{lead.source || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(lead.score || 0, 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{lead.score || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell"><StatusBadge status={lead.urgency} /></td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">{moment(lead.created_date).fromNow()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}