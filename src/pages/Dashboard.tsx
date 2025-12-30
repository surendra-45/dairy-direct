import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Users, Sun, Moon, IndianRupee, Plus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { SessionBadge } from '@/components/SessionBadge';
import { Button } from '@/components/ui/button';
import { getEntries, getFarmers, getEntriesByDate } from '@/lib/storage';
import { MilkEntry } from '@/types/milk';

const Dashboard = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const stats = useMemo(() => {
    const todayEntries = getEntriesByDate(today);
    const farmers = getFarmers();
    const allEntries = getEntries();
    
    const morningEntries = todayEntries.filter(e => e.session === 'morning');
    const eveningEntries = todayEntries.filter(e => e.session === 'evening');
    
    return {
      todayTotal: todayEntries.reduce((sum, e) => sum + e.quantity, 0),
      todayAmount: todayEntries.reduce((sum, e) => sum + e.totalAmount, 0),
      morningTotal: morningEntries.reduce((sum, e) => sum + e.quantity, 0),
      eveningTotal: eveningEntries.reduce((sum, e) => sum + e.quantity, 0),
      farmersCount: farmers.length,
      todayEntries,
    };
  }, [today]);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <section className="gradient-hero rounded-3xl p-6 md:p-8 shadow-soft border border-grass-light/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Welcome, Surendra P! 👋
              </h1>
              <p className="text-muted-foreground">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <Link to="/collection">
              <Button size="lg" className="gap-2 w-full md:w-auto">
                <Plus className="w-5 h-5" />
                New Collection
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Collection"
            value={`${stats.todayTotal.toFixed(1)} L`}
            subtitle="Total liters collected"
            icon={<Droplets className="w-6 h-6" />}
            variant="default"
          />
          <StatCard
            title="Today's Amount"
            value={`₹${stats.todayAmount.toFixed(0)}`}
            subtitle="Total payable"
            icon={<IndianRupee className="w-6 h-6" />}
            variant="gold"
          />
          <StatCard
            title="Morning"
            value={`${stats.morningTotal.toFixed(1)} L`}
            subtitle="Morning collection"
            icon={<Sun className="w-6 h-6" />}
            variant="morning"
          />
          <StatCard
            title="Evening"
            value={`${stats.eveningTotal.toFixed(1)} L`}
            subtitle="Evening collection"
            icon={<Moon className="w-6 h-6" />}
            variant="evening"
          />
        </section>

        {/* Registered Farmers */}
        <section className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg">Registered Farmers</h2>
                <p className="text-sm text-muted-foreground">{stats.farmersCount} farmers registered</p>
              </div>
            </div>
            <Link to="/farmers">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Today's Collections */}
        <section className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Today's Collections</h2>
            <Link to="/collection">
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </Link>
          </div>
          
          {stats.todayEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No collections yet today</p>
              <p className="text-sm mt-1">Start collecting milk to see entries here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.todayEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {entry.farmerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{entry.farmerName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <SessionBadge session={entry.session} />
                        <span className="text-xs text-muted-foreground">
                          Fat: {entry.fatPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{entry.quantity} L</p>
                    <p className="text-sm text-accent font-medium">₹{entry.totalAmount.toFixed(0)}</p>
                  </div>
                </div>
              ))}
              {stats.todayEntries.length > 5 && (
                <Link to="/reports" className="block">
                  <Button variant="ghost" className="w-full">
                    View all {stats.todayEntries.length} entries
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
