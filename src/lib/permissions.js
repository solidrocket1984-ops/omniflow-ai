// Role hierarchy and permissions configuration

export const ROLES = {
  super_admin: { label: 'Super Admin', level: 100 },
  account_admin: { label: 'Admin de Cuenta', level: 80 },
  manager: { label: 'Manager', level: 60 },
  agent_user: { label: 'Agente', level: 40 },
  readonly_client: { label: 'Cliente (Solo lectura)', level: 20 },
};

export const MODULES = {
  dashboard: { label: 'Dashboard', icon: 'LayoutDashboard' },
  conversations: { label: 'Conversaciones', icon: 'MessageSquare' },
  leads: { label: 'Leads', icon: 'Users' },
  agent_training: { label: 'Entrenamiento IA', icon: 'Bot' },
  knowledge: { label: 'Conocimiento', icon: 'BookOpen' },
  campaigns: { label: 'Campañas', icon: 'Megaphone' },
  channels: { label: 'Canales', icon: 'Radio' },
  automations: { label: 'Automatizaciones', icon: 'Zap' },
  integrations: { label: 'Integraciones', icon: 'Plug' },
  team: { label: 'Equipo', icon: 'UserCog' },
  billing: { label: 'Facturación', icon: 'CreditCard' },
  settings: { label: 'Ajustes', icon: 'Settings' },
};

// Permissions by role for each module
const ROLE_PERMISSIONS = {
  super_admin: {
    dashboard: ['view', 'export'],
    conversations: ['view', 'manage', 'delete'],
    leads: ['view', 'manage', 'delete', 'export'],
    agent_training: ['view', 'manage'],
    knowledge: ['view', 'manage', 'delete'],
    campaigns: ['view', 'manage', 'delete'],
    channels: ['view', 'manage'],
    automations: ['view', 'manage', 'delete'],
    integrations: ['view', 'manage', 'delete'],
    team: ['view', 'manage', 'delete'],
    billing: ['view', 'manage'],
    settings: ['view', 'manage'],
    admin: ['view', 'manage'],
  },
  account_admin: {
    dashboard: ['view', 'export'],
    conversations: ['view', 'manage', 'delete'],
    leads: ['view', 'manage', 'delete', 'export'],
    agent_training: ['view', 'manage'],
    knowledge: ['view', 'manage', 'delete'],
    campaigns: ['view', 'manage', 'delete'],
    channels: ['view', 'manage'],
    automations: ['view', 'manage', 'delete'],
    integrations: ['view', 'manage', 'delete'],
    team: ['view', 'manage', 'delete'],
    billing: ['view', 'manage'],
    settings: ['view', 'manage'],
  },
  manager: {
    dashboard: ['view', 'export'],
    conversations: ['view', 'manage'],
    leads: ['view', 'manage', 'export'],
    agent_training: ['view', 'manage'],
    knowledge: ['view', 'manage'],
    campaigns: ['view', 'manage'],
    channels: ['view'],
    automations: ['view'],
    integrations: ['view'],
    team: ['view'],
    settings: ['view'],
  },
  agent_user: {
    dashboard: ['view'],
    conversations: ['view', 'manage'],
    leads: ['view', 'manage'],
    knowledge: ['view'],
    campaigns: ['view'],
  },
  readonly_client: {
    dashboard: ['view'],
    conversations: ['view'],
    leads: ['view'],
  },
};

// Plan-based feature access
export const PLAN_FEATURES = {
  basic: {
    max_users: 3,
    max_agents: 1,
    max_conversations_monthly: 500,
    modules: ['dashboard', 'conversations', 'leads', 'agent_training', 'knowledge', 'settings'],
    features: ['webchat'],
  },
  pro: {
    max_users: 10,
    max_agents: 3,
    max_conversations_monthly: 2000,
    modules: ['dashboard', 'conversations', 'leads', 'agent_training', 'knowledge', 'campaigns', 'channels', 'team', 'settings'],
    features: ['webchat', 'whatsapp', 'advanced_dashboard', 'export', 'campaigns'],
  },
  premium: {
    max_users: 25,
    max_agents: 10,
    max_conversations_monthly: 10000,
    modules: ['dashboard', 'conversations', 'leads', 'agent_training', 'knowledge', 'campaigns', 'channels', 'automations', 'integrations', 'team', 'billing', 'settings'],
    features: ['webchat', 'whatsapp', 'instagram', 'advanced_dashboard', 'export', 'campaigns', 'automations', 'integrations', 'lead_scoring', 'custom_branding'],
  },
  enterprise: {
    max_users: -1,
    max_agents: -1,
    max_conversations_monthly: -1,
    modules: Object.keys(MODULES),
    features: ['webchat', 'whatsapp', 'instagram', 'advanced_dashboard', 'export', 'campaigns', 'automations', 'integrations', 'lead_scoring', 'custom_branding', 'multi_location', 'api_access', 'priority_support'],
  },
};

export function hasPermission(role, module, action = 'view') {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (!perms[module]) return false;
  return perms[module].includes(action);
}

export function hasModuleAccess(role, plan, module) {
  if (role === 'super_admin') return true;
  const planConfig = PLAN_FEATURES[plan] || PLAN_FEATURES.basic;
  if (!planConfig.modules.includes(module)) return false;
  return hasPermission(role, module, 'view');
}

export function hasPlanFeature(plan, feature) {
  const planConfig = PLAN_FEATURES[plan] || PLAN_FEATURES.basic;
  return planConfig.features.includes(feature);
}

export function getAccessibleModules(role, plan) {
  if (role === 'super_admin') return Object.keys(MODULES);
  const planConfig = PLAN_FEATURES[plan] || PLAN_FEATURES.basic;
  return planConfig.modules.filter(mod => hasPermission(role, mod, 'view'));
}