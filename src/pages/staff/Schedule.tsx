import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek } from 'date-fns';
import { Clock } from 'lucide-react';

const StaffSchedule = () => {
  const { staff } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    const load = async () => {
      if (!staff?.id) return;
      const start = format(weekStart, 'yyyy-MM-dd');
      const end = format(addDays(weekStart, 6), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('appointments')
        .select('*, customer:customers(full_name)')
        .eq('staff_id', staff.id)
        .gte('appointment_date', start)
        .lte('appointment_date', end)
        .neq('status', 'cancelled')
        .order('start_time');
      setAppointments(data || []);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff?.id]);

  const wh = staff?.working_hours as any;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">This week at a glance</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {days.map((d) => {
              const dStr = format(d, 'yyyy-MM-dd');
              const dow = format(d, 'EEEE').toLowerCase();
              const day = wh?.[dow];
              const dayAppts = appointments.filter((a) => a.appointment_date === dStr);
              return (
                <Card key={dStr} className="min-h-[180px]">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{format(d, 'EEE d')}</p>
                      {day?.is_open === false && <Badge variant="secondary">Off</Badge>}
                    </div>
                    {day?.is_open !== false && (
                      <p className="text-xs text-muted-foreground">
                        {day?.open || '09:00'} – {day?.close || '18:00'}
                      </p>
                    )}
                    <div className="space-y-1">
                      {dayAppts.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No appointments</p>
                      ) : (
                        dayAppts.map((a) => (
                          <div key={a.id} className="text-xs p-2 rounded bg-secondary/50">
                            <div className="flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" />
                              {a.start_time.slice(0, 5)}
                            </div>
                            <div className="text-muted-foreground truncate">
                              {a.customer?.full_name || 'Customer'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffSchedule;
