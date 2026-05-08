import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Gift, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CustomerPackages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('salon_id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!customer) {
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from('packages')
          .select('*, package_services(service:services(name, duration_minutes))')
          .eq('salon_id', customer.salon_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        setPackages(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Special Packages</h1>
          <p className="text-muted-foreground">Curated bundles for the best value</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : packages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Gift className="w-12 h-12 opacity-50 mb-4" />
              <p>No packages available right now</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="outline">{pkg.validity_days} days</Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{pkg.name}</CardTitle>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1 text-sm">
                      {pkg.package_services?.slice(0, 4).map((ps: any, i: number) => (
                        <div key={i} className="text-muted-foreground">• {ps.service?.name}</div>
                      ))}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs line-through text-muted-foreground">
                          ₹{pkg.original_price}
                        </p>
                        <p className="text-2xl font-bold text-primary">₹{pkg.discounted_price}</p>
                      </div>
                      <Button size="sm" onClick={() => navigate('/customer/book')}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerPackages;
