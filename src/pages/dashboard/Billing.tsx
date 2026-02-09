import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppointments, useSalon, usePayments, useInvoices } from '@/hooks/useSalon';
import { PaymentForm } from '@/components/billing/PaymentForm';
import { InvoiceView } from '@/components/billing/InvoiceView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  CreditCard,
  Search,
  Receipt,
  IndianRupee,
  FileText,
  TrendingUp,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const TAX_PERCENTAGE = 18; // GST 18%

const BillingPage = () => {
  const { salonId, salon } = useSalon();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('completed');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: allAppointments = [] } = useAppointments();
  const { data: payments = [] } = usePayments(
    format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const { data: invoices = [] } = useInvoices();

  // Filter to show only completed or in_progress appointments for billing
  const billableAppointments = allAppointments.filter(
    (apt: any) => ['completed', 'in_progress'].includes(apt.status)
  );

  const filteredAppointments = billableAppointments.filter((apt: any) => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch =
      apt.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customer?.phone?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleOpenPayment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsPaymentDialogOpen(true);
  };

  const handleCollectPayment = async (data: any) => {
    if (!salonId || !selectedAppointment || !user) return;
    setIsSubmitting(true);

    try {
      const paymentData = {
        appointment_id: selectedAppointment.id,
        salon_id: salonId,
        amount: data.amount,
        payment_method: data.payment_method,
        payment_status: 'completed' as const,
        transaction_id: data.transaction_id || null,
        notes: data.notes || null,
        received_by: user.id,
      };

      // Insert payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData);

      if (paymentError) throw paymentError;

      // Check if this is the first payment - create invoice
      const existingInvoice = invoices.find(
        (inv: any) => inv.appointment_id === selectedAppointment.id
      );

      if (!existingInvoice) {
        const subtotal = selectedAppointment.total_amount || 0;
        const discountAmount = data.discount_value
          ? data.discount_type === 'flat'
            ? data.discount_value
            : (subtotal * data.discount_value) / 100
          : 0;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * TAX_PERCENTAGE) / 100;
        const totalAmount = taxableAmount + taxAmount;

        const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

        const { error: invoiceError } = await supabase.from('invoices').insert({
          appointment_id: selectedAppointment.id,
          salon_id: salonId,
          invoice_number: invoiceNumber,
          subtotal: subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          tax_percentage: TAX_PERCENTAGE,
          total_amount: totalAmount,
          paid_amount: data.amount,
          due_amount: Math.max(0, totalAmount - data.amount),
          notes: data.notes || null,
        });

        if (invoiceError) throw invoiceError;
      } else {
        // Update existing invoice
        const newPaidAmount = (existingInvoice.paid_amount || 0) + data.amount;
        const newDueAmount = Math.max(0, existingInvoice.total_amount - newPaidAmount);

        await supabase
          .from('invoices')
          .update({
            paid_amount: newPaidAmount,
            due_amount: newDueAmount,
          })
          .eq('id', existingInvoice.id);
      }

      // Update customer stats
      const { data: customerData } = await supabase
        .from('customers')
        .select('total_visits, total_spent, loyalty_points')
        .eq('id', selectedAppointment.customer_id)
        .single();

      if (customerData) {
        await supabase
          .from('customers')
          .update({
            total_spent: (customerData.total_spent || 0) + data.amount,
            loyalty_points: (customerData.loyalty_points || 0) + Math.floor(data.amount / 100),
            last_visit_date: new Date().toISOString(),
          })
          .eq('id', selectedAppointment.customer_id);
      }
      toast({ title: 'Success', description: 'Payment collected successfully' });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsPaymentDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to collect payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewInvoice = async (appointment: any) => {
    const invoice = invoices.find((inv: any) => inv.appointment_id === appointment.id);
    if (invoice) {
      // Fetch associated payments
      const { data: invoicePayments } = await supabase
        .from('payments')
        .select('*')
        .eq('appointment_id', appointment.id)
        .order('created_at');

      setSelectedInvoice({
        ...invoice,
        appointment,
        payments: invoicePayments || [],
        services: appointment.appointment_services?.map((as: any) => ({
          name: as.service?.name,
          price: as.price,
          duration_minutes: as.duration_minutes,
        })) || [],
      });
      setIsInvoiceDialogOpen(true);
    }
  };

  const getAppointmentPaidAmount = (appointmentId: string) => {
    return payments
      .filter((p: any) => p.appointment_id === appointmentId)
      .reduce((sum: number, p: any) => sum + p.amount, 0);
  };

  const getPaymentStats = () => {
    const todayPayments = payments.filter((p: any) =>
      format(new Date(p.created_at), 'yyyy-MM-dd') === today
    );

    const todayRevenue = todayPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const monthRevenue = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    const byMethod = payments.reduce((acc: any, p: any) => {
      acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
      return acc;
    }, {});

    return { todayRevenue, monthRevenue, byMethod, todayCount: todayPayments.length };
  };

  const stats = getPaymentStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <IndianRupee className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Today's Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{stats.monthRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Banknote className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{(stats.byMethod?.cash || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Cash</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{(stats.byMethod?.upi || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">UPI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="billing" className="space-y-4">
          <TabsList>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="billing">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Billable Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billable Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No billable appointments found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((appointment: any, index: number) => {
                      const paidAmount = getAppointmentPaidAmount(appointment.id);
                      const dueAmount = (appointment.total_amount || 0) - paidAmount;
                      const hasInvoice = invoices.some(
                        (inv: any) => inv.appointment_id === appointment.id
                      );

                      return (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[80px]">
                              <p className="text-sm font-medium">
                                {format(new Date(appointment.appointment_date), 'dd MMM')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.start_time?.slice(0, 5)}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold">{appointment.customer?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.customer?.phone}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {appointment.appointment_services?.slice(0, 2).map((as: any) => (
                                  <Badge key={as.id} variant="outline" className="text-xs">
                                    {as.service?.name}
                                  </Badge>
                                ))}
                                {appointment.appointment_services?.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{appointment.appointment_services.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold">₹{appointment.total_amount || 0}</p>
                              {paidAmount > 0 && (
                                <p className="text-xs text-green-500">
                                  Paid: ₹{paidAmount}
                                </p>
                              )}
                              {dueAmount > 0 && (
                                <p className="text-xs text-red-500">
                                  Due: ₹{dueAmount}
                                </p>
                              )}
                            </div>
                            <Badge
                              className={
                                dueAmount <= 0
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-yellow-500/10 text-yellow-500'
                              }
                            >
                              {dueAmount <= 0 ? 'Paid' : 'Pending'}
                            </Badge>
                            <div className="flex gap-2">
                              {hasInvoice && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewInvoice(appointment)}
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              )}
                              {dueAmount > 0 && (
                                <Button
                                  size="sm"
                                  className="btn-gradient"
                                  onClick={() => handleOpenPayment(appointment)}
                                >
                                  <IndianRupee className="w-4 h-4 mr-1" />
                                  Collect
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  All Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices generated yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice: any, index: number) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="font-semibold">{invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.appointment?.customer?.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(invoice.created_at), 'dd MMM yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">₹{invoice.total_amount}</p>
                            <p className="text-xs text-green-500">
                              Paid: ₹{invoice.paid_amount}
                            </p>
                          </div>
                          <Badge
                            className={
                              invoice.due_amount <= 0
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                            }
                          >
                            {invoice.due_amount <= 0 ? 'Paid' : `Due: ₹${invoice.due_amount}`}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedInvoice({
                              ...invoice,
                              services: [],
                              payments: [],
                            });
                            setIsInvoiceDialogOpen(true);
                          }}>
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment: any, index: number) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            {payment.payment_method === 'cash' && (
                              <Banknote className="w-5 h-5 text-green-500" />
                            )}
                            {payment.payment_method === 'upi' && (
                              <Smartphone className="w-5 h-5 text-blue-500" />
                            )}
                            {payment.payment_method === 'card' && (
                              <CreditCard className="w-5 h-5 text-purple-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {payment.appointment?.customer?.full_name || 'Customer'}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {payment.payment_method}
                              {payment.transaction_id && ` - ${payment.transaction_id}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.created_at), 'dd MMM yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-500">
                            +₹{payment.amount}
                          </p>
                          <Badge className="bg-green-500/10 text-green-500">
                            {payment.payment_status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <PaymentForm
              totalAmount={selectedAppointment.total_amount || 0}
              paidAmount={getAppointmentPaidAmount(selectedAppointment.id)}
              onSubmit={handleCollectPayment}
              onCancel={() => setIsPaymentDialogOpen(false)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoice && salon && (
            <InvoiceView
              invoice={selectedInvoice}
              salon={{
                name: salon.name,
                address: salon.address || undefined,
                phone: salon.phone || undefined,
                email: salon.email || undefined,
                gst_number: salon.gst_number || undefined,
              }}
              services={selectedInvoice.services || []}
              payments={selectedInvoice.payments || []}
              onClose={() => setIsInvoiceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BillingPage;
