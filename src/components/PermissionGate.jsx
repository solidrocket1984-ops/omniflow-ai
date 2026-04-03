import { hasPermission, hasModuleAccess } from '@/lib/permissions';

export default function PermissionGate({ role, plan, module, action = 'view', children, fallback = null }) {
  if (!role) return fallback;
  
  if (module && !hasModuleAccess(role, plan, module)) {
    return fallback;
  }
  
  if (action && module && !hasPermission(role, module, action)) {
    return fallback;
  }
  
  return children;
}