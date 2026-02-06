import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const CustomerBookings = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            My Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your bookings will appear here...</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CustomerBookings;
