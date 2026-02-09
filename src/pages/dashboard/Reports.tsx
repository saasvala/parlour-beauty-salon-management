import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppointments, usePayments, useStaff } from '@/hooks/useSalon';
import {
  BarChart3,
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  Scissors,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return {
          start: format(startOfWeek(now), 'yyyy-MM-dd'),
          end: format(endOfWeek(now), 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case 'quarter':
        return {
          start: format(subMonths(startOfMonth(now), 2), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
    }
  };

  const range = getDateRange();
  const prevRange = {
    start:
      dateRange === 'week'
        ? format(subWeeks(parseISO(range.start), 1), 'yyyy-MM-dd')
        : format(subMonths(parseISO(range.start), 1), 'yyyy-MM-dd'),
    end:
      dateRange === 'week'
        ? format(subWeeks(parseISO(range.end), 1), 'yyyy-MM-dd')
        : format(subMonths(parseISO(range.end), 1), 'yyyy-MM-dd'),
  };

  const { data: allAppointments = [] } = useAppointments();
  const { data: payments = [] } = usePayments(range.start, range.end);
  const { data: prevPayments = [] } = usePayments(prevRange.start, prevRange.end);
  const { data: staff = [] } = useStaff();

  // Calculate KPIs
  const kpis = useMemo(() => {
    const currentRevenue = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const prevRevenue = prevPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const completedAppointments = allAppointments.filter(
      (a: any) => a.status === 'completed'
    ).length;
    const cancelledAppointments = allAppointments.filter(
      (a: any) => a.status === 'cancelled'
    ).length;

    const uniqueCustomers = new Set(
      allAppointments.map((a: any) => a.customer_id)
    ).size;

    return {
      currentRevenue,
      revenueGrowth,
      completedAppointments,
      cancelledAppointments,
      totalAppointments: allAppointments.length,
      uniqueCustomers,
    };
  }, [payments, prevPayments, allAppointments]);

  // Revenue by day chart data
  const revenueByDay = useMemo(() => {
    const days = eachDayOfInterval({
      start: parseISO(range.start),
      end: parseISO(range.end),
    });

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayPayments = payments.filter(
        (p: any) => format(new Date(p.created_at), 'yyyy-MM-dd') === dayStr
      );
      return {
        date: format(day, 'MMM dd'),
        revenue: dayPayments.reduce((sum: number, p: any) => sum + p.amount, 0),
      };
    });
  }, [payments, range]);

  // Revenue by payment method
  const revenueByMethod = useMemo(() => {
    const byMethod: Record<string, number> = {};
    payments.forEach((p: any) => {
      byMethod[p.payment_method] = (byMethod[p.payment_method] || 0) + p.amount;
    });
    return Object.entries(byMethod).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));
  }, [payments]);

  // Staff performance
  const staffPerformance = useMemo(() => {
    const staffStats: Record<string, { name: string; appointments: number; revenue: number }> = {};

    allAppointments.forEach((apt: any) => {
      if (apt.staff_id && apt.status === 'completed') {
        const staffMember: any = staff.find((s: any) => s.id === apt.staff_id);
        const profile: any = staffMember?.profile;
        const staffName = profile?.full_name || staffMember?.designation || 'Staff';

        if (!staffStats[apt.staff_id]) {
          staffStats[apt.staff_id] = { name: staffName, appointments: 0, revenue: 0 };
        }
        staffStats[apt.staff_id].appointments += 1;
        staffStats[apt.staff_id].revenue += apt.final_amount || 0;
      }
    });

    return Object.values(staffStats).sort((a, b) => b.revenue - a.revenue);
  }, [allAppointments, staff]);

  // Service analytics
  const serviceAnalytics = useMemo(() => {
    const serviceStats: Record<string, { name: string; count: number; revenue: number }> = {};

    allAppointments.forEach((apt: any) => {
      apt.appointment_services?.forEach((as: any) => {
        const serviceName = as.service?.name || 'Unknown';
        const serviceId = as.service_id;

        if (!serviceStats[serviceId]) {
          serviceStats[serviceId] = { name: serviceName, count: 0, revenue: 0 };
        }
        serviceStats[serviceId].count += 1;
        serviceStats[serviceId].revenue += as.price || 0;
      });
    });

    return Object.values(serviceStats).sort((a, b) => b.count - a.count);
  }, [allAppointments]);

  const COLORS = ['#e91e8c', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Track your salon performance</p>
          </div>
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">₹{kpis.currentRevenue.toLocaleString()}</p>
                    <div className={`flex items-center text-xs ${kpis.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {kpis.revenueGrowth >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(kpis.revenueGrowth).toFixed(1)}% from last period
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <IndianRupee className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Appointments</p>
                    <p className="text-2xl font-bold">{kpis.completedAppointments}</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.cancelledAppointments} cancelled
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Customers</p>
                    <p className="text-2xl font-bold">{kpis.uniqueCustomers}</p>
                    <p className="text-xs text-muted-foreground">unique visitors</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Ticket</p>
                    <p className="text-2xl font-bold">
                      ₹{kpis.completedAppointments > 0
                        ? Math.round(kpis.currentRevenue / kpis.completedAppointments)
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground">per appointment</p>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-500/10">
                    <TrendingUp className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="staff">Staff Performance</TabsTrigger>
            <TabsTrigger value="services">Service Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#e91e8c"
                          strokeWidth={2}
                          dot={{ fill: '#e91e8c', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5" />
                    By Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueByMethod}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {revenueByMethod.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {revenueByMethod.map((method, index) => (
                      <div key={method.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{method.name}</span>
                        </div>
                        <span className="font-medium">₹{method.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Staff Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Staff Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={staffPerformance.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#888" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#e91e8c" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {staffPerformance.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No staff performance data available
                      </p>
                    ) : (
                      staffPerformance.map((staff, index) => (
                        <motion.div
                          key={staff.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {staff.appointments} appointments
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₹{staff.revenue.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">revenue</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Most Booked Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="w-5 h-5" />
                    Most Booked Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={serviceAnalytics.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#888" fontSize={10} angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Service Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Service Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {serviceAnalytics.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No service data available
                      </p>
                    ) : (
                      serviceAnalytics.map((service, index) => (
                        <motion.div
                          key={service.name}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                        >
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {service.count} bookings
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₹{service.revenue.toLocaleString()}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
