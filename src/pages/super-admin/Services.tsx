import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

const SuperAdminServices = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('services').select('*, category:service_categories(name)').eq('is_global', true).order('name')
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, []);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Master Services</h1>
          <p className="text-muted-foreground">Global service catalog</p>
        </div>
        <Card><CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Duration</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.category?.name || '-'}</TableCell>
                    <TableCell>{s.duration_minutes} min</TableCell>
                    <TableCell>₹{s.price}</TableCell>
                    <TableCell><Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent></Card>
      </div>
    </DashboardLayout>
  );
};
export default SuperAdminServices;
