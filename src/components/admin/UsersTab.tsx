import { useState } from 'react';
import { Users, Shield, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers, useUpdateUserDairyCenter, useUpdateUserRole } from '@/hooks/useUsers';
import { useDairyCenters } from '@/hooks/useDairyCenters';

export const UsersTab = () => {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: dairyCenters, isLoading: centersLoading } = useDairyCenters();
  const updateDairyCenterMutation = useUpdateUserDairyCenter();
  const updateRoleMutation = useUpdateUserRole();

  const handleRoleChange = async (userId: string, role: string) => {
    const newRole = role === 'none' ? null : (role as 'super_admin' | 'dairy_director');
    await updateRoleMutation.mutateAsync({ userId, role: newRole });
  };

  const handleDairyCenterChange = async (userId: string, dairyCenterId: string) => {
    const newCenterId = dairyCenterId === 'none' ? null : dairyCenterId;
    await updateDairyCenterMutation.mutateAsync({ userId, dairyCenterId: newCenterId });
  };

  const isLoading = usersLoading || centersLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dairy Center</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || 'No name'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role || 'none'}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No role</span>
                        </SelectItem>
                        <SelectItem value="super_admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-primary" />
                            Super Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="dairy_director">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-accent" />
                            Dairy Director
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.dairy_center_id || 'none'}
                      onValueChange={(value) => handleDairyCenterChange(user.id, value)}
                      disabled={updateDairyCenterMutation.isPending || user.role === 'super_admin'}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select dairy center" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No center</span>
                        </SelectItem>
                        {dairyCenters?.map((center) => (
                          <SelectItem key={center.id} value={center.id}>
                            {center.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
