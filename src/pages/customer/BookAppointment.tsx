import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePublicServices, usePublicStaff, usePublicAppointments } from '@/hooks/useSalon';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Info,
  RotateCcw,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, parseISO, addMinutes, parse, isBefore, isAfter } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ServicePreviewCard, ServicePreviewSkeleton, ServicePreviewEmpty } from '@/components/booking/ServicePreviewCard';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  discounted_price?: number;
  duration_minutes: number;
  category?: { name: string };
}

interface StaffMember {
  id: string;
  designation?: string;
  profile?: { full_name?: string; avatar_url?: string };
}

const STORAGE_KEY_PREFIX = 'booking-wizard:';

const loadPersisted = (userId?: string) => {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + userId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Drop persisted state if the saved date is in the past
    if (parsed?.selectedDate && parsed.selectedDate < format(new Date(), 'yyyy-MM-dd')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Read once on mount so a refresh restores the wizard
  const initial = useMemo(() => loadPersisted(user?.id), [user?.id]);

  const [step, setStep] = useState<number>(initial?.step ?? 1);
  const [selectedDate, setSelectedDate] = useState<string>(
    initial?.selectedDate ?? format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedServices, setSelectedServices] = useState<Service[]>(
    initial?.selectedServices ?? []
  );
  const [selectedStaff, setSelectedStaff] = useState<string | null>(initial?.selectedStaff ?? null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(
    initial?.selectedTimeSlot ?? null
  );
  const [customerRecord, setCustomerRecord] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  // True when wizard state was restored from localStorage on mount
  const [wasRestored, setWasRestored] = useState<boolean>(
    !!(initial && (initial.selectedServices?.length || initial.selectedTimeSlot))
  );
  const [restoreDismissed, setRestoreDismissed] = useState(false);
  // Revalidation of restored state when reaching Step 4
  type RevalStatus = 'idle' | 'checking' | 'ok' | 'issues';
  const [revalStatus, setRevalStatus] = useState<RevalStatus>('idle');
  const [revalIssues, setRevalIssues] = useState<string[]>([]);

  // Persist wizard progress so refresh on step 4 restores selections
  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY_PREFIX + user.id,
        JSON.stringify({
          step,
          selectedDate,
          selectedServices,
          selectedStaff,
          selectedTimeSlot,
        })
      );
    } catch {
      // ignore quota / serialization errors
    }
  }, [user?.id, step, selectedDate, selectedServices, selectedStaff, selectedTimeSlot]);

  // Show skeletons briefly when entering step 4 or when selection changes,
  // so heavy framer-motion mounts never cause a flicker.
  useEffect(() => {
    if (step !== 4) {
      setPreviewReady(false);
      return;
    }
    setPreviewReady(false);
    const t = setTimeout(() => setPreviewReady(true), 120);
    return () => clearTimeout(t);
  }, [step, selectedServices]);


  // Fetch customer record
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setCustomerRecord(data);
    };
    fetchCustomer();
  }, [user?.id]);

  const salonId = customerRecord?.salon_id;

  const { data: services = [], isLoading: servicesLoading } = usePublicServices(salonId);
  const { data: staff = [] } = usePublicStaff(salonId);
  const { data: existingAppointments = [] } = usePublicAppointments(salonId, selectedDate);

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    services.forEach((service: any) => {
      const category = service.category?.name || 'Other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(service);
    });
    return grouped;
  }, [services]);

  // Calculate total
  const totalAmount = selectedServices.reduce(
    (sum, s) => sum + (s.discounted_price || s.price),
    0
  );
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  // Generate available time slots with detailed reasons
  const timeSlots = useMemo(() => {
    const slots: { time: string; available: boolean; reason?: string }[] = [];
    const openTime = 9; // 9 AM
    const closeTime = 21; // 9 PM
    const now = new Date();
    const isToday = selectedDate === format(now, 'yyyy-MM-dd');

    for (let hour = openTime; hour < closeTime; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotStart = parse(timeStr, 'HH:mm', new Date());
        const slotEnd = addMinutes(slotStart, totalDuration || 30);

        let isAvailable = true;
        let reason: string | undefined;

        // 1. Past slot for today
        if (isToday && isBefore(slotStart, now)) {
          isAvailable = false;
          reason = 'This time has already passed today';
        }

        // 2. Slot would run past closing time
        const closeDate = parse(`${closeTime}:00`, 'HH:mm', new Date());
        if (isAvailable && isAfter(slotEnd, closeDate)) {
          isAvailable = false;
          reason = `Service ends after closing time (${closeTime}:00)`;
        }

        // 3. Conflicts with existing appointments
        if (isAvailable) {
          const overlapping = (existingAppointments as any[]).filter((apt) => {
            const aptStart = parse(apt.start_time.slice(0, 5), 'HH:mm', new Date());
            const aptEnd = parse(apt.end_time.slice(0, 5), 'HH:mm', new Date());
            return (
              (isAfter(slotStart, aptStart) && isBefore(slotStart, aptEnd)) ||
              (isAfter(slotEnd, aptStart) && isBefore(slotEnd, aptEnd)) ||
              (isBefore(slotStart, aptStart) && isAfter(slotEnd, aptEnd)) ||
              format(slotStart, 'HH:mm') === format(aptStart, 'HH:mm')
            );
          });

          if (selectedStaff) {
            const conflict = overlapping.find((a) => a.staff_id === selectedStaff);
            if (conflict) {
              isAvailable = false;
              reason = `Selected staff is already booked from ${conflict.start_time.slice(0, 5)} to ${conflict.end_time.slice(0, 5)}`;
            }
          } else if (staff.length > 0) {
            const busyStaffIds = new Set(
              overlapping.map((a) => a.staff_id).filter(Boolean)
            );
            if (busyStaffIds.size >= staff.length) {
              isAvailable = false;
              reason = 'All staff members are booked during this time';
            }
          }
        }

        slots.push({ time: timeStr, available: isAvailable, reason });
      }
    }

    return slots;
  }, [existingAppointments, selectedStaff, totalDuration, selectedDate, staff]);

  // Auto-clear selected time slot if it becomes invalid (e.g., staff changed)
  useEffect(() => {
    if (!selectedTimeSlot) return;
    const slot = timeSlots.find((s) => s.time === selectedTimeSlot);
    if (!slot || !slot.available) {
      setSelectedTimeSlot(null);
    }
  }, [timeSlots, selectedTimeSlot]);

  const selectedSlotMeta = timeSlots.find((s) => s.time === selectedTimeSlot);

  // Revalidate restored selections when reaching Step 4: re-check that
  // services still exist & active, staff still exists & active, and the time
  // slot is still available against freshly fetched data.
  useEffect(() => {
    if (step !== 4) {
      setRevalStatus('idle');
      setRevalIssues([]);
      return;
    }
    if (!wasRestored) {
      setRevalStatus('ok');
      setRevalIssues([]);
      return;
    }
    if (servicesLoading) {
      setRevalStatus('checking');
      return;
    }

    setRevalStatus('checking');
    const issues: string[] = [];

    // 1. Services still exist & active
    const liveServiceIds = new Set((services as any[]).map((s) => s.id));
    const missingServices = selectedServices.filter((s) => !liveServiceIds.has(s.id));
    if (missingServices.length > 0) {
      issues.push(
        `${missingServices.length} selected service${missingServices.length > 1 ? 's are' : ' is'} no longer available: ${missingServices.map((s) => s.name).join(', ')}`
      );
    }
    // 1b. Pricing / duration drift on still-existing services
    const drifted = selectedServices.filter((sel) => {
      const live: any = (services as any[]).find((s) => s.id === sel.id);
      if (!live) return false;
      const livePrice = live.discounted_price || live.price;
      const selPrice = sel.discounted_price || sel.price;
      return livePrice !== selPrice || live.duration_minutes !== sel.duration_minutes;
    });
    if (drifted.length > 0) {
      issues.push(
        `Price or duration changed for: ${drifted.map((s) => s.name).join(', ')}`
      );
    }

    // 2. Staff still exists & active
    if (selectedStaff) {
      const liveStaff: any = (staff as any[]).find((s) => s.id === selectedStaff);
      if (!liveStaff) {
        issues.push('The previously selected staff member is no longer available.');
      }
    }

    // 3. Time slot still available with current bookings / staff selection
    if (selectedTimeSlot) {
      const slot = timeSlots.find((s) => s.time === selectedTimeSlot);
      if (!slot) {
        issues.push('The previously selected time slot is no longer offered.');
      } else if (!slot.available) {
        issues.push(
          `Time slot ${selectedTimeSlot} is no longer available: ${slot.reason || 'taken'}.`
        );
      }
    } else {
      issues.push('No time slot is selected.');
    }

    setRevalIssues(issues);
    setRevalStatus(issues.length === 0 ? 'ok' : 'issues');
  }, [
    step,
    wasRestored,
    servicesLoading,
    services,
    staff,
    selectedServices,
    selectedStaff,
    selectedTimeSlot,
    timeSlots,
  ]);

  const handleServiceToggle = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const handleSubmit = async () => {
    if (!customerRecord || !salonId || !selectedTimeSlot) return;

    setIsSubmitting(true);
    try {
      const startTime = selectedTimeSlot;
      const startDate = parse(startTime, 'HH:mm', new Date());
      const endDate = addMinutes(startDate, totalDuration);
      const endTime = format(endDate, 'HH:mm');

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          salon_id: salonId,
          customer_id: customerRecord.id,
          staff_id: selectedStaff || null,
          appointment_date: selectedDate,
          start_time: startTime + ':00',
          end_time: endTime + ':00',
          status: 'pending',
          is_walkin: false,
          total_amount: totalAmount,
          final_amount: totalAmount,
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Create appointment services
      const appointmentServices = selectedServices.map((service) => ({
        appointment_id: appointment.id,
        service_id: service.id,
        staff_id: selectedStaff || null,
        price: service.discounted_price || service.price,
        duration_minutes: service.duration_minutes,
        status: 'pending' as const,
      }));

      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(appointmentServices);

      if (servicesError) throw servicesError;

      toast({
        title: 'Appointment Booked!',
        description: `Your appointment is scheduled for ${format(
          parseISO(selectedDate),
          'EEEE, MMMM d'
        )} at ${startTime}`,
      });

      navigate('/customer/bookings');
      // Clear persisted wizard once the booking is created
      if (user?.id && typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(STORAGE_KEY_PREFIX + user.id);
        } catch {
          // ignore
        }
      }
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to book appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate date options (next 14 days)
  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Services</h2>
              {servicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : Object.keys(servicesByCategory).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No services available</p>
                </div>
              ) : (
                Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">{category}</h3>
                    <div className="space-y-2">
                      {categoryServices.map((service: Service) => {
                        const isSelected = selectedServices.some((s) => s.id === service.id);
                        return (
                          <div
                            key={service.id}
                            onClick={() => handleServiceToggle(service)}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleServiceToggle(service)}
                              />
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {service.duration_minutes} min
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {service.discounted_price ? (
                                <>
                                  <p className="text-sm line-through text-muted-foreground">
                                    ₹{service.price}
                                  </p>
                                  <p className="font-bold text-primary">₹{service.discounted_price}</p>
                                </>
                              ) : (
                                <p className="font-bold">₹{service.price}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Date</h2>
              <div className="flex gap-2 overflow-x-auto pb-4">
                {dateOptions.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border min-w-[70px] transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-xs text-muted-foreground">
                        {format(date, 'EEE')}
                      </span>
                      <span className="text-lg font-bold">{format(date, 'd')}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(date, 'MMM')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-4">Select Staff (Optional)</h2>
              <RadioGroup
                value={selectedStaff || ''}
                onValueChange={(val) => setSelectedStaff(val || null)}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setSelectedStaff(null)}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      !selectedStaff
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="" id="any-staff" />
                    <div>
                      <Label htmlFor="any-staff" className="cursor-pointer font-medium">
                        Any Available
                      </Label>
                    </div>
                  </div>
                  {staff.map((s: any) => {
                    const profile: any = s.profile;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStaff(s.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedStaff === s.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={s.id} id={s.id} />
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {profile?.full_name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Label htmlFor={s.id} className="cursor-pointer font-medium">
                            {profile?.full_name || s.designation || 'Staff'}
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select Time</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded border border-border bg-background" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded border border-border bg-secondary/50" /> Unavailable
                  </span>
                </div>
              </div>

              <Alert className="mb-4 border-primary/30 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-xs">
                  Hover over greyed-out slots to see why they're unavailable. Slot duration is based on your selected services ({totalDuration} min).
                </AlertDescription>
              </Alert>

              <TooltipProvider delayDuration={150}>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map(({ time, available, reason }) => {
                    const btn = (
                      <button
                        key={time}
                        onClick={() => available && setSelectedTimeSlot(time)}
                        disabled={!available}
                        aria-label={available ? `Available at ${time}` : `Unavailable at ${time}: ${reason}`}
                        className={`w-full p-3 rounded-xl border text-center transition-all ${
                          selectedTimeSlot === time
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : available
                            ? 'border-border hover:border-primary/50'
                            : 'border-border bg-secondary/50 text-muted-foreground cursor-not-allowed line-through'
                        }`}
                      >
                        {time}
                      </button>
                    );
                    if (available) return <div key={time}>{btn}</div>;
                    return (
                      <Tooltip key={time}>
                        <TooltipTrigger asChild>
                          <span className="block">{btn}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                          {reason || 'Unavailable'}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>

              {timeSlots.filter((s) => s.available).length === 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No available slots</AlertTitle>
                  <AlertDescription>
                    {selectedStaff
                      ? 'The selected staff member is fully booked on this date. Try picking another date or choose "Any Available" staff.'
                      : 'All slots for this date are taken or have passed. Please select a different date.'}
                  </AlertDescription>
                </Alert>
              )}

              {!selectedTimeSlot && timeSlots.some((s) => s.available) && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Please choose an available time slot to continue.
                </p>
              )}

              {selectedSlotMeta && !selectedSlotMeta.available && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>This slot is no longer available</AlertTitle>
                  <AlertDescription>{selectedSlotMeta.reason}</AlertDescription>
                </Alert>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              {wasRestored && !restoreDismissed && (
                <Alert className="mb-4 border-primary/40 bg-primary/5">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <AlertTitle className="flex items-center justify-between gap-2 pr-6">
                    <span>Your selections were restored</span>
                    <button
                      type="button"
                      aria-label="Dismiss restore notice"
                      onClick={() => setRestoreDismissed(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>
                      We brought back your services, date{selectedStaff ? ', staff' : ''} and time slot
                      from your previous session. Review below and confirm, or start fresh.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (user?.id && typeof window !== 'undefined') {
                            try {
                              window.localStorage.removeItem(STORAGE_KEY_PREFIX + user.id);
                            } catch {
                              // ignore
                            }
                          }
                          setSelectedServices([]);
                          setSelectedStaff(null);
                          setSelectedTimeSlot(null);
                          setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                          setWasRestored(false);
                          setRestoreDismissed(true);
                          setStep(1);
                        }}
                      >
                        Start over
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setRestoreDismissed(true)}
                      >
                        Looks good
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Revalidation status — re-checks restored selections against fresh data */}
              {revalStatus === 'checking' && (
                <Alert className="mb-4 border-primary/30 bg-primary/5">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <AlertTitle>Revalidating your booking…</AlertTitle>
                  <AlertDescription>
                    Confirming your services, staff and time slot are still available.
                  </AlertDescription>
                </Alert>
              )}

              {revalStatus === 'issues' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Some details have changed since you last booked</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {revalIssues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Drop only the parts that are stale and send the user
                          // back to the earliest broken step so they can re-pick.
                          const liveServiceIds = new Set((services as any[]).map((s) => s.id));
                          const cleanedServices = selectedServices.filter((s) =>
                            liveServiceIds.has(s.id)
                          );
                          const liveStaff =
                            selectedStaff &&
                            (staff as any[]).find((s) => s.id === selectedStaff);

                          setSelectedServices(cleanedServices);
                          if (selectedStaff && !liveStaff) setSelectedStaff(null);
                          setSelectedTimeSlot(null);

                          if (cleanedServices.length === 0) setStep(1);
                          else setStep(3);
                        }}
                      >
                        Fix selections
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (user?.id && typeof window !== 'undefined') {
                            try {
                              window.localStorage.removeItem(STORAGE_KEY_PREFIX + user.id);
                            } catch {
                              // ignore
                            }
                          }
                          setSelectedServices([]);
                          setSelectedStaff(null);
                          setSelectedTimeSlot(null);
                          setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                          setWasRestored(false);
                          setStep(1);
                        }}
                      >
                        Start over
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <h2 className="text-xl font-semibold mb-4">Confirm Booking</h2>
              {revalStatus !== 'ok' ? (
                <Card className="bg-secondary/50">
                  <CardContent className="p-6 space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-4 bg-secondary rounded animate-pulse" />
                    ))}
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Booking summary will appear once revalidation finishes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
              <Card className="bg-secondary/50">
              
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {selectedTimeSlot} ({totalDuration} minutes)
                      </p>
                    </div>
                  </div>
                  {selectedStaff && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Staff</p>
                        <p className="font-medium">
                          {(staff.find((s: any) => s.id === selectedStaff) as any)?.profile
                            ?.full_name || 'Selected Staff'}
                        </p>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Your Curated Experience</p>
                    </div>

                    {selectedServices.length === 0 ? (
                      <ServicePreviewEmpty />
                    ) : !previewReady ? (
                      <div className="grid gap-3">
                        {selectedServices.slice(0, 4).map((s) => (
                          <ServicePreviewSkeleton key={s.id} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {selectedServices.map((service, idx) => (
                          <ServicePreviewCard
                            key={service.id}
                            name={service.name}
                            category={service.category?.name}
                            durationMinutes={service.duration_minutes}
                            price={service.discounted_price || service.price}
                            originalPrice={service.discounted_price ? service.price : undefined}
                            index={idx}
                            // Disable expensive per-card animations when many services
                            reduceMotion={selectedServices.length > 6}
                          />
                        ))}
                      </div>
                    )}

                    {/* Sync confirmation: cross-check preview totals vs final amount */}
                    {selectedServices.length > 0 && (() => {
                      const previewSum = selectedServices.reduce(
                        (s, sv) => s + (sv.discounted_price || sv.price),
                        0
                      );
                      const previewDuration = selectedServices.reduce(
                        (s, sv) => s + sv.duration_minutes,
                        0
                      );
                      const mismatch =
                        Math.round(previewSum) !== Math.round(totalAmount) ||
                        previewDuration !== totalDuration;
                      return mismatch ? (
                        <Alert variant="destructive" className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Preview is out of sync</AlertTitle>
                          <AlertDescription>
                            Service preview totals don't match the final invoice. Please go back and
                            re-select your services.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-primary" />
                          Preview matches invoice — {selectedServices.length} service
                          {selectedServices.length > 1 ? 's' : ''}, {totalDuration} min, ₹{totalAmount}
                        </p>
                      );
                    })()}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedServices.length > 0;
      case 2:
        return selectedDate !== '';
      case 3:
        return selectedTimeSlot !== null && !!selectedSlotMeta?.available;
      case 4: {
        if (selectedServices.length === 0) return false;
        if (!selectedTimeSlot || !selectedSlotMeta?.available) return false;
        // Final sync guard: preview totals must match invoice
        const previewSum = selectedServices.reduce(
          (s, sv) => s + (sv.discounted_price || sv.price),
          0
        );
        const previewDuration = selectedServices.reduce(
          (s, sv) => s + sv.duration_minutes,
          0
        );
        return (
          Math.round(previewSum) === Math.round(totalAmount) &&
          previewDuration === totalDuration
        );
      }
      default:
        return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Book Appointment
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && 'Choose the services you want'}
            {step === 2 && 'Pick your preferred date and staff'}
            {step === 3 && 'Select an available time slot'}
            {step === 4 && 'Review and confirm your booking'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  s === step
                    ? 'bg-primary text-primary-foreground'
                    : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 rounded ${
                    s < step ? 'bg-green-500' : 'bg-secondary'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </CardContent>
        </Card>

        {/* Summary Sidebar */}
        {selectedServices.length > 0 && step < 4 && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Selected Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedServices.map((s) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span>{s.name}</span>
                  <span>₹{s.discounted_price || s.price}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total ({totalDuration} min)</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {step < 4 ? (
            <Button
              className="btn-gradient"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="btn-gradient"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
