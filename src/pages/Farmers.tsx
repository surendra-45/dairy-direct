import { useState, useEffect } from 'react';
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
import { getFarmers, saveFarmer, deleteFarmer, updateFarmer } from '@/lib/storage';
import { Farmer } from '@/types/milk';
import { toast } from 'sonner';

const Farmers = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
  });

  useEffect(() => {
    setFarmers(getFarmers());
  }, []);

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search) ||
      f.village.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingFarmer) {
      const updated: Farmer = {
        ...editingFarmer,
        ...formData,
      };
      updateFarmer(updated);
      toast.success('Farmer updated successfully!');
    } else {
      const newFarmer: Farmer = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date(),
      };
      saveFarmer(newFarmer);
      toast.success('Farmer registered successfully!');
    }
    
    setFarmers(getFarmers());
    setFormData({ name: '', phone: '', village: '' });
    setEditingFarmer(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      name: farmer.name,
      phone: farmer.phone,
      village: farmer.village,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteFarmer(deleteId);
      setFarmers(getFarmers());
      toast.success('Farmer removed successfully');
      setDeleteId(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFarmer(null);
    setFormData({ name: '', phone: '', village: '' });
  };

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
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
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
                  <Button type="submit" className="flex-1">
                    {editingFarmer ? 'Update' : 'Register'}
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
        {filteredFarmers.length === 0 ? (
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {farmer.phone}
                  </div>
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
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Farmers;
