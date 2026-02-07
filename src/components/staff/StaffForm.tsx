import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';


const staffSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['branch_manager', 'receptionist', 'beautician'] as const),
  designation: z.string().optional(),
  employee_code: z.string().optional(),
  base_salary: z.coerce.number().min(0).default(0),
  commission_percentage: z.coerce.number().min(0).max(100).default(0),
  is_active: z.boolean().default(true),
});

export type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  initialData?: Partial<StaffFormData>;
  onSubmit: (data: StaffFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const StaffForm: React.FC<StaffFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false,
}) => {
  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: initialData?.email || '',
      full_name: initialData?.full_name || '',
      phone: initialData?.phone || '',
      role: initialData?.role || 'beautician',
      designation: initialData?.designation || '',
      employee_code: initialData?.employee_code || '',
      base_salary: initialData?.base_salary || 0,
      commission_percentage: initialData?.commission_percentage || 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleSubmit = async (data: StaffFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="staff@salon.com" 
                    {...field}
                    disabled={isEdit}
                  />
                </FormControl>
                {!isEdit && (
                  <FormDescription>
                    An invitation will be sent to this email
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="branch_manager">Branch Manager</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="beautician">Beautician / Stylist</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Senior Stylist" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employee_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., EMP001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="base_salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Salary (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={1000} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commission_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission (%)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={100} step={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Active Status</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Staff can access the system and take appointments
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="btn-gradient" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? 'Update Staff' : 'Add Staff'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
