import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionBadgeProps {
  session: 'morning' | 'evening';
  size?: 'sm' | 'md';
}

export const SessionBadge = ({ session, size = 'sm' }: SessionBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === 'sm' && "px-2.5 py-1 text-xs",
        size === 'md' && "px-3 py-1.5 text-sm",
        session === 'morning'
          ? "bg-morning/15 text-morning"
          : "bg-evening/15 text-evening"
      )}
    >
      {session === 'morning' ? (
        <Sun className={cn(size === 'sm' ? "w-3 h-3" : "w-4 h-4")} />
      ) : (
        <Moon className={cn(size === 'sm' ? "w-3 h-3" : "w-4 h-4")} />
      )}
      {session === 'morning' ? 'Morning' : 'Evening'}
    </span>
  );
};
