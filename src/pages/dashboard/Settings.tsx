import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Building2,
  User,
  Bell,
  
  Loader2,
  Save,
  MapPin,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { user, profile, salon, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [creatingSalon, setCreatingSalon] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
  });

  // Salon form
  const [salonForm, setSalonForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (salon) {
      setSalonForm({
        name: salon.name || '',
        description: salon.description || '',
        email: salon.email || '',
        phone: salon.phone || '',
        address: salon.address || '',
        city: salon.city || '',
        state: salon.state || '',
        pincode: salon.pincode || '',
        gst_number: salon.gst_number || '',
      });
    }
  }, [salon]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Saved', description: 'Profile updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSalon = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (salon) {
        const { error } = await supabase
          .from('salons')
          .update({
            name: salonForm.name,
            description: salonForm.description || null,
            email: salonForm.email || null,
            phone: salonForm.phone || null,
            address: salonForm.address || null,
            city: salonForm.city || null,
            state: salonForm.state || null,
            pincode: salonForm.pincode || null,
            gst_number: salonForm.gst_number || null,
          })
          .eq('id', salon.id);
        if (error) throw error;
      } else {
        // Create new salon
        const { error } = await supabase.from('salons').insert({
          owner_id: user.id,
          name: salonForm.name,
          description: salonForm.description || null,
          email: salonForm.email || null,
          phone: salonForm.phone || null,
          address: salonForm.address || null,
          city: salonForm.city || null,
          state: salonForm.state || null,
          pincode: salonForm.pincode || null,
          gst_number: salonForm.gst_number || null,
        });
        if (error) throw error;
      }

      await refreshProfile();
      toast({ title: 'Saved', description: salon ? 'Salon updated' : 'Salon created successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSalonQuick = async () => {
    if (!user) return;
    setCreatingSalon(true);
    try {
      // Create salon
      const { data: newSalon, error: salonError } = await supabase
        .from('salons')
        .insert({
          owner_id: user.id,
          name: profileForm.full_name ? `${profileForm.full_name}'s Salon` : 'My Salon',
          email: user.email,
          is_active: true,
        })
        .select()
        .single();

      if (salonError) throw salonError;

      // Create main branch
      const { error: branchError } = await supabase
        .from('branches')
        .insert({
          salon_id: newSalon.id,
          name: 'Main Branch',
          is_main_branch: true,
          is_active: true,
        });

      if (branchError) throw branchError;

      await refreshProfile();
      toast({ title: 'Success!', description: 'Your salon has been created. You can now manage it from the dashboard.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCreatingSalon(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your profile and salon settings</p>
        </div>

        {/* Quick salon creation if no salon */}
        {!salon && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Create Your Salon
                </CardTitle>
                <CardDescription>
                  You need a salon to start managing appointments, staff, and billing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="btn-gradient" onClick={handleCreateSalonQuick} disabled={creatingSalon}>
                  {creatingSalon ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Building2 className="w-4 h-4 mr-2" />}
                  Quick Create Salon
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="salon">
              <Building2 className="w-4 h-4 mr-2" />
              Salon
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="opacity-60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salon">
            <Card>
              <CardHeader>
                <CardTitle>{salon ? 'Salon Details' : 'Create Salon'}</CardTitle>
                <CardDescription>
                  {salon ? 'Update your salon information' : 'Set up your salon to get started'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salon Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={salonForm.name}
                        onChange={(e) => setSalonForm({ ...salonForm, name: e.target.value })}
                        placeholder="My Awesome Salon"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={salonForm.email}
                        onChange={(e) => setSalonForm({ ...salonForm, email: e.target.value })}
                        placeholder="salon@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={salonForm.phone}
                        onChange={(e) => setSalonForm({ ...salonForm, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={salonForm.gst_number}
                        onChange={(e) => setSalonForm({ ...salonForm, gst_number: e.target.value })}
                        placeholder="22AAAAA0000A1Z5"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={salonForm.description}
                    onChange={(e) => setSalonForm({ ...salonForm, description: e.target.value })}
                    placeholder="Tell customers about your salon..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={salonForm.address}
                        onChange={(e) => setSalonForm({ ...salonForm, address: e.target.value })}
                        placeholder="Street address"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={salonForm.city}
                      onChange={(e) => setSalonForm({ ...salonForm, city: e.target.value })}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={salonForm.state}
                      onChange={(e) => setSalonForm({ ...salonForm, state: e.target.value })}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSalon} disabled={saving || !salonForm.name}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {salon ? 'Update Salon' : 'Create Salon'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'New Appointment Alerts', desc: 'Get notified when a new appointment is booked' },
                  { label: 'Payment Notifications', desc: 'Receive alerts for payments and invoices' },
                  { label: 'Daily Summary', desc: 'Get a daily summary of appointments and revenue' },
                  { label: 'Staff Updates', desc: 'Notifications about staff changes and attendance' },
                  { label: 'Low Inventory Alerts', desc: 'Get alerted when inventory items are running low' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={i < 3} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
