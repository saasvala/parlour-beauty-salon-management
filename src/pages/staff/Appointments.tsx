import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, PlayCircle, CheckCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

const StaffAppointments = () => {
  const { staff } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!staff?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*, customer:customers(full_name, phone), appointment_services(*, service:services(name))')
      .eq('staff_id', staff.id)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: true })
      .limit(200);
    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff?.id]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Updated', description: `Status set to ${status.replace('_', ' ')}` });
    load();
  };

  const filtered = appointments.filter((a) =>
    !search ||
    a.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.customer?.phone?.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">All assigned appointments</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 opacity-50 mb-4" />
              <p>No appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{a.customer?.full_name || 'Customer'}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{format(new Date(a.appointment_date), 'MMM d, yyyy')}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {a.start_time.slice(0, 5)} - {a.end_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{a.status.replace('_', ' ')}</Badge>
                    {a.status === 'confirmed' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'in_progress')}>
                        <PlayCircle className="w-4 h-4 mr-1" /> Start
                      </Button>
                    )}
                    {a.status === 'in_progress' && (
                      <Button size="sm" onClick={() => updateStatus(a.id, 'completed')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffAppointments;
