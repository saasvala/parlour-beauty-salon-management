import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSalon } from '@/hooks/useSalon';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';

interface BranchRow {
  id: string;
  salon_id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  is_main_branch: boolean;
  is_active: boolean;
}

const emptyForm = {
  name: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  is_main_branch: false,
  is_active: true,
};

const BranchesPage = () => {
  const { salonId } = useSalon();
  const { toast } = useToast();
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BranchRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!salonId) return;
    setLoading(true);
    const { data } = await supabase
      .from('branches')
      .select('*')
      .eq('salon_id', salonId)
      .order('is_main_branch', { ascending: false })
      .order('created_at');
    setBranches((data || []) as BranchRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [salonId]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (b: BranchRow) => {
    setEditing(b);
    setForm({
      name: b.name,
      address: b.address || '',
      city: b.city || '',
      phone: b.phone || '',
      email: b.email || '',
      is_main_branch: b.is_main_branch,
      is_active: b.is_active,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!salonId || !form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('branches').update(form).eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Branch updated' });
      } else {
        const { error } = await supabase.from('branches').insert({ ...form, salon_id: salonId });
        if (error) throw error;
        toast({ title: 'Branch created' });
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: BranchRow) => {
    if (!confirm(`Delete branch "${b.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('branches').delete().eq('id', b.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Branch deleted' });
      load();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl">Branches</h1>
            <p className="text-sm text-muted-foreground">Manage your salon locations</p>
          </div>
          <Button onClick={openNew} className="btn-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add branch
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : branches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <Building2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No branches yet</p>
              <Button className="mt-4" onClick={openNew}>
                Add your first branch
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {branches.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{b.name}</h3>
                      {b.is_main_branch && <Badge variant="outline">Main</Badge>}
                      {!b.is_active && <Badge variant="destructive">Inactive</Badge>}
                    </div>
                    {b.address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {b.address}
                        {b.city ? `, ${b.city}` : ''}
                      </p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      {b.phone && <span>{b.phone}</span>}
                      {b.email && <span>{b.email}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(b)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(b)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit branch' : 'New branch'}</DialogTitle>
            <DialogDescription>
              Manage location details, contact info, and active status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Main branch</Label>
              <Switch
                checked={form.is_main_branch}
                onCheckedChange={(v) => setForm({ ...form, is_main_branch: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="btn-gradient">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BranchesPage;
