import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, TrendingUp } from 'lucide-react';
import { format, startOfMonth, subMonths } from 'date-fns';

const StaffCommission = () => {
  const { staff } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, commission: 0, count: 0 });
  const [byMonth, setByMonth] = useState<{ month: string; revenue: number; commission: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!staff?.id) return;
      const sixMonthsAgo = format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('appointments')
        .select('appointment_date, final_amount, status')
        .eq('staff_id', staff.id)
        .eq('status', 'completed')
        .gte('appointment_date', sixMonthsAgo);

      const rate = Number(staff.commission_percentage || 0) / 100;
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const thisMonth = (data || []).filter((a) => a.appointment_date >= monthStart);
      const revenue = thisMonth.reduce((s, a) => s + Number(a.final_amount), 0);
      setStats({ revenue, commission: revenue * rate, count: thisMonth.length });

      const grouped: Record<string, { revenue: number; count: number }> = {};
      (data || []).forEach((a) => {
        const key = format(new Date(a.appointment_date), 'yyyy-MM');
        grouped[key] = grouped[key] || { revenue: 0, count: 0 };
        grouped[key].revenue += Number(a.final_amount);
        grouped[key].count += 1;
      });
      setByMonth(
        Object.entries(grouped)
          .sort((a, b) => (a[0] < b[0] ? 1 : -1))
          .map(([month, v]) => ({
            month,
            revenue: v.revenue,
            commission: v.revenue * rate,
            count: v.count,
          })),
      );
      setLoading(false);
    };
    load();
  }, [staff?.id, staff?.commission_percentage]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Commission</h1>
          <p className="text-muted-foreground">Earnings from completed appointments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month Revenue</p>
                <p className="text-2xl font-bold mt-1">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="w-6 h-6 text-primary" /></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commission ({Number(staff?.commission_percentage || 0)}%)</p>
                <p className="text-2xl font-bold mt-1 text-primary">₹{stats.commission.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10"><Wallet className="w-6 h-6 text-primary" /></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold mt-1">{stats.count}</p>
            </div>
          </CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-3">Month</th>
                    <th className="text-right p-3">Appointments</th>
                    <th className="text-right p-3">Revenue</th>
                    <th className="text-right p-3">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                  ) : byMonth.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No earnings yet</td></tr>
                  ) : byMonth.map((m) => (
                    <tr key={m.month} className="border-t">
                      <td className="p-3">{format(new Date(m.month + '-01'), 'MMM yyyy')}</td>
                      <td className="p-3 text-right">{m.count}</td>
                      <td className="p-3 text-right">₹{m.revenue.toLocaleString()}</td>
                      <td className="p-3 text-right text-primary font-medium">₹{m.commission.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffCommission;
