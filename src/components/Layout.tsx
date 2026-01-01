import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, FileText, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

const baseNavItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/farmers', icon: Users, label: 'Farmers' },
  { path: '/collection', icon: Plus, label: 'Collection' },
  { path: '/reports', icon: FileText, label: 'Reports' },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

  // Add admin link for super admins
  const navItems = role === 'super_admin'
    ? [...baseNavItems, { path: '/admin', icon: Shield, label: 'Admin' }]
    : baseNavItems;

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md no-print">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <span className="text-xl">🥛</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Milk Center
              </h1>
              <p className="text-xs text-muted-foreground">Collection Manager</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    isActive
                      ? "gradient-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="ml-4 pl-4 border-l border-border flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || profile?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50 no-print">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "animate-pulse-soft")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
