import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DairyCenter {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface DairyCenterInput {
  name: string;
  address?: string | null;
  phone?: string | null;
}

export const useDairyCenters = () => {
  return useQuery({
    queryKey: ['dairy-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dairy_centers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as DairyCenter[];
    },
  });
};

export const useCreateDairyCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DairyCenterInput) => {
      const { data, error } = await supabase
        .from('dairy_centers')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dairy-centers'] });
      toast.success('Dairy center created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create dairy center: ${error.message}`);
    },
  });
};

export const useUpdateDairyCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: DairyCenterInput & { id: string }) => {
      const { data, error } = await supabase
        .from('dairy_centers')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dairy-centers'] });
      toast.success('Dairy center updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update dairy center: ${error.message}`);
    },
  });
};

export const useDeleteDairyCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dairy_centers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dairy-centers'] });
      toast.success('Dairy center deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete dairy center: ${error.message}`);
    },
  });
};
