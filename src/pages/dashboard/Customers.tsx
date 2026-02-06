import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const CustomersPage = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customers Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customer management coming soon...</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CustomersPage;
