import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const StaffAttendance = () => {
  const { staff } = useAuth();
  const { toast } = useToast();
  const [today, setToday] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const load = async () => {
    if (!staff?.id) return;
    setLoading(true);
    const { data: t } = await supabase
      .from('staff_attendance')
      .select('*')
      .eq('staff_id', staff.id)
      .eq('date', todayStr)
      .maybeSingle();
    setToday(t);
    const { data: h } = await supabase
      .from('staff_attendance')
      .select('*')
      .eq('staff_id', staff.id)
      .order('date', { ascending: false })
      .limit(30);
    setHistory(h || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff?.id]);

  const checkIn = async () => {
    if (!staff?.id) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('staff_attendance').insert({
      staff_id: staff.id,
      date: todayStr,
      check_in: now,
      status: 'present',
    });
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Checked in' });
    load();
  };

  const checkOut = async () => {
    if (!today?.id) return;
    const { error } = await supabase
      .from('staff_attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', today.id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Checked out' });
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track your check-in / check-out</p>
        </div>

        <Card>
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMM d')}</p>
              <p className="text-2xl font-bold">
                {today?.check_in ? format(new Date(today.check_in), 'HH:mm') : '--:--'}
                {' → '}
                {today?.check_out ? format(new Date(today.check_out), 'HH:mm') : '--:--'}
              </p>
            </div>
            <div className="flex gap-2">
              {!today?.check_in && (
                <Button onClick={checkIn} className="btn-gradient">
                  <LogIn className="w-4 h-4 mr-2" /> Check In
                </Button>
              )}
              {today?.check_in && !today?.check_out && (
                <Button onClick={checkOut} variant="outline">
                  <LogOut className="w-4 h-4 mr-2" /> Check Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="font-semibold mb-3">Recent history</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : history.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 opacity-50 mb-4" />
                <p>No attendance records yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2">
              {history.map((h) => (
                <Card key={h.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{format(new Date(h.date), 'EEE, MMM d')}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.check_in ? format(new Date(h.check_in), 'HH:mm') : '—'}
                        {' → '}
                        {h.check_out ? format(new Date(h.check_out), 'HH:mm') : '—'}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{h.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffAttendance;
