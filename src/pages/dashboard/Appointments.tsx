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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppointments, useCustomers, useServices, useStaff, useSalon } from '@/hooks/useSalon';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Plus,
  Search,
  MoreVertical,
  CheckCircle,
  PlayCircle,
  XCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { AppointmentStatus } from '@/types/database';

interface StaffMember {
  id: string;
  is_active: boolean;
  profile?: { full_name?: string } | null;
}

const AppointmentsPage = () => {
  const { salonId } = useSalon();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(selectedDate);
  const { data: customers = [] } = useCustomers();
  const { data: services = [] } = useServices();
  const { data: staffData = [] } = useStaff();
  
  // Map staff data to expected format
  const staff: StaffMember[] = staffData.map((s: any) => ({
    id: s.id,
    is_active: s.is_active,
    profile: s.profile ? { full_name: s.profile.full_name } : null,
  }));

  const handleCreateAppointment = async (data: any) => {
    if (!salonId) return;
    setIsSubmitting(true);

    try {
      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          salon_id: salonId,
          customer_id: data.customer_id,
          staff_id: data.staff_id || null,
          appointment_date: data.appointment_date,
          start_time: data.start_time + ':00',
          end_time: data.end_time + ':00',
          status: 'pending',
          is_walkin: data.is_walkin,
          notes: data.notes || null,
          total_amount: data.total_amount,
          final_amount: data.total_amount,
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Create appointment services
      const selectedServices = services.filter((s: any) => data.service_ids.includes(s.id));
      const appointmentServices = selectedServices.map((service: any) => ({
        appointment_id: appointment.id,
        service_id: service.id,
        staff_id: data.staff_id || null,
        price: service.discounted_price || service.price,
        duration_minutes: service.duration_minutes,
        status: 'pending' as const,
      }));

      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(appointmentServices);

      if (servicesError) throw servicesError;

      toast({ title: 'Success', description: 'Appointment booked successfully' });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId);

      if (error) throw error;

      // Update appointment services status
      await supabase
        .from('appointment_services')
        .update({ status: newStatus })
        .eq('appointment_id', appointmentId);

      toast({
        title: 'Status Updated',
        description: `Appointment marked as ${newStatus.replace('_', ' ')}`,
      });

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      in_progress: 'bg-primary/10 text-primary border-primary/20',
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
      no_show: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return colors[status] || 'bg-secondary';
  };

  const filteredAppointments = appointments.filter((apt: any) => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch =
      apt.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customer?.phone?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a: any) => a.status === 'pending').length,
    confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
    inProgress: appointments.filter((a: any) => a.status === 'in_progress').length,
    completed: appointments.filter((a: any) => a.status === 'completed').length,
    cancelled: appointments.filter((a: any) => a.status === 'cancelled').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Date Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
            >
              Today
            </Button>
          </div>
          <Button className="btn-gradient" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'bg-secondary' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-500/10' },
            { label: 'Confirmed', value: stats.confirmed, color: 'bg-blue-500/10' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-primary/10' },
            { label: 'Completed', value: stats.completed, color: 'bg-green-500/10' },
            { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-500/10' },
          ].map((stat) => (
            <Card key={stat.label} className={stat.color}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointments for {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No appointments for this date</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Book an appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment: any, index: number) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold">{appointment.start_time?.slice(0, 5)}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.end_time?.slice(0, 5)}
                        </p>
                      </div>
                      <div className="w-px h-12 bg-border" />
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {appointment.customer?.full_name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{appointment.customer?.full_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {appointment.customer?.phone}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {appointment.appointment_services?.map((as: any) => (
                            <Badge key={as.id} variant="outline" className="text-xs">
                              {as.service?.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {appointment.staff && (
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          {appointment.staff.profile?.full_name}
                        </div>
                      )}
                      <div className="text-right mr-2">
                        <p className="font-semibold">₹{appointment.final_amount}</p>
                        {appointment.is_walkin && (
                          <Badge variant="outline" className="text-xs">Walk-in</Badge>
                        )}
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status?.replace('_', ' ')}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {appointment.status === 'pending' && (
                            <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}>
                              <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {appointment.status === 'confirmed' && (
                            <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}>
                              <PlayCircle className="w-4 h-4 mr-2 text-primary" />
                              Start Service
                            </DropdownMenuItem>
                          )}
                          {appointment.status === 'in_progress' && (
                            <DropdownMenuItem onClick={() => updateAppointmentStatus(appointment.id, 'completed')}>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {!['completed', 'cancelled'].includes(appointment.status) && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            customers={customers}
            services={services.filter((s: any) => s.is_active)}
            staff={staff.filter((s: any) => s.is_active)}
            onSubmit={handleCreateAppointment}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AppointmentsPage;
