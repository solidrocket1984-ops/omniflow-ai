import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getAccessibleModules, MODULES } from '@/lib/permissions';
import { 
  LayoutDashboard, MessageSquare, Users, Bot, BookOpen, 
  Megaphone, Radio, Zap, Plug, UserCog, CreditCard, Settings,
  Shield, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';

const ICON_MAP = {
  LayoutDashboard, MessageSquare, Users, Bot, BookOpen,
  Megaphone, Radio, Zap, Plug, UserCog, CreditCard, Settings
};

const MODULE_ROUTES = {
  dashboard: '/',
  conversations: '/conversations',
  leads: '/leads',
  agent_training: '/agent-training',
  knowledge: '/knowledge',
  campaigns: '/campaigns',
  channels: '/channels',
  automations: '/automations',
  integrations: '/integrations',
  team: '/team',
  billing: '/billing',
  settings: '/settings',
};

export default function Sidebar({ user, account }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role || 'readonly_client';
  const plan = account?.plan || 'basic';
  const isSuperAdmin = role === 'super_admin';

  const modules = getAccessibleModules(role, plan);

  return (
    <aside className={cn(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0",
      collapsed ? "w-[68px]" : "w-[250px]"
    )}>
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">SaaS Platform</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Account Indicator */}
      {!collapsed && account && (
        <div className="px-4 py-3 border-b border-border">
          <div className="text-xs text-muted-foreground">Cuenta</div>
          <div className="text-sm font-medium text-foreground truncate">{account.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{plan}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {isSuperAdmin && (
          <>
            <SidebarLink
              to="/admin"
              icon={Shield}
              label="Super Admin"
              active={location.pathname.startsWith('/admin')}
              collapsed={collapsed}
            />
            <div className="my-2 mx-2 border-t border-border" />
          </>
        )}
        
        {modules.map(mod => {
          const config = MODULES[mod];
          if (!config) return null;
          const IconComponent = ICON_MAP[config.icon];
          const route = MODULE_ROUTES[mod];
          const isActive = mod === 'dashboard' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(route);

          return (
            <SidebarLink
              key={mod}
              to={route}
              icon={IconComponent}
              label={config.label}
              active={isActive}
              collapsed={collapsed}
            />
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-2 space-y-1">
        {!collapsed && user && (
          <div className="px-2 py-2 mb-1">
            <div className="text-sm font-medium text-foreground truncate">{user.full_name || user.email}</div>
            <div className="text-xs text-muted-foreground capitalize">{role.replace('_', ' ')}</div>
          </div>
        )}
        <button
          onClick={() => base44.auth.logout()}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon: Icon, label, active, collapsed }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        collapsed && "justify-center px-2"
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}