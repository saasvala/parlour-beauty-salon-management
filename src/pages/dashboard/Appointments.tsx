import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const AppointmentsPage = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointments Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Appointments management coming soon...</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AppointmentsPage;
