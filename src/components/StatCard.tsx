import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'morning' | 'evening' | 'gold';
}

export const StatCard = ({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-elevated animate-fade-in",
        variant === 'default' && "bg-card border border-border",
        variant === 'morning' && "gradient-morning border border-morning/20",
        variant === 'evening' && "gradient-evening border border-evening/20",
        variant === 'gold' && "bg-gradient-to-br from-sunrise/10 to-sunset/10 border border-sunrise/20"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl",
            variant === 'default' && "bg-primary/10 text-primary",
            variant === 'morning' && "bg-morning/20 text-morning",
            variant === 'evening' && "bg-evening/20 text-evening",
            variant === 'gold' && "bg-sunrise/20 text-sunrise"
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
