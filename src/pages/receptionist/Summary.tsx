import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const ReceptionistSummary = () => {
  const { salon } = useAuth();
  const [data, setData] = useState({ total: 0, completed: 0, cancelled: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!salon?.id) return;
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: appts } = await supabase
        .from('appointments')
        .select('status, final_amount')
        .eq('salon_id', salon.id)
        .eq('appointment_date', today);
      const list = appts || [];
      setData({
        total: list.length,
        completed: list.filter((a) => a.status === 'completed').length,
        cancelled: list.filter((a) => a.status === 'cancelled').length,
        revenue: list
          .filter((a) => a.status === 'completed')
          .reduce((s, a) => s + Number(a.final_amount), 0),
      });
      setLoading(false);
    };
    load();
  }, [salon?.id]);

  const cards = [
    { label: 'Total Appointments', value: data.total, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Completed', value: data.completed, icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Cancelled', value: data.cancelled, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Today Revenue', value: `₹${data.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Daily Summary</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMM d, yyyy')}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <p className="text-2xl font-bold mt-1">{c.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${c.bg}`}>
                    <c.icon className={`w-6 h-6 ${c.color}`} />
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

export default ReceptionistSummary;
