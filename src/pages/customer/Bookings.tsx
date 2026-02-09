import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isPast, isToday, isFuture } from 'date-fns';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number;
  final_amount: number;
  notes?: string;
  salon?: { name: string; address?: string; phone?: string };
  staff?: { profile?: { full_name?: string } };
  appointment_services?: Array<{ service?: { name: string }; price: number }>;
}

const CustomerBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customerRecord, setCustomerRecord] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerData) {
        setCustomerRecord(customerData);

        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            salon:salons(name, address, phone),
            staff:staff(*, profile:profiles(full_name)),
            appointment_services(*, service:services(name))
          `)
          .eq('customer_id', customerData.id)
          .order('appointment_date', { ascending: false })
          .order('start_time', { ascending: true });

        if (appointmentsData) {
          setAppointments(appointmentsData as any);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_reason: 'Cancelled by customer',
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      toast({
        title: 'Appointment Cancelled',
        description: 'Your appointment has been cancelled successfully',
      });

      fetchData();
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel appointment',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
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

  const upcomingAppointments = appointments.filter(
    (apt) =>
      isFuture(new Date(apt.appointment_date)) ||
      (isToday(new Date(apt.appointment_date)) && !['cancelled', 'completed'].includes(apt.status))
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      isPast(new Date(apt.appointment_date)) ||
      ['cancelled', 'completed'].includes(apt.status)
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const canCancel =
      ['pending', 'confirmed'].includes(appointment.status) &&
      (isFuture(new Date(appointment.appointment_date)) ||
        isToday(new Date(appointment.appointment_date)));

    const staffProfile: any = appointment.staff?.profile;
    const salonInfo: any = appointment.salon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-bold text-lg">
              {format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          {salonInfo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {salonInfo.name}
            </div>
          )}
          {staffProfile?.full_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              {staffProfile.full_name}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-sm text-muted-foreground">Services:</p>
          <div className="flex flex-wrap gap-2">
            {appointment.appointment_services?.map((as: any, idx: number) => (
              <Badge key={idx} variant="outline">
                {as.service?.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold text-primary">₹{appointment.final_amount}</p>
          </div>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => {
                setSelectedAppointment(appointment);
                setCancelDialogOpen(true);
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your appointments</p>
          </div>
          <Button className="btn-gradient" onClick={() => window.location.href = '/customer/book'}>
            <Calendar className="w-4 h-4 mr-2" />
            Book New
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.href = '/customer/book'}
                  >
                    Book an Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No past appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pastAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Cancel Appointment?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="font-medium">
                {format(new Date(selectedAppointment.appointment_date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedAppointment.start_time.slice(0, 5)} - {selectedAppointment.end_time.slice(0, 5)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CustomerBookings;
