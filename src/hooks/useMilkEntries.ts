import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export interface MilkEntry {
  id: string;
  dairy_center_id: string;
  farmer_id: string;
  date: string;
  session: 'morning' | 'evening';
  fat_percentage: number;
  quantity: number;
  rate: number;
  amount: number;
  created_at: string;
  farmer?: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface MilkEntryInput {
  farmer_id: string;
  session: 'morning' | 'evening';
  fat_percentage: number;
  quantity: number;
  rate: number;
  amount: number;
  date?: string;
}

export const calculateRate = (fatPercentage: number): number => {
  const baseFat = 3.5;
  const baseRate = 30;
  const rateIncrease = 5;
  const fatDiff = (fatPercentage - baseFat) / 0.5;
  return Math.round((baseRate + (fatDiff * rateIncrease)) * 100) / 100;
};

export const useTodayEntries = () => {
  const { dairyCenterId } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['milk-entries', 'today', dairyCenterId, today],
    queryFn: async () => {
      if (!dairyCenterId) return [];
      
      const { data, error } = await supabase
        .from('milk_entries')
        .select(`
          *,
          farmer:farmers(id, name, phone)
        `)
        .eq('dairy_center_id', dairyCenterId)
        .eq('date', today)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MilkEntry[];
    },
    enabled: !!dairyCenterId
  });
};

export const useMonthEntries = (month: number, year: number) => {
  const { dairyCenterId } = useAuth();
  
  const startDate = format(new Date(year, month, 1), 'yyyy-MM-dd');
  const endDate = format(new Date(year, month + 1, 0), 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['milk-entries', 'month', dairyCenterId, month, year],
    queryFn: async () => {
      if (!dairyCenterId) return [];
      
      const { data, error } = await supabase
        .from('milk_entries')
        .select(`
          *,
          farmer:farmers(id, name, phone)
        `)
        .eq('dairy_center_id', dairyCenterId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as MilkEntry[];
    },
    enabled: !!dairyCenterId
  });
};

export const useCreateMilkEntry = () => {
  const queryClient = useQueryClient();
  const { dairyCenterId } = useAuth();
  
  return useMutation({
    mutationFn: async (input: MilkEntryInput) => {
      if (!dairyCenterId) throw new Error('No dairy center assigned');
      
      const { data, error } = await supabase
        .from('milk_entries')
        .insert({
          dairy_center_id: dairyCenterId,
          farmer_id: input.farmer_id,
          date: input.date || format(new Date(), 'yyyy-MM-dd'),
          session: input.session,
          fat_percentage: input.fat_percentage,
          quantity: input.quantity,
          rate: input.rate,
          amount: input.amount
        })
        .select(`
          *,
          farmer:farmers(id, name, phone)
        `)
        .single();
      
      if (error) throw error;
      return data as MilkEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milk-entries'] });
      toast.success('Collection recorded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to record collection: ${error.message}`);
    }
  });
};
