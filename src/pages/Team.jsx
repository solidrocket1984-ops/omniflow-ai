import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserCog, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { ROLES } from '@/lib/permissions';

export default function Team() {
  const { user, account } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const users = await base44.entities.User.list('-created_date', 50);
        const accountMembers = users.filter(u => u.account_id === user?.account_id);
        setMembers(accountMembers);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title="Equipo"
        description="Gestiona los usuarios de tu cuenta"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4" /> Invitar usuario
          </Button>
        }
      />

      {members.length === 0 ? (
        <EmptyState icon={UserCog} title="Sin miembros" description="Invita a tu equipo para colaborar" />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Usuario</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Rol</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Estado</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{member.full_name || member.email}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs capitalize">{ROLES[member.role]?.label || member.role}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusBadge status={member.is_active !== false ? 'active' : 'suspended'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} accountId={user?.account_id} />
    </div>
  );
}

function InviteDialog({ open, onOpenChange, accountId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('agent_user');
  const [sending, setSending] = useState(false);

  async function invite() {
    if (!email) return;
    setSending(true);
    try {
      await base44.users.inviteUser(email, role);
      toast.success(`Invitación enviada a ${email}`);
      setEmail('');
      onOpenChange(false);
    } catch (e) {
      toast.error('Error al invitar usuario');
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Invitar al equipo</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com" /></div>
          <div>
            <Label>Rol</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="account_admin">Admin de Cuenta</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="agent_user">Agente</SelectItem>
                <SelectItem value="readonly_client">Solo lectura</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={invite} disabled={sending}>{sending ? 'Enviando...' : 'Enviar invitación'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}