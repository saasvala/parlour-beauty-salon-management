import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { usePackages, useServices, useSalon } from '@/hooks/useSalon';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  IndianRupee,
  Calendar,
  Loader2,
  Tag,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';

const PackagesPage = () => {
  const { salonId } = useSalon();
  const { data: packages = [], isLoading } = usePackages();
  const { data: services = [] } = useServices();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    original_price: '',
    discounted_price: '',
    validity_days: '30',
    max_uses: '10',
    is_active: true,
    selectedServices: [] as string[],
  });

  const resetForm = () => {
    setForm({
      name: '', description: '', original_price: '', discounted_price: '',
      validity_days: '30', max_uses: '10', is_active: true, selectedServices: [],
    });
  };

  const openEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      original_price: pkg.original_price?.toString() || '',
      discounted_price: pkg.discounted_price?.toString() || '',
      validity_days: pkg.validity_days?.toString() || '30',
      max_uses: pkg.max_uses?.toString() || '10',
      is_active: pkg.is_active,
      selectedServices: pkg.package_services?.map((ps: any) => ps.service_id) || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId || !form.name || !form.discounted_price) return;
    setIsSubmitting(true);

    try {
      const packageData = {
        salon_id: salonId,
        name: form.name,
        description: form.description || null,
        original_price: parseFloat(form.original_price) || 0,
        discounted_price: parseFloat(form.discounted_price),
        validity_days: parseInt(form.validity_days) || 30,
        max_uses: parseInt(form.max_uses) || 10,
        is_active: form.is_active,
      };

      let packageId: string;

      if (editingPackage) {
        const { error } = await supabase.from('packages').update(packageData).eq('id', editingPackage.id);
        if (error) throw error;
        packageId = editingPackage.id;

        // Remove old services
        await supabase.from('package_services').delete().eq('package_id', packageId);
      } else {
        const { data, error } = await supabase.from('packages').insert(packageData).select().single();
        if (error) throw error;
        packageId = data.id;
      }

      // Insert selected services
      if (form.selectedServices.length > 0) {
        const packageServices = form.selectedServices.map(serviceId => ({
          package_id: packageId,
          service_id: serviceId,
        }));
        await supabase.from('package_services').insert(packageServices);
      }

      toast({ title: 'Success', description: editingPackage ? 'Package updated' : 'Package created' });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setIsDialogOpen(false);
      setEditingPackage(null);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('package_services').delete().eq('package_id', deleteId);
      const { error } = await supabase.from('packages').delete().eq('id', deleteId);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Package deleted' });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = packages.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search packages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Button className="btn-gradient" onClick={() => { resetForm(); setEditingPackage(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Package
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No packages found</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Create your first package</Button>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pkg: any, i: number) => (
              <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.description && <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>}
                    </div>
                    <Badge variant={pkg.is_active ? 'default' : 'secondary'}>{pkg.is_active ? 'Active' : 'Inactive'}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xl font-bold text-primary">₹{pkg.discounted_price}</span>
                      {pkg.original_price > pkg.discounted_price && (
                        <span className="text-sm text-muted-foreground line-through">₹{pkg.original_price}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{pkg.validity_days} days</div>
                      <div className="flex items-center gap-1"><Tag className="w-3 h-3" />{pkg.max_uses} uses</div>
                    </div>
                    {pkg.package_services?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pkg.package_services.map((ps: any) => (
                          <Badge key={ps.id} variant="outline" className="text-xs">{ps.service?.name}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(pkg)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteId(pkg.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={() => { setIsDialogOpen(false); setEditingPackage(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Edit Package' : 'Create Package'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Package Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Bridal Package" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Price (₹)</Label>
                <Input type="number" min="0" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Package Price (₹) *</Label>
                <Input type="number" min="0" value={form.discounted_price} onChange={(e) => setForm({ ...form, discounted_price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Validity (days)</Label>
                <Input type="number" min="1" value={form.validity_days} onChange={(e) => setForm({ ...form, validity_days: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Max Uses</Label>
                <Input type="number" min="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
              </div>
            </div>
            {services.length > 0 && (
              <div className="space-y-2">
                <Label>Included Services</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-3 border rounded-lg">
                  {services.filter((s: any) => s.is_active).map((service: any) => (
                    <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={form.selectedServices.includes(service.id)}
                        onCheckedChange={(checked) => {
                          setForm({
                            ...form,
                            selectedServices: checked
                              ? [...form.selectedServices, service.id]
                              : form.selectedServices.filter(id => id !== service.id),
                          });
                        }}
                      />
                      <span className="text-sm">{service.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">₹{service.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingPackage(null); }}>Cancel</Button>
              <Button type="submit" className="btn-gradient" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingPackage ? 'Update' : 'Create'} Package
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the package.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PackagesPage;
