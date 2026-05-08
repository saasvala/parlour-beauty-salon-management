import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, TrendingUp, Calendar } from 'lucide-react';

const SuperAdminAnalytics = () => {
  const [s, setS] = useState({ salons: 0, users: 0, appts: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const [a, b, c, d] = await Promise.all([
        supabase.from('salons').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
        supabase.from('payments').select('amount').eq('payment_status', 'completed').gte('created_at', monthStart.toISOString()),
      ]);
      setS({
        salons: a.count || 0,
        users: b.count || 0,
        appts: c.count || 0,
        revenue: (d.data || []).reduce((x: number, p: any) => x + Number(p.amount || 0), 0),
      });
      setLoading(false);
    })();
  }, []);
  const cards = [
    { l: 'Salons', v: s.salons, i: Building2 },
    { l: 'Users', v: s.users, i: Users },
    { l: 'Appointments (mo)', v: s.appts, i: Calendar },
    { l: 'Revenue (mo)', v: `₹${s.revenue.toLocaleString()}`, i: TrendingUp },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground">Platform-wide metrics</p></div>
        {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <Card key={c.l}><CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">{c.l}</p><p className="text-2xl font-bold mt-1">{c.v}</p></div>
                <div className="p-3 rounded-xl bg-primary/10"><c.i className="w-6 h-6 text-primary" /></div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default SuperAdminAnalytics;
