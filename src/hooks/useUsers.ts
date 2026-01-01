import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  dairy_center_id: string | null;
  created_at: string;
  updated_at: string;
  role?: 'super_admin' | 'dairy_director' | null;
  dairy_center?: {
    id: string;
    name: string;
  } | null;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          dairy_center:dairy_centers(id, name)
        `)
        .order('email');
      
      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      
      return (profiles || []).map(profile => ({
        ...profile,
        role: rolesMap.get(profile.id) || null,
      })) as UserProfile[];
    },
  });
};

export const useUpdateUserDairyCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, dairyCenterId }: { userId: string; dairyCenterId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ dairy_center_id: dairyCenterId })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User dairy center updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'super_admin' | 'dairy_director' | null }) => {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // If role is specified, insert new role
      if (role) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });
};
