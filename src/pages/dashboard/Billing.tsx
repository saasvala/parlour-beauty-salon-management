import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

const BillingPage = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing & Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Billing module coming soon...</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default BillingPage;
