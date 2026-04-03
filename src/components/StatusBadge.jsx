import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  trial: 'bg-blue-50 text-blue-700 border-blue-200',
  past_due: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  suspended: 'bg-gray-50 text-gray-700 border-gray-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  proposal: 'bg-purple-50 text-purple-700 border-purple-200',
  negotiation: 'bg-amber-50 text-amber-700 border-amber-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  disqualified: 'bg-gray-50 text-gray-700 border-gray-200',
  draft: 'bg-gray-50 text-gray-600 border-gray-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  escalated: 'bg-red-50 text-red-700 border-red-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  archived: 'bg-gray-50 text-gray-600 border-gray-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  basic: 'bg-gray-50 text-gray-700 border-gray-200',
  pro: 'bg-blue-50 text-blue-700 border-blue-200',
  premium: 'bg-purple-50 text-purple-700 border-purple-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
};

const LABELS = {
  active: 'Activo', trial: 'Prueba', past_due: 'Pendiente', cancelled: 'Cancelado',
  suspended: 'Suspendido', new: 'Nuevo', contacted: 'Contactado', qualified: 'Cualificado',
  proposal: 'Propuesta', negotiation: 'Negociación', won: 'Ganado', lost: 'Perdido',
  disqualified: 'Descartado', draft: 'Borrador', paused: 'Pausado', completed: 'Completado',
  waiting: 'En espera', escalated: 'Escalado', resolved: 'Resuelto', archived: 'Archivado',
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
  basic: 'Basic', pro: 'Pro', premium: 'Premium', enterprise: 'Enterprise',
};

export default function StatusBadge({ status, className }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft;
  const label = LABELS[status] || status;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      style,
      className
    )}>
      {label}
    </span>
  );
}