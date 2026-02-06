import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  PlayCircle,
  User,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Appointment, AppointmentStatus, StaffAttendance } from '@/types/database';

const StaffDashboard = () => {
  const { staff, profile } = useAuth();
  const { toast } = useToast();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<StaffAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyCommission, setMonthlyCommission] = useState(0);

  useEffect(() => {
    if (staff?.id) {
      fetchData();
    }
  }, [staff?.id]);

  const fetchData = async () => {
    if (!staff?.id) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch today's appointments for this staff
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('staff_id', staff.id)
        .eq('appointment_date', today)
        .order('start_time', { ascending: true });

      if (appointmentsData) {
        setTodayAppointments(appointmentsData as unknown as Appointment[]);
      }

      // Fetch today's attendance
      const { data: attendanceData } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('staff_id', staff.id)
        .eq('date', today)
        .maybeSingle();

      if (attendanceData) {
        setTodayAttendance(attendanceData as StaffAttendance);
      }

      // Calculate monthly commission (simplified - based on completed appointments)
      const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const { data: monthlyData } = await supabase
        .from('appointments')
        .select('final_amount')
        .eq('staff_id', staff.id)
        .eq('status', 'completed')
        .gte('appointment_date', startOfMonth);

      if (monthlyData && staff.commission_percentage) {
        const totalRevenue = monthlyData.reduce((sum, a) => sum + Number(a.final_amount), 0);
        setMonthlyCommission((totalRevenue * staff.commission_percentage) / 100);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'in_progress') {
        // Update appointment_services started_at
        await supabase
          .from('appointment_services')
          .update({ started_at: new Date().toISOString(), status: 'in_progress' })
          .eq('appointment_id', appointmentId);
      }
      
      if (newStatus === 'completed') {
        await supabase
          .from('appointment_services')
          .update({ completed_at: new Date().toISOString(), status: 'completed' })
          .eq('appointment_id', appointmentId);
      }

      await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId);

      toast({
        title: 'Status Updated',
        description: `Service marked as ${newStatus.replace('_', ' ')}`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleCheckIn = async () => {
    if (!staff?.id) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('staff_attendance')
        .upsert({
          staff_id: staff.id,
          date: today,
          check_in: new Date().toISOString(),
          status: 'present',
        }, { onConflict: 'staff_id,date' });

      if (error) throw error;

      toast({
        title: 'Checked In',
        description: `You checked in at ${format(new Date(), 'h:mm a')}`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in',
        variant: 'destructive',
      });
    }
  };

  const handleCheckOut = async () => {
    if (!staff?.id || !todayAttendance) return;

    try {
      const { error } = await supabase
        .from('staff_attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', todayAttendance.id);

      if (error) throw error;

      toast({
        title: 'Checked Out',
        description: `You checked out at ${format(new Date(), 'h:mm a')}`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check out',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      confirmed: 'bg-blue-500/10 text-blue-500',
      in_progress: 'bg-primary/10 text-primary',
      completed: 'bg-green-500/10 text-green-500',
      cancelled: 'bg-red-500/10 text-red-500',
    };
    return colors[status] || 'bg-secondary';
  };

  const stats = {
    total: todayAppointments.length,
    completed: todayAppointments.filter(a => a.status === 'completed').length,
    pending: todayAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome & Attendance */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {profile?.full_name || 'Staff'}!</h1>
            <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex gap-2">
            {!todayAttendance?.check_in ? (
              <Button onClick={handleCheckIn} className="btn-gradient">
                <Clock className="w-4 h-4 mr-2" />
                Check In
              </Button>
            ) : !todayAttendance?.check_out ? (
              <Button onClick={handleCheckOut} variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            ) : (
              <Badge variant="outline" className="py-2 px-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                Day Complete
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Today's Appointments</p>
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{monthlyCommission.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Status */}
        {todayAttendance && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <User className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Today's Attendance</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {todayAttendance.check_in && (
                        <span>
                          Check In: {format(new Date(todayAttendance.check_in), 'h:mm a')}
                        </span>
                      )}
                      {todayAttendance.check_out && (
                        <span>
                          Check Out: {format(new Date(todayAttendance.check_out), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {todayAttendance.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>My Appointments Today</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No appointments assigned for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {appointment.customer?.full_name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{appointment.customer?.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                          className="btn-gradient"
                        >
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {appointment.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          variant="outline"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
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

export default StaffDashboard;
