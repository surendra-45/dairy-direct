import { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Droplets, Calculator, Send, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SessionBadge } from '@/components/SessionBadge';
import { getFarmers, saveEntry, calculateRate, getEntriesByDate } from '@/lib/storage';
import { Farmer, MilkEntry } from '@/types/milk';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Collection = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [session, setSession] = useState<'morning' | 'evening'>(() => {
    const hour = new Date().getHours();
    return hour < 14 ? 'morning' : 'evening';
  });
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [fatPercentage, setFatPercentage] = useState('');
  const [quantity, setQuantity] = useState('');
  const [todayEntries, setTodayEntries] = useState<MilkEntry[]>([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    setFarmers(getFarmers());
    setTodayEntries(getEntriesByDate(today));
  }, [today]);

  const calculation = useMemo(() => {
    const fat = parseFloat(fatPercentage) || 0;
    const qty = parseFloat(quantity) || 0;
    const rate = calculateRate(fat);
    const total = rate * qty;
    return { rate, total };
  }, [fatPercentage, quantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFarmer || !fatPercentage || !quantity) {
      toast.error('Please fill in all fields');
      return;
    }

    const farmer = farmers.find(f => f.id === selectedFarmer);
    if (!farmer) return;

    const entry: MilkEntry = {
      id: crypto.randomUUID(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      date: today,
      session,
      fatPercentage: parseFloat(fatPercentage),
      quantity: parseFloat(quantity),
      ratePerLiter: calculation.rate,
      totalAmount: calculation.total,
      createdAt: new Date(),
    };

    saveEntry(entry);
    setTodayEntries(getEntriesByDate(today));
    
    // Reset form
    setSelectedFarmer('');
    setFatPercentage('');
    setQuantity('');
    
    toast.success(`Collection recorded for ${farmer.name}!`, {
      description: `${entry.quantity}L @ ₹${entry.ratePerLiter}/L = ₹${entry.totalAmount.toFixed(0)}`,
    });
  };

  const handleSendMessage = (entry: MilkEntry) => {
    const farmer = farmers.find(f => f.id === entry.farmerId);
    if (!farmer) return;

    const message = `🥛 Milk Collection Receipt
    
Dear ${farmer.name},

Date: ${format(new Date(entry.date), 'dd/MM/yyyy')}
Session: ${entry.session === 'morning' ? '🌅 Morning' : '🌙 Evening'}

Fat: ${entry.fatPercentage}%
Quantity: ${entry.quantity} L
Rate: ₹${entry.ratePerLiter}/L
Total: ₹${entry.totalAmount.toFixed(2)}

Thank you for your supply!
- Surendra Milk Center`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${farmer.phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Opening WhatsApp to send message');
  };

  const sessionEntries = todayEntries.filter(e => e.session === session);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Milk Collection</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Session Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setSession('morning')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200",
              session === 'morning'
                ? "border-morning bg-morning/10 shadow-soft"
                : "border-border bg-card hover:border-morning/50"
            )}
          >
            <Sun className={cn("w-6 h-6", session === 'morning' ? "text-morning" : "text-muted-foreground")} />
            <span className={cn("font-semibold", session === 'morning' ? "text-morning" : "text-muted-foreground")}>
              Morning
            </span>
          </button>
          <button
            onClick={() => setSession('evening')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200",
              session === 'evening'
                ? "border-evening bg-evening/10 shadow-soft"
                : "border-border bg-card hover:border-evening/50"
            )}
          >
            <Moon className={cn("w-6 h-6", session === 'evening' ? "text-evening" : "text-muted-foreground")} />
            <span className={cn("font-semibold", session === 'evening' ? "text-evening" : "text-muted-foreground")}>
              Evening
            </span>
          </button>
        </div>

        {/* Collection Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className={cn(
              "p-2 rounded-lg",
              session === 'morning' ? "bg-morning/10" : "bg-evening/10"
            )}>
              <Droplets className={cn(
                "w-5 h-5",
                session === 'morning' ? "text-morning" : "text-evening"
              )} />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">New Entry</h2>
              <SessionBadge session={session} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Farmer</Label>
            <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a farmer..." />
              </SelectTrigger>
              <SelectContent>
                {farmers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No farmers registered yet
                  </div>
                ) : (
                  farmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id}>
                      {farmer.name} - {farmer.village || 'No village'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fat">Fat Percentage (%)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                min="0"
                max="15"
                placeholder="e.g., 4.5"
                value={fatPercentage}
                onChange={(e) => setFatPercentage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Liters)</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 10.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          {/* Live Calculation */}
          {(fatPercentage || quantity) && (
            <div className="p-4 rounded-xl bg-secondary/50 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calculator className="w-4 h-4" />
                Live Calculation
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rate per Liter</p>
                  <p className="text-xl font-display font-bold text-foreground">
                    ₹{calculation.rate.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-display font-bold text-accent">
                    ₹{calculation.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            size="lg" 
            className="w-full gap-2"
            variant={session === 'morning' ? 'morning' : 'evening'}
          >
            <Check className="w-5 h-5" />
            Record Collection
          </Button>
        </form>

        {/* Today's Session Entries */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-lg mb-4">
            Today's {session === 'morning' ? 'Morning' : 'Evening'} Collections
          </h3>
          
          {sessionEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Droplets className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No collections recorded for this session yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {entry.farmerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{entry.farmerName}</p>
                      <p className="text-sm text-muted-foreground">
                        Fat: {entry.fatPercentage}% | {entry.quantity}L @ ₹{entry.ratePerLiter}/L
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-accent">₹{entry.totalAmount.toFixed(0)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSendMessage(entry)}
                      className="text-grass hover:text-grass hover:bg-grass-light"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Collection;
