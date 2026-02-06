import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors } from 'lucide-react';

const ServicesPage = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Services Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Services management coming soon...</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ServicesPage;
