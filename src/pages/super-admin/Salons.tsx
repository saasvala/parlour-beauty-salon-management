import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Salon } from '@/types/database';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const SuperAdminSalons = () => {
  const { toast } = useToast();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('salons')
      .select('*')
      .order('created_at', { ascending: false });
    setSalons((data || []) as Salon[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (s: Salon) => {
    const { error } = await supabase
      .from('salons')
      .update({ is_active: !s.is_active })
      .eq('id', s.id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Updated', description: `${s.name} is now ${!s.is_active ? 'active' : 'inactive'}` });
    load();
  };

  const filtered = salons.filter((s) =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Salons</h1>
          <p className="text-muted-foreground">Manage all registered salons</p>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search salons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email || '-'}</TableCell>
                      <TableCell>{s.city || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={s.is_active ? 'default' : 'secondary'}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{s.subscription_status}</Badge></TableCell>
                      <TableCell>{format(new Date(s.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => toggle(s)}>
                          {s.is_active ? <><XCircle className="w-4 h-4 mr-1" />Disable</> : <><CheckCircle className="w-4 h-4 mr-1" />Enable</>}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminSalons;
