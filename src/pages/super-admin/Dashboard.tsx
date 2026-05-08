import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  Users,
  TrendingUp,
  Plus,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Salon } from '@/types/database';
import { format } from 'date-fns';

interface DashboardStats {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  monthlyRevenue: number;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSalons: 0,
    activeSalons: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
  });
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsSalon, setDetailsSalon] = useState<Salon | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: salonsData, count: salonCount } = await supabase
        .from('salons')
        .select('*', { count: 'exact' });

      if (salonsData) {
        setSalons(salonsData as Salon[]);
        setStats(prev => ({
          ...prev,
          totalSalons: salonCount || 0,
          activeSalons: salonsData.filter(s => s.is_active).length,
        }));
      }

      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Compute monthly revenue from completed payments this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, payment_status, created_at')
        .gte('created_at', monthStart.toISOString())
        .eq('payment_status', 'completed');

      const monthlyRevenue = (paymentsData || []).reduce(
        (sum, p: any) => sum + Number(p.amount || 0),
        0
      );

      setStats(prev => ({
        ...prev,
        totalUsers: userCount || 0,
        monthlyRevenue,
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSalonStatus = async (salonId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('salons')
        .update({ is_active: !currentStatus })
        .eq('id', salonId);
      
      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling salon status:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Salons',
      value: stats.totalSalons,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Salons',
      value: stats.activeSalons,
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Salons Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Salons</CardTitle>
            <Button className="btn-gradient" onClick={() => navigate('/super-admin/salons')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Salon
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : salons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No salons registered yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salon Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salons.map((salon) => (
                    <TableRow key={salon.id}>
                      <TableCell className="font-medium">{salon.name}</TableCell>
                      <TableCell>{salon.email || '-'}</TableCell>
                      <TableCell>{salon.city || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={salon.is_active ? 'default' : 'secondary'}>
                          {salon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {salon.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailsSalon(salon)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleSalonStatus(salon.id, salon.is_active)}
                            >
                              {salon.is_active ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!detailsSalon} onOpenChange={(o) => !o && setDetailsSalon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailsSalon?.name}</DialogTitle>
            <DialogDescription>Salon details and subscription</DialogDescription>
          </DialogHeader>
          {detailsSalon && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{detailsSalon.email || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{detailsSalon.phone || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">City</span><span>{detailsSalon.city || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">State</span><span>{detailsSalon.state || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>{detailsSalon.gst_number || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Subscription</span><Badge variant="outline" className="capitalize">{detailsSalon.subscription_status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{format(new Date(detailsSalon.created_at), 'MMM d, yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={detailsSalon.is_active ? 'default' : 'secondary'}>{detailsSalon.is_active ? 'Active' : 'Inactive'}</Badge></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
