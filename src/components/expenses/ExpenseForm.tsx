import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSalon } from '@/hooks/useSalon';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload, X } from 'lucide-react';
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Products & Supplies',
  'Equipment',
  'Marketing',
  'Maintenance',
  'Insurance',
  'Taxes',
  'Miscellaneous',
];

interface ExpenseFormProps {
  expense?: any;
  onClose: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onClose }) => {
  const { salonId } = useSalon();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(expense?.receipt_url || null);

  const [formData, setFormData] = useState({
    category: expense?.category || '',
    amount: expense?.amount?.toString() || '',
    description: expense?.description || '',
    expense_date: expense?.expense_date || format(new Date(), 'yyyy-MM-dd'),
    payment_method: expense?.payment_method || 'cash',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Error', description: 'File size must be under 5MB', variant: 'destructive' });
        return;
      }
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId || !user) return;

    if (!formData.category || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast({ title: 'Validation Error', description: 'Please fill in category and a valid amount', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      let receiptUrl = expense?.receipt_url || null;

      // Upload receipt if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const filePath = `${salonId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);
        receiptUrl = urlData.publicUrl;
      }

      const expenseData = {
        salon_id: salonId,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        expense_date: formData.expense_date,
        payment_method: formData.payment_method as any,
        receipt_url: receiptUrl,
        created_by: user.id,
      };

      if (expense?.id) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expense.id);
        if (error) throw error;
        toast({ title: 'Updated', description: 'Expense updated successfully' });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData);
        if (error) throw error;
        toast({ title: 'Added', description: 'Expense recorded successfully' });
      }

      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Amount (₹) *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.expense_date}
            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter expense details..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Receipt</Label>
        {receiptPreview ? (
          <div className="relative inline-block">
            <img src={receiptPreview} alt="Receipt" className="h-32 rounded-lg border border-border object-cover" />
            <button
              type="button"
              onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-2 p-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              <span className="text-sm">Click to upload receipt (max 5MB)</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="btn-gradient" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};
