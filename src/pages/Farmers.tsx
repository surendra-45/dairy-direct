import { useState } from 'react';
import { Plus, Phone, MapPin, Trash2, Edit2, Search, Users } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/alert-dialog';
import { useFarmers, useCreateFarmer, useUpdateFarmer, useDeleteFarmer, Farmer } from '@/hooks/useFarmers';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Farmers = () => {
  const { dairyCenterId } = useAuth();
  const { data: farmers = [], isLoading } = useFarmers();
  const createFarmer = useCreateFarmer();
  const updateFarmer = useUpdateFarmer();
  const deleteFarmer = useDeleteFarmer();
  
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
  });

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.phone && f.phone.includes(search)) ||
      (f.village && f.village.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter a name');
      return;
    }

    if (editingFarmer) {
      await updateFarmer.mutateAsync({
        id: editingFarmer.id,
        ...formData,
      });
    } else {
      await createFarmer.mutateAsync(formData);
    }
    
    setFormData({ name: '', phone: '', village: '' });
    setEditingFarmer(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      name: farmer.name,
      phone: farmer.phone || '',
      village: farmer.village || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFarmer.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFarmer(null);
    setFormData({ name: '', phone: '', village: '' });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Farmers</h1>
            <p className="text-muted-foreground">Manage registered farmers</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Farmer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingFarmer ? 'Edit Farmer' : 'Register New Farmer'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter farmer's name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input
                    id="village"
                    placeholder="Enter village name"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createFarmer.isPending || updateFarmer.isPending}
                  >
                    {createFarmer.isPending || updateFarmer.isPending 
                      ? 'Saving...' 
                      : (editingFarmer ? 'Update' : 'Register')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Farmers List */}
        {isLoading ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading farmers...</p>
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-display font-semibold text-lg mb-2">No Farmers Found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Try a different search term' : 'Start by registering your first farmer'}
            </p>
            {!search && (
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add First Farmer
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFarmers.map((farmer, index) => (
              <div
                key={farmer.id}
                className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
                    {farmer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(farmer)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(farmer.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {farmer.name}
                </h3>
                <div className="space-y-1.5">
                  {farmer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {farmer.phone}
                    </div>
                  )}
                  {farmer.village && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {farmer.village}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Farmer?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the farmer from your records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-destructive text-destructive-foreground"
                disabled={deleteFarmer.isPending}
              >
                {deleteFarmer.isPending ? 'Removing...' : 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Farmers;
