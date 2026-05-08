import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Package } from 'lucide-react';

const SuperAdminSubscriptions = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('subscription_plans').select('*').order('price_monthly'),
        supabase.from('salons').select('id, name, subscription_status, subscription_end_date, subscription_plan_id'),
      ]);
      setPlans(p || []);
      setSalons(s || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Plans and salon subscription status</p>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Available plans</h2>
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{p.name}</h3>
                    </div>
                    <p className="text-2xl font-bold">₹{Number(p.price_monthly).toLocaleString()}<span className="text-xs text-muted-foreground"> /mo</span></p>
                    <p className="text-sm text-muted-foreground">{p.max_branches} branches • {p.max_staff} staff</p>
                    {!p.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-3">Salon subscriptions</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salon</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ends</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salons.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{plans.find((p) => p.id === s.subscription_plan_id)?.name || '-'}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{s.subscription_status}</Badge></TableCell>
                      <TableCell>{s.subscription_end_date || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminSubscriptions;
