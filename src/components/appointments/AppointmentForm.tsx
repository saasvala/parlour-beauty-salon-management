import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { format, addMinutes, parse } from 'date-fns';

const appointmentSchema = z.object({
  customer_id: z.string().min(1, 'Please select a customer'),
  appointment_date: z.string().min(1, 'Please select a date'),
  start_time: z.string().min(1, 'Please select a time'),
  staff_id: z.string().optional(),
  service_ids: z.array(z.string()).min(1, 'Please select at least one service'),
  notes: z.string().optional(),
  is_walkin: z.boolean().default(false),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  discounted_price?: number | null;
}

interface Customer {
  id: string;
  full_name: string;
  phone: string;
}

interface StaffMember {
  id: string;
  profile?: { full_name?: string } | null;
  designation?: string | null;
}

interface AppointmentFormProps {
  customers: Customer[];
  services: Service[];
  staff: StaffMember[];
  onSubmit: (data: AppointmentFormData & { total_amount: number; end_time: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingAppointments?: { start_time: string; end_time: string; staff_id?: string }[];
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  customers,
  services,
  staff,
  onSubmit,
  onCancel,
  isLoading,
  existingAppointments: _existingAppointments = [],
}) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [endTime, setEndTime] = useState('');

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customer_id: '',
      appointment_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '',
      staff_id: '',
      service_ids: [],
      notes: '',
      is_walkin: false,
    },
  });

  const watchStartTime = form.watch('start_time');
  const watchServiceIds = form.watch('service_ids');

  // Calculate total and duration when services change
  useEffect(() => {
    const selected = services.filter(s => watchServiceIds.includes(s.id));
    setSelectedServices(selected);
    
    const total = selected.reduce((sum, s) => sum + (s.discounted_price || s.price), 0);
    setTotalAmount(total);
    
    const duration = selected.reduce((sum, s) => sum + s.duration_minutes, 0);
    setTotalDuration(duration);
    
    // Calculate end time
    if (watchStartTime && duration > 0) {
      const startDate = parse(watchStartTime, 'HH:mm', new Date());
      const endDate = addMinutes(startDate, duration);
      setEndTime(format(endDate, 'HH:mm'));
    }
  }, [watchServiceIds, watchStartTime, services]);

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    const current = form.getValues('service_ids');
    if (checked) {
      form.setValue('service_ids', [...current, serviceId]);
    } else {
      form.setValue('service_ids', current.filter(id => id !== serviceId));
    }
  };

  const handleSubmit = async (data: AppointmentFormData) => {
    await onSubmit({
      ...data,
      total_amount: totalAmount,
      end_time: endTime,
    });
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="appointment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    min={format(new Date(), 'yyyy-MM-dd')}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="staff_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Staff</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Any available</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.profile?.full_name || 'Staff'} {s.designation && `- ${s.designation}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service_ids"
          render={() => (
            <FormItem>
              <FormLabel>Services *</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-secondary"
                  >
                    <Checkbox
                      id={service.id}
                      checked={watchServiceIds.includes(service.id)}
                      onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                    />
                    <label htmlFor={service.id} className="flex-1 cursor-pointer text-sm">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-muted-foreground ml-2">
                        ₹{service.discounted_price || service.price} • {service.duration_minutes}min
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedServices.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedServices.map((service) => (
              <Badge key={service.id} variant="secondary" className="gap-1">
                {service.name}
                <button
                  type="button"
                  onClick={() => handleServiceToggle(service.id, false)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any special instructions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_walkin"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">This is a walk-in appointment</FormLabel>
            </FormItem>
          )}
        />

        {/* Summary */}
        {selectedServices.length > 0 && (
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Duration:</span>
              <span className="font-medium">{totalDuration} minutes</span>
            </div>
            {endTime && (
              <div className="flex justify-between text-sm">
                <span>End Time:</span>
                <span className="font-medium">{endTime}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-primary">₹{totalAmount}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="btn-gradient" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Book Appointment
          </Button>
        </div>
      </form>
    </Form>
  );
};
