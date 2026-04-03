import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Search, Filter } from 'lucide-react';
import moment from 'moment';

export default function Conversations() {
  const { user } = useOutletContext();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const filter = user?.account_id ? { account_id: user.account_id } : {};
        const data = await base44.entities.Conversation.filter(filter, '-created_date', 50);
        setConversations(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <LoadingScreen />;

  const filtered = conversations.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.contact_name || '').toLowerCase().includes(q) ||
             (c.summary || '').toLowerCase().includes(q) ||
             (c.detected_intent || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <PageHeader title="Conversaciones" description="Todas las conversaciones de tu agente IA" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por contacto, resumen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activa</SelectItem>
            <SelectItem value="waiting">En espera</SelectItem>
            <SelectItem value="escalated">Escalada</SelectItem>
            <SelectItem value="resolved">Resuelta</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="webchat">Webchat</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sin conversaciones"
          description="Las conversaciones aparecerán aquí cuando tu agente empiece a interactuar"
        />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Contacto</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Canal</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Intención</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(conv => (
                <tr key={conv.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/conversations/${conv.id}`} className="hover:underline">
                      <div className="text-sm font-medium text-foreground">{conv.contact_name || 'Anónimo'}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{conv.summary || 'Sin resumen'}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground capitalize">{conv.channel || 'webchat'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={conv.status} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">{conv.detected_intent || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">{moment(conv.created_date).fromNow()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}