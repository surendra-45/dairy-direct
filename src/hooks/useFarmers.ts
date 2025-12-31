import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Farmer {
  id: string;
  dairy_center_id: string;
  name: string;
  phone: string | null;
  village: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerInput {
  name: string;
  phone?: string;
  village?: string;
}

export const useFarmers = () => {
  const { dairyCenterId } = useAuth();
  
  return useQuery({
    queryKey: ['farmers', dairyCenterId],
    queryFn: async () => {
      if (!dairyCenterId) return [];
      
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('dairy_center_id', dairyCenterId)
        .order('name');
      
      if (error) throw error;
      return data as Farmer[];
    },
    enabled: !!dairyCenterId
  });
};

export const useCreateFarmer = () => {
  const queryClient = useQueryClient();
  const { dairyCenterId } = useAuth();
  
  return useMutation({
    mutationFn: async (input: FarmerInput) => {
      if (!dairyCenterId) throw new Error('No dairy center assigned');
      
      const { data, error } = await supabase
        .from('farmers')
        .insert({
          dairy_center_id: dairyCenterId,
          name: input.name,
          phone: input.phone || null,
          village: input.village || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      toast.success('Farmer added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add farmer: ${error.message}`);
    }
  });
};

export const useUpdateFarmer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: FarmerInput & { id: string }) => {
      const { data, error } = await supabase
        .from('farmers')
        .update({
          name: input.name,
          phone: input.phone || null,
          village: input.village || null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      toast.success('Farmer updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update farmer: ${error.message}`);
    }
  });
};

export const useDeleteFarmer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      toast.success('Farmer deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete farmer: ${error.message}`);
    }
  });
};
