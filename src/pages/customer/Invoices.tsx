import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Download } from 'lucide-react';
import { format } from 'date-fns';
import { generateInvoicePdf } from '@/lib/invoicePdf';

const CustomerInvoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!customer) {
          setLoading(false);
          return;
        }
        const { data: appts } = await supabase
          .from('appointments')
          .select('id')
          .eq('customer_id', customer.id);
        const apptIds = (appts || []).map((a) => a.id);
        if (apptIds.length === 0) {
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from('invoices')
          .select('*, appointment:appointments(appointment_date, salon:salons(name))')
          .in('appointment_id', apptIds)
          .order('created_at', { ascending: false });
        setInvoices(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleDownload = async (invoice: any) => {
    try {
      await generateInvoicePdf(invoice);
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to download invoice', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Invoices</h1>
          <p className="text-muted-foreground">All your billing history in one place</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 opacity-50 mb-4" />
              <p>No invoices yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {invoices.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {inv.appointment?.salon?.name || ''} •{' '}
                      {inv.appointment?.appointment_date
                        ? format(new Date(inv.appointment.appointment_date), 'MMM d, yyyy')
                        : format(new Date(inv.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-bold">₹{Number(inv.total_amount).toLocaleString()}</p>
                    </div>
                    <Badge
                      variant={Number(inv.due_amount) <= 0 ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {Number(inv.due_amount) <= 0 ? 'Paid' : 'Due'}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(inv)}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
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

export default CustomerInvoices;
