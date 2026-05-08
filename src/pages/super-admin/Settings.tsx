import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SuperAdminSettings = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Global configuration</p>
      </div>
      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Authentication, leaked-password protection, and email templates are managed in Lovable Cloud → Users → Auth Settings.</p>
          <p>Database, RLS, and storage buckets are managed in Lovable Cloud → Backend.</p>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);
export default SuperAdminSettings;
