import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import LoadingScreen from '@/components/LoadingScreen';
import StatusBadge from '@/components/StatusBadge';
import { Building2, Users, MessageSquare, Target, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user?.role !== 'super_admin') { setLoading(false); return; }
      try {
        const [accs, convs, leads, users] = await Promise.all([
          base44.entities.Account.list('-created_date', 50),
          base44.entities.Conversation.list('-created_date', 100),
          base44.entities.Lead.list('-created_date', 100),
          base44.entities.User.list('-created_date', 100),
        ]);
        setAccounts(accs);
        setStats({
          totalAccounts: accs.length,
          activeAccounts: accs.filter(a => a.subscription_status === 'active').length,
          totalUsers: users.length,
          totalConversations: convs.length,
          totalLeads: leads.length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) return <LoadingScreen />;
  if (user?.role !== 'super_admin') return <div className="text-center py-20 text-muted-foreground">Acceso denegado</div>;

  return (
    <div>
      <PageHeader title="Super Admin" description="Panel de administración global" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Cuentas" value={stats?.totalAccounts || 0} icon={Building2} />
        <StatCard label="Cuentas activas" value={stats?.activeAccounts || 0} icon={Shield} />
        <StatCard label="Usuarios totales" value={stats?.totalUsers || 0} icon={Users} />
        <StatCard label="Conversaciones" value={stats?.totalConversations || 0} icon={MessageSquare} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cuentas recientes</h3>
        <Link to="/admin/accounts">
          <Button variant="outline" size="sm">Ver todas</Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Cuenta</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Plan</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Estado</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Sector</th>
            </tr>
          </thead>
          <tbody>
            {accounts.slice(0, 10).map(acc => (
              <tr key={acc.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link to={`/admin/accounts/${acc.id}`} className="hover:underline">
                    <div className="text-sm font-medium">{acc.name}</div>
                    <div className="text-xs text-muted-foreground">{acc.contact_email || '—'}</div>
                  </Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell"><StatusBadge status={acc.plan} /></td>
                <td className="px-4 py-3"><StatusBadge status={acc.subscription_status} /></td>
                <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground capitalize">{acc.sector || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}