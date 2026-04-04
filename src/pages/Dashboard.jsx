import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { fetchAccounts } from '@/lib/supabaseClient';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import LoadingScreen from '@/components/LoadingScreen';
import { MessageSquare, Users, Target, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const { user, account } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // TEMP SUPABASE TEST
  const [supabaseTestStatus, setSupabaseTestStatus] = useState('Probando Supabase...');

  useEffect(() => {
    async function loadStats() {
      try {
        const accountId = user?.role === 'super_admin' ? undefined : user?.account_id;
        const filter = accountId ? { account_id: accountId } : {};
        
        const [conversations, leads] = await Promise.all([
          base44.entities.Conversation.filter(filter, '-created_date', 100),
          base44.entities.Lead.filter(filter, '-created_date', 100),
        ]);

        const qualifiedLeads = leads.filter(l => l.status === 'qualified' || l.status === 'proposal' || l.status === 'negotiation');
        const escalated = conversations.filter(c => c.status === 'escalated');
        const channelData = {};
        conversations.forEach(c => {
          const ch = c.channel || 'webchat';
          channelData[ch] = (channelData[ch] || 0) + 1;
        });

        const last7days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toISOString().split('T')[0];
          const dayConvs = conversations.filter(c => c.created_date?.startsWith(dayStr)).length;
          const dayLeads = leads.filter(l => l.created_date?.startsWith(dayStr)).length;
          last7days.push({
            name: date.toLocaleDateString('es', { weekday: 'short' }),
            conversaciones: dayConvs,
            leads: dayLeads,
          });
        }

        setStats({
          totalConversations: conversations.length,
          totalLeads: leads.length,
          qualifiedLeads: qualifiedLeads.length,
          conversionRate: leads.length > 0 ? Math.round((qualifiedLeads.length / leads.length) * 100) : 0,
          escalated: escalated.length,
          channelData: Object.entries(channelData).map(([name, value]) => ({ name, value })),
          dailyActivity: last7days,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  useEffect(() => {
    // TEMP SUPABASE TEST
    async function testSupabaseConnection() {
      setSupabaseTestStatus('Probando Supabase...');
      try {
        const data = await fetchAccounts();

        if (!data?.length) {
          setSupabaseTestStatus('Conexión correcta, pero no hay datos');
          return;
        }

        setSupabaseTestStatus('Conexión correcta');
      } catch (error) {
        setSupabaseTestStatus(`Error de conexión: ${error.message}`);
      }
    }

    testSupabaseConnection();
  }, []);

  if (loading) return <LoadingScreen />;

  const greeting = `Hola, ${user?.full_name?.split(' ')[0] || 'Usuario'}`;

  return (
    <div>
      <PageHeader
        title={greeting}
        description={account ? `Panel de ${account.name}` : 'Panel general'}
      />

      {/* TEMP SUPABASE TEST */}
      <div className="mb-4">
        <div className="inline-block text-xs text-muted-foreground bg-muted/50 border border-border rounded-md px-3 py-2">
          <div className="font-semibold text-[10px] uppercase tracking-wide">TEMP SUPABASE TEST</div>
          <div>{supabaseTestStatus}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Conversaciones" value={stats?.totalConversations || 0} icon={MessageSquare} change="+12% vs. mes anterior" trend="up" />
        <StatCard label="Leads captados" value={stats?.totalLeads || 0} icon={Users} change="+8% vs. mes anterior" trend="up" />
        <StatCard label="Leads cualificados" value={stats?.qualifiedLeads || 0} icon={Target} change={`${stats?.conversionRate}% tasa`} trend="up" />
        <StatCard label="Escalados a humano" value={stats?.escalated || 0} icon={ArrowUpRight} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Actividad últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats?.dailyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="conversaciones" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Por canal</h3>
          {stats?.channelData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.channelData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                  {stats.channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
              Sin datos de canales
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {stats?.channelData?.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground capitalize">{d.name}</span>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
