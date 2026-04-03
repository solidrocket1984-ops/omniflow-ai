import { cn } from '@/lib/utils';

export default function StatCard({ label, value, change, icon: Icon, trend, className }) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-5 transition-shadow hover:shadow-md",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
      {change !== undefined && (
        <div className={cn(
          "text-xs font-medium mt-1",
          trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
        )}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
        </div>
      )}
    </div>
  );
}