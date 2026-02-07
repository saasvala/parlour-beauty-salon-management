import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useServices, useServiceCategories, useSalon } from '@/hooks/useSalon';
import { ServiceForm, ServiceFormData } from '@/components/services/ServiceForm';
import { CategoryForm, CategoryFormData } from '@/components/services/CategoryForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Scissors,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Tag,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ServicesPage = () => {
  const { salonId } = useSalon();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: categories = [], isLoading: categoriesLoading } = useServiceCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'service' | 'category'; id: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServiceSubmit = async (data: ServiceFormData) => {
    if (!salonId) return;
    setIsSubmitting(true);

    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update({
            name: data.name,
            description: data.description || null,
            category_id: data.category_id || null,
            duration_minutes: data.duration_minutes,
            price: data.price,
            discounted_price: data.discounted_price || null,
            is_active: data.is_active,
          })
          .eq('id', editingService.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Service updated successfully' });
      } else {
        const { error } = await supabase.from('services').insert({
          salon_id: salonId,
          name: data.name,
          description: data.description || null,
          category_id: data.category_id || null,
          duration_minutes: data.duration_minutes,
          price: data.price,
          discounted_price: data.discounted_price || null,
          is_active: data.is_active,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Service created successfully' });
      }

      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsServiceDialogOpen(false);
      setEditingService(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save service',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    if (!salonId) return;
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('service_categories')
          .update({
            name: data.name,
            description: data.description || null,
            icon: data.icon || null,
            display_order: data.display_order,
            is_active: data.is_active,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        const { error } = await supabase.from('service_categories').insert({
          salon_id: salonId,
          name: data.name,
          description: data.description || null,
          icon: data.icon || null,
          display_order: data.display_order,
          is_active: data.is_active,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Category created successfully' });
      }

      queryClient.invalidateQueries({ queryKey: ['service_categories'] });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save category',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const table = deleteConfirm.type === 'service' ? 'services' : 'service_categories';
      const { error } = await supabase.from(table).delete().eq('id', deleteConfirm.id);

      if (error) throw error;

      toast({ title: 'Deleted', description: `${deleteConfirm.type} deleted successfully` });
      queryClient.invalidateQueries({ queryKey: [deleteConfirm.type === 'service' ? 'services' : 'service_categories'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredServices = services.filter((service: any) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = servicesLoading || categoriesLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Tabs defaultValue="services">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="services" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                className="btn-gradient"
                onClick={() => {
                  setEditingService(null);
                  setIsServiceDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No services found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsServiceDialogOpen(true)}
                    >
                      Add your first service
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service: any, index: number) => (
                        <motion.tr
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {service.category?.name ? (
                              <Badge variant="outline">
                                <Tag className="w-3 h-3 mr-1" />
                                {service.category.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {service.duration_minutes} min
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3 text-muted-foreground" />
                              {service.discounted_price ? (
                                <>
                                  <span className="font-medium">{service.discounted_price}</span>
                                  <span className="text-sm text-muted-foreground line-through ml-1">
                                    {service.price}
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium">{service.price}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={service.is_active ? 'default' : 'secondary'}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingService(service);
                                    setIsServiceDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteConfirm({ type: 'service', id: service.id })}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Button
                className="btn-gradient"
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category: any, index: number) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingCategory(category);
                              setIsCategoryDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteConfirm({ type: 'category', id: category.id })}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Order: {category.display_order}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <ServiceForm
            initialData={editingService}
            categories={categories}
            onSubmit={handleServiceSubmit}
            onCancel={() => {
              setIsServiceDialogOpen(false);
              setEditingService(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleCategorySubmit}
            onCancel={() => {
              setIsCategoryDialogOpen(false);
              setEditingCategory(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteConfirm?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ServicesPage;
