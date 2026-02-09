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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react';

const paymentSchema = z.object({
  payment_method: z.enum(['cash', 'upi', 'card', 'online', 'wallet']),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  discount_type: z.enum(['flat', 'percentage']).optional(),
  discount_value: z.number().min(0).optional(),
  transaction_id: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  totalAmount: number;
  paidAmount: number;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  totalAmount,
  paidAmount,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const dueAmount = totalAmount - paidAmount;
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState(0);
  const [payableAmount, setPayableAmount] = useState(dueAmount);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: 'cash',
      amount: dueAmount,
      discount_type: 'flat',
      discount_value: 0,
      transaction_id: '',
      notes: '',
    },
  });

  const watchPaymentMethod = form.watch('payment_method');

  useEffect(() => {
    let discountAmount = 0;
    if (discountType === 'flat') {
      discountAmount = discountValue;
    } else {
      discountAmount = (dueAmount * discountValue) / 100;
    }
    const newPayable = Math.max(0, dueAmount - discountAmount);
    setPayableAmount(newPayable);
    form.setValue('amount', newPayable);
  }, [discountType, discountValue, dueAmount, form]);

  const handleSubmit = async (data: PaymentFormData) => {
    await onSubmit({
      ...data,
      discount_type: discountType,
      discount_value: discountValue,
    });
  };

  const paymentMethods = [
    { value: 'cash' as const, label: 'Cash', icon: Banknote },
    { value: 'upi' as const, label: 'UPI', icon: Smartphone },
    { value: 'card' as const, label: 'Card', icon: CreditCard },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Amount Summary */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Amount:</span>
            <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
          </div>
          {paidAmount > 0 && (
            <div className="flex justify-between text-sm text-green-500">
              <span>Already Paid:</span>
              <span className="font-medium">-₹{paidAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Due Amount:</span>
            <span className="text-primary">₹{dueAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => field.onChange(method.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        field.value === method.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount */}
        <div className="space-y-3">
          <Label>Discount (Optional)</Label>
          <div className="flex gap-3">
            <RadioGroup
              value={discountType}
              onValueChange={(val) => setDiscountType(val as 'flat' | 'percentage')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flat" id="flat" />
                <Label htmlFor="flat">Flat (₹)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Percentage (%)</Label>
              </div>
            </RadioGroup>
          </div>
          <Input
            type="number"
            placeholder={discountType === 'flat' ? 'Enter amount' : 'Enter percentage'}
            value={discountValue || ''}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            className="w-40"
          />
        </div>

        {/* Payable Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount to Pay *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  max={payableAmount}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Enter partial amount for split payment
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction ID for UPI/Card */}
        {['upi', 'card', 'online'].includes(watchPaymentMethod) && (
          <FormField
            control={form.control}
            name="transaction_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter transaction reference" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary */}
        <div className="bg-primary/10 rounded-lg p-4 space-y-2 border border-primary/20">
          {discountValue > 0 && (
            <div className="flex justify-between text-sm text-green-500">
              <span>Discount:</span>
              <span>
                -{discountType === 'flat' ? `₹${discountValue}` : `${discountValue}%`}
              </span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold">
            <span>Collecting:</span>
            <span className="text-primary">₹{form.watch('amount')?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="btn-gradient" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Collect Payment
          </Button>
        </div>
      </form>
    </Form>
  );
};
