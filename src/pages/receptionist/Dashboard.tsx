import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Plus,
  Search,
  Phone,
  CheckCircle,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Appointment, Customer, Service, Staff, AppointmentStatus } from '@/types/database';

const ReceptionistDashboard = () => {
  const { salon, staff } = useAuth();
  const { toast } = useToast();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWalkinDialogOpen, setIsWalkinDialogOpen] = useState(false);
  
  // Walk-in form state
  const [walkinForm, setWalkinForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    staffId: '',
  });

  const salonId = salon?.id || staff?.salon_id;

  useEffect(() => {
    if (salonId) {
      fetchData();
    }
  }, [salonId]);

  const fetchData = async () => {
    if (!salonId) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch today's appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(*),
          staff:staff(*, profile:profiles(*))
        `)
        .eq('salon_id', salonId)
        .eq('appointment_date', today)
        .order('start_time', { ascending: true });

      if (appointmentsData) {
        setTodayAppointments(appointmentsData as unknown as Appointment[]);
      }

      // Fetch customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salonId)
        .order('full_name', { ascending: true });

      if (customersData) {
        setCustomers(customersData as Customer[]);
      }

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (servicesData) {
        setServices(servicesData as Service[]);
      }

      // Fetch staff
      const { data: staffData } = await supabase
        .from('staff')
        .select('*, profile:profiles(*)')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (staffData) {
        setStaffList(staffData as unknown as Staff[]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      toast({
        title: 'Status Updated',
        description: `Appointment marked as ${newStatus.replace('_', ' ')}`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive',
      });
    }
  };

  const handleWalkinBooking = async () => {
    if (!salonId || !walkinForm.customerName || !walkinForm.customerPhone || !walkinForm.serviceId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Find or create customer
      let customerId: string;
      const existingCustomer = customers.find(c => c.phone === walkinForm.customerPhone);
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            salon_id: salonId,
            full_name: walkinForm.customerName,
            phone: walkinForm.customerPhone,
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Get service duration
      const service = services.find(s => s.id === walkinForm.serviceId);
      if (!service) throw new Error('Service not found');

      const now = new Date();
      const startTime = format(now, 'HH:mm:ss');
      const endTime = format(new Date(now.getTime() + service.duration_minutes * 60000), 'HH:mm:ss');

      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          salon_id: salonId,
          customer_id: customerId,
          staff_id: walkinForm.staffId || null,
          appointment_date: format(now, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          status: 'confirmed',
          is_walkin: true,
          total_amount: service.price,
          final_amount: service.price,
        });

      if (appointmentError) throw appointmentError;

      toast({
        title: 'Walk-in Booked',
        description: 'Walk-in appointment created successfully',
      });

      setIsWalkinDialogOpen(false);
      setWalkinForm({ customerName: '', customerPhone: '', serviceId: '', staffId: '' });
      fetchData();

    } catch (error) {
      console.error('Error creating walk-in:', error);
      toast({
        title: 'Error',
        description: 'Failed to create walk-in booking',
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
    };
    return colors[status] || 'bg-secondary';
  };

  const stats = {
    total: todayAppointments.length,
    pending: todayAppointments.filter(a => a.status === 'pending').length,
    inProgress: todayAppointments.filter(a => a.status === 'in_progress').length,
    completed: todayAppointments.filter(a => a.status === 'completed').length,
  };

  const filteredAppointments = todayAppointments.filter(appointment => 
    appointment.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.customer?.phone?.includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <PlayCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isWalkinDialogOpen} onOpenChange={setIsWalkinDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Walk-in Booking
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Walk-in Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    placeholder="Enter customer name"
                    value={walkinForm.customerName}
                    onChange={(e) => setWalkinForm(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input
                    placeholder="Enter phone number"
                    value={walkinForm.customerPhone}
                    onChange={(e) => setWalkinForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service *</Label>
                  <Select
                    value={walkinForm.serviceId}
                    onValueChange={(value) => setWalkinForm(prev => ({ ...prev, serviceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - ₹{service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign Staff (Optional)</Label>
                  <Select
                    value={walkinForm.staffId}
                    onValueChange={(value) => setWalkinForm(prev => ({ ...prev, staffId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.profile?.full_name || 'Staff'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleWalkinBooking} className="w-full btn-gradient">
                  Create Walk-in
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments - {format(new Date(), 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No appointments found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
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
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                          </span>
                          {appointment.is_walkin && (
                            <Badge variant="outline" className="text-xs">Walk-in</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex gap-1">
                        {appointment.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                          >
                            <PlayCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {appointment.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;
