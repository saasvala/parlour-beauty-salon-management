import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

const StaffPage = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Staff Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Staff management coming soon...</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StaffPage;
