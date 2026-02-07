import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useCustomers, useSalon } from '@/hooks/useSalon';
import { CustomerForm, CustomerFormData } from '@/components/customers/CustomerForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Phone,
  Mail,
  Star,
  IndianRupee,
  Calendar,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const CustomersPage = () => {
  const { salonId } = useSalon();
  const { data: customers = [], isLoading } = useCustomers();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CustomerFormData) => {
    if (!salonId) return;
    setIsSubmitting(true);

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update({
            full_name: data.full_name,
            phone: data.phone,
            email: data.email || null,
            gender: data.gender || null,
            date_of_birth: data.date_of_birth || null,
            address: data.address || null,
            notes: data.notes || null,
          })
          .eq('id', editingCustomer.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Customer updated successfully' });
      } else {
        // Check for duplicate phone
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('salon_id', salonId)
          .eq('phone', data.phone)
          .maybeSingle();

        if (existing) {
          toast({
            title: 'Duplicate Found',
            description: 'A customer with this phone number already exists',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }

        const { error } = await supabase.from('customers').insert({
          salon_id: salonId,
          full_name: data.full_name,
          phone: data.phone,
          email: data.email || null,
          gender: data.gender || null,
          date_of_birth: data.date_of_birth || null,
          address: data.address || null,
          notes: data.notes || null,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Customer added successfully' });
      }

      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDialogOpen(false);
      setEditingCustomer(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save customer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((customer: any) =>
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            className="btn-gradient"
            onClick={() => {
              setEditingCustomer(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No customers found</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Add your first customer
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Loyalty Points</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer: any, index: number) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {customer.full_name?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.full_name}</p>
                            {customer.gender && (
                              <p className="text-xs text-muted-foreground capitalize">{customer.gender}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          {customer.total_visits || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium">
                          <IndianRupee className="w-3 h-3 text-muted-foreground" />
                          {(customer.total_spent || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{customer.loyalty_points || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.last_visit_date ? (
                          <span className="text-sm">
                            {format(new Date(customer.last_visit_date), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingCustomer(customer)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCustomer(customer);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
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
      </div>

      {/* Customer Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            initialData={editingCustomer}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingCustomer(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {viewingCustomer.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewingCustomer.full_name}</h3>
                  <p className="text-muted-foreground">{viewingCustomer.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{viewingCustomer.total_visits || 0}</p>
                  <p className="text-xs text-muted-foreground">Visits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">₹{(viewingCustomer.total_spent || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{viewingCustomer.loyalty_points || 0}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {viewingCustomer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{viewingCustomer.email}</span>
                  </div>
                )}
                {viewingCustomer.gender && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{viewingCustomer.gender}</span>
                  </div>
                )}
                {viewingCustomer.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(new Date(viewingCustomer.date_of_birth), 'MMMM d, yyyy')}</span>
                  </div>
                )}
                {viewingCustomer.address && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Address</p>
                    <p>{viewingCustomer.address}</p>
                  </div>
                )}
                {viewingCustomer.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Notes</p>
                    <p>{viewingCustomer.notes}</p>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setViewingCustomer(null);
                  setEditingCustomer(viewingCustomer);
                  setIsDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CustomersPage;
