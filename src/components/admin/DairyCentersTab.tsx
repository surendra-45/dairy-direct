import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDairyCenters,
  useCreateDairyCenter,
  useUpdateDairyCenter,
  useDeleteDairyCenter,
  DairyCenter,
  DairyCenterInput,
} from '@/hooks/useDairyCenters';

export const DairyCentersTab = () => {
  const { data: dairyCenters, isLoading } = useDairyCenters();
  const createMutation = useCreateDairyCenter();
  const updateMutation = useUpdateDairyCenter();
  const deleteMutation = useDeleteDairyCenter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<DairyCenter | null>(null);
  const [formData, setFormData] = useState<DairyCenterInput>({
    name: '',
    address: '',
    phone: '',
  });

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '' });
    setEditingCenter(null);
  };

  const handleCreate = async () => {
    await createMutation.mutateAsync(formData);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingCenter) return;
    await updateMutation.mutateAsync({ id: editingCenter.id, ...formData });
    setEditingCenter(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const openEditDialog = (center: DairyCenter) => {
    setFormData({
      name: center.name,
      address: center.address || '',
      phone: center.phone || '',
    });
    setEditingCenter(center);
  };

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Dairy Centers
        </CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Center
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Dairy Center</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter dairy center name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!formData.name || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Dairy Center'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {dairyCenters?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No dairy centers found. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dairyCenters?.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium">{center.name}</TableCell>
                  <TableCell>{center.address || '-'}</TableCell>
                  <TableCell>{center.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dialog
                        open={editingCenter?.id === center.id}
                        onOpenChange={(open) => !open && setEditingCenter(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(center)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Dairy Center</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Name *</Label>
                              <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Enter dairy center name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-address">Address</Label>
                              <Input
                                id="edit-address"
                                value={formData.address || ''}
                                onChange={(e) =>
                                  setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="Enter address"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-phone">Phone</Label>
                              <Input
                                id="edit-phone"
                                value={formData.phone || ''}
                                onChange={(e) =>
                                  setFormData({ ...formData, phone: e.target.value })
                                }
                                placeholder="Enter phone number"
                              />
                            </div>
                            <Button
                              onClick={handleUpdate}
                              disabled={!formData.name || updateMutation.isPending}
                              className="w-full"
                            >
                              {updateMutation.isPending ? 'Updating...' : 'Update Dairy Center'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Dairy Center?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{center.name}" and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(center.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
