import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Bot, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function ConversationDetail() {
  const { id } = useParams();
  const { user } = useOutletContext();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const convs = await base44.entities.Conversation.filter({ id });
        if (convs.length > 0) setConversation(convs[0]);
        const msgs = await base44.entities.Message.filter({ conversation_id: id }, 'created_date', 100);
        setMessages(msgs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!conversation) return <div className="text-center py-20 text-muted-foreground">Conversación no encontrada</div>;

  return (
    <div>
      <Link to="/conversations" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Messages */}
        <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">{conversation.contact_name || 'Anónimo'}</h2>
              <span className="text-xs text-muted-foreground capitalize">{conversation.channel || 'webchat'}</span>
            </div>
            <StatusBadge status={conversation.status} />
          </div>
          
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin mensajes</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? '' : 'flex-row-reverse')}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'user' ? 'bg-blue-100' : msg.role === 'agent' ? 'bg-primary/10' : 'bg-amber-100'
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-blue-600" /> : 
                     msg.role === 'agent' ? <Bot className="w-4 h-4 text-primary" /> : 
                     <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div className={cn(
                    "max-w-[75%] rounded-xl px-4 py-2.5 text-sm",
                    msg.role === 'user' ? 'bg-blue-50 text-blue-900' : 
                    msg.role === 'agent' ? 'bg-muted text-foreground' : 
                    'bg-amber-50 text-amber-900'
                  )}>
                    {msg.content}
                    <div className="text-[10px] opacity-60 mt-1">{moment(msg.created_date).format('HH:mm')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar details */}
        <div className="w-full lg:w-72 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Detalles</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-muted-foreground text-xs">Contacto</dt><dd className="font-medium">{conversation.contact_name || '—'}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Email</dt><dd>{conversation.contact_email || '—'}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Teléfono</dt><dd>{conversation.contact_phone || '—'}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Intención</dt><dd>{conversation.detected_intent || '—'}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Mensajes</dt><dd>{conversation.messages_count || messages.length}</dd></div>
            </dl>
          </div>
          {conversation.summary && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-2">Resumen</h3>
              <p className="text-sm text-muted-foreground">{conversation.summary}</p>
            </div>
          )}
          {conversation.tags?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {conversation.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-muted rounded text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}