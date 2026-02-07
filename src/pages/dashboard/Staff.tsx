import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useStaff, useSalon } from '@/hooks/useSalon';
import { StaffForm, StaffFormData } from '@/components/staff/StaffForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  UserCircle,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  Briefcase,
  Percent,
  IndianRupee,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppRole } from '@/types/database';

const StaffPage = () => {
  const { salonId } = useSalon();
  const { data: staffList = [], isLoading } = useStaff();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: StaffFormData) => {
    if (!salonId) return;
    setIsSubmitting(true);

    try {
      if (editingStaff) {
        // Update existing staff
        const { error: staffError } = await supabase
          .from('staff')
          .update({
            designation: data.designation || null,
            employee_code: data.employee_code || null,
            base_salary: data.base_salary,
            commission_percentage: data.commission_percentage,
            is_active: data.is_active,
          })
          .eq('id', editingStaff.id);

        if (staffError) throw staffError;

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: data.full_name,
            phone: data.phone || null,
          })
          .eq('id', editingStaff.user_id);

        if (profileError) throw profileError;

        toast({ title: 'Success', description: 'Staff updated successfully' });
      } else {
        // Create new user account with Supabase Auth
        // Note: In production, you'd use an edge function to create users
        // For now, we'll create the profile and staff record assuming user signs up separately
        
        // Check if email already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .maybeSingle();

        if (existingProfile) {
          // User exists, create staff record
          const { error: staffError } = await supabase.from('staff').insert({
            salon_id: salonId,
            user_id: existingProfile.id,
            designation: data.designation || null,
            employee_code: data.employee_code || null,
            base_salary: data.base_salary,
            commission_percentage: data.commission_percentage,
            is_active: data.is_active,
            joining_date: new Date().toISOString().split('T')[0],
          });

          if (staffError) throw staffError;

          // Add role
          const { error: roleError } = await supabase.from('user_roles').insert({
            user_id: existingProfile.id,
            role: data.role,
          });

          if (roleError && !roleError.message.includes('duplicate')) throw roleError;
        } else {
          toast({
            title: 'User Not Found',
            description: 'Please ask the staff member to sign up first, then add them here.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }

        toast({ title: 'Success', description: 'Staff added successfully' });
      }

      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsDialogOpen(false);
      setEditingStaff(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save staff',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: false })
        .eq('id', deleteConfirm);

      if (error) throw error;

      toast({ title: 'Deactivated', description: 'Staff member deactivated successfully' });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate staff',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredStaff = staffList.filter((staff: any) =>
    staff.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'branch_manager':
        return 'bg-purple-500/10 text-purple-500';
      case 'receptionist':
        return 'bg-blue-500/10 text-blue-500';
      case 'beautician':
        return 'bg-pink-500/10 text-pink-500';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            className="btn-gradient"
            onClick={() => {
              setEditingStaff(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No staff members found</p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Add your first staff member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff: any, index: number) => (
              <motion.div
                key={staff.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={staff.profile?.avatar_url} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {staff.profile?.full_name?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{staff.profile?.full_name || 'Staff'}</h3>
                        {staff.designation && (
                          <p className="text-sm text-muted-foreground">{staff.designation}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingStaff(staff);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteConfirm(staff.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={staff.is_active ? 'default' : 'secondary'}>
                        {staff.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {staff.employee_code && (
                        <Badge variant="outline">{staff.employee_code}</Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      {staff.profile?.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{staff.profile.email}</span>
                        </div>
                      )}
                      {staff.profile?.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{staff.profile.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm">
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{staff.base_salary?.toLocaleString() || 0}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Percent className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{staff.commission_percentage || 0}%</span>
                        <span className="text-muted-foreground">comm</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
          </DialogHeader>
          <StaffForm
            initialData={
              editingStaff
                ? {
                    email: editingStaff.profile?.email || '',
                    full_name: editingStaff.profile?.full_name || '',
                    phone: editingStaff.profile?.phone || '',
                    role: 'beautician',
                    designation: editingStaff.designation || '',
                    employee_code: editingStaff.employee_code || '',
                    base_salary: editingStaff.base_salary || 0,
                    commission_percentage: editingStaff.commission_percentage || 0,
                    is_active: editingStaff.is_active,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingStaff(null);
            }}
            isLoading={isSubmitting}
            isEdit={!!editingStaff}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the staff member. They won't be able to access the system or take appointments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default StaffPage;
