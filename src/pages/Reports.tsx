import { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { FileText, Printer, Calendar, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SessionBadge } from '@/components/SessionBadge';
import { useFarmers } from '@/hooks/useFarmers';
import { useMonthEntries } from '@/hooks/useMilkEntries';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Reports = () => {
  const { dairyCenterId } = useAuth();
  const { data: farmers = [] } = useFarmers();
  const [selectedFarmer, setSelectedFarmer] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: entries = [], isLoading } = useMonthEntries(selectedMonth, selectedYear);
  const printRef = useRef<HTMLDivElement>(null);

  const filteredEntries = useMemo(() => {
    if (selectedFarmer === 'all') return entries;
    return entries.filter(e => e.farmer_id === selectedFarmer);
  }, [entries, selectedFarmer]);

  const statement = useMemo(() => {
    if (selectedFarmer === 'all' || filteredEntries.length === 0) return null;
    
    const farmer = farmers.find(f => f.id === selectedFarmer);
    if (!farmer) return null;

    const totalQuantity = filteredEntries.reduce((sum, e) => sum + Number(e.quantity), 0);
    const totalAmount = filteredEntries.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalFat = filteredEntries.reduce((sum, e) => sum + Number(e.fat_percentage) * Number(e.quantity), 0);
    const averageFat = totalQuantity > 0 ? totalFat / totalQuantity : 0;

    return {
      farmerId: farmer.id,
      farmerName: farmer.name,
      phone: farmer.phone,
      month: months[selectedMonth],
      year: selectedYear,
      entries: filteredEntries,
      totalQuantity,
      totalAmount,
      averageFat,
    };
  }, [filteredEntries, selectedFarmer, farmers, selectedMonth, selectedYear]);

  const summaryStats = useMemo(() => {
    const totalQuantity = filteredEntries.reduce((sum, e) => sum + Number(e.quantity), 0);
    const totalAmount = filteredEntries.reduce((sum, e) => sum + Number(e.amount), 0);
    const uniqueFarmers = new Set(filteredEntries.map(e => e.farmer_id)).size;
    return { totalQuantity, totalAmount, uniqueFarmers };
  }, [filteredEntries]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendStatement = () => {
    if (!statement || !statement.phone) {
      toast.error('No phone number available');
      return;
    }

    const message = `📊 Monthly Milk Statement
    
Dear ${statement.farmerName},

Month: ${statement.month} ${statement.year}

Summary:
• Total Quantity: ${statement.totalQuantity.toFixed(1)} L
• Average Fat: ${statement.averageFat.toFixed(2)}%
• Total Amount: ₹${statement.totalAmount.toFixed(2)}

Thank you for your continued supply!
- Dairy Direct`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${statement.phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Opening WhatsApp to send statement');
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  if (!dairyCenterId) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">No Dairy Center Assigned</h2>
            <p className="text-muted-foreground">
              Please contact the administrator to assign you to a dairy center.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Monthly statements and collection history</p>
          </div>
          <div className="flex gap-2">
            {selectedFarmer !== 'all' && statement && (
              <Button variant="outline" className="gap-2" onClick={handleSendStatement}>
                <Send className="w-4 h-4" />
                Send via WhatsApp
              </Button>
            )}
            <Button variant="gold" className="gap-2" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 no-print">
          {/* Month Navigation */}
          <div className="flex items-center gap-2 bg-card rounded-xl p-2 border border-border">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium min-w-[140px] text-center">
                {months[selectedMonth]} {selectedYear}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Farmer Filter */}
          <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select farmer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Farmers</SelectItem>
              {farmers.map((farmer) => (
                <SelectItem key={farmer.id} value={farmer.id}>
                  {farmer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 no-print">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total Quantity</p>
            <p className="text-2xl font-display font-bold text-foreground">
              {summaryStats.totalQuantity.toFixed(1)} L
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-display font-bold text-accent">
              ₹{summaryStats.totalAmount.toFixed(0)}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Farmers</p>
            <p className="text-2xl font-display font-bold text-foreground">
              {summaryStats.uniqueFarmers}
            </p>
          </div>
        </div>

        {/* Printable Statement */}
        <div ref={printRef} className="bg-card rounded-2xl p-6 shadow-card border border-border">
          {/* Print Header */}
          <div className="print-only hidden border-b-2 border-foreground pb-4 mb-6">
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold">Dairy Direct</h1>
              <p className="text-muted-foreground">Milk Collection Center</p>
            </div>
          </div>

          {/* Statement Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg">
                  {selectedFarmer === 'all' ? 'All Collections' : `Statement: ${statement?.farmerName}`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {months[selectedMonth]} {selectedYear}
                </p>
              </div>
            </div>
            {statement && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{statement.phone || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Entries Table */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Loading entries...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No collections found for this period</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-semibold">Date</th>
                      <th className="text-left py-3 px-2 font-semibold">Session</th>
                      {selectedFarmer === 'all' && (
                        <th className="text-left py-3 px-2 font-semibold">Farmer</th>
                      )}
                      <th className="text-right py-3 px-2 font-semibold">Fat %</th>
                      <th className="text-right py-3 px-2 font-semibold">Qty (L)</th>
                      <th className="text-right py-3 px-2 font-semibold">Rate</th>
                      <th className="text-right py-3 px-2 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-3 px-2">
                          {format(new Date(entry.date), 'dd/MM')}
                        </td>
                        <td className="py-3 px-2">
                          <SessionBadge session={entry.session} />
                        </td>
                        {selectedFarmer === 'all' && (
                          <td className="py-3 px-2">{entry.farmer?.name || 'Unknown'}</td>
                        )}
                        <td className="py-3 px-2 text-right">{entry.fat_percentage}%</td>
                        <td className="py-3 px-2 text-right">{entry.quantity}</td>
                        <td className="py-3 px-2 text-right">₹{entry.rate}</td>
                        <td className="py-3 px-2 text-right font-medium">₹{Number(entry.amount).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-foreground font-semibold">
                      <td colSpan={selectedFarmer === 'all' ? 4 : 3} className="py-3 px-2">
                        Total
                      </td>
                      <td className="py-3 px-2 text-right">
                        {summaryStats.totalQuantity.toFixed(1)} L
                      </td>
                      <td className="py-3 px-2 text-right">-</td>
                      <td className="py-3 px-2 text-right text-accent">
                        ₹{summaryStats.totalAmount.toFixed(0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Statement Summary for Individual Farmer */}
              {statement && (
                <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Total Milk</p>
                    <p className="text-xl font-display font-bold">{statement.totalQuantity.toFixed(1)} L</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Avg. Fat</p>
                    <p className="text-xl font-display font-bold">{statement.averageFat.toFixed(2)}%</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-sunrise/10">
                    <p className="text-sm text-muted-foreground">Total Payable</p>
                    <p className="text-xl font-display font-bold text-accent">₹{statement.totalAmount.toFixed(0)}</p>
                  </div>
                </div>
              )}

              {/* Print Footer */}
              <div className="print-only hidden mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
                <p>Generated on {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
                <p className="mt-1">Dairy Direct Milk Collection Center</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
