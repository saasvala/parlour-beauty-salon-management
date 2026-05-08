import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

const SuperAdminUsers = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('user_roles').select('user_id, role'),
      ]);
      const map = new Map<string, string[]>();
      (roles || []).forEach((r: any) => {
        const arr = map.get(r.user_id) || [];
        arr.push(r.role);
        map.set(r.user_id, arr);
      });
      setRows((profiles || []).map((p: any) => ({ ...p, roles: map.get(p.id) || [] })));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = rows.filter((r) => !search || r.email?.toLowerCase().includes(search.toLowerCase()) || r.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">All registered platform users</p>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Roles</TableHead><TableHead>Joined</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name || '-'}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><div className="flex flex-wrap gap-1">{u.roles.map((r: string) => <Badge key={r} variant="outline" className="capitalize">{r.replace('_', ' ')}</Badge>)}</div></TableCell>
                      <TableCell>{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
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

export default SuperAdminUsers;
