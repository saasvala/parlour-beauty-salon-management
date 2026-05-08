import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

const CustomerReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [reviewable, setReviewable] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('id, salon_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!customer) {
        setLoading(false);
        return;
      }
      setCustomerId(customer.id);
      setSalonId(customer.salon_id);

      const [{ data: existing }, { data: completed }] = await Promise.all([
        supabase
          .from('reviews')
          .select('*, appointment:appointments(appointment_date)')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('appointments')
          .select('id, appointment_date, salon:salons(name)')
          .eq('customer_id', customer.id)
          .eq('status', 'completed')
          .order('appointment_date', { ascending: false })
          .limit(20),
      ]);

      setReviews(existing || []);
      const reviewedIds = new Set((existing || []).map((r: any) => r.appointment_id));
      setReviewable((completed || []).filter((a: any) => !reviewedIds.has(a.id)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const submitReview = async () => {
    if (!customerId || !salonId || !target) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        customer_id: customerId,
        salon_id: salonId,
        appointment_id: target.id,
        rating,
        review: comment || null,
      });
      if (error) throw error;
      toast({ title: 'Review submitted', description: 'Thanks for your feedback!' });
      setOpen(false);
      setComment('');
      setRating(5);
      setTarget(null);
      load();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to submit', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const Stars = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          className="disabled:cursor-default"
        >
          <Star
            className={`w-5 h-5 ${n <= value ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground">Share your experience with completed appointments</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {reviewable.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3">Awaiting your review</h2>
                <div className="grid gap-3">
                  {reviewable.map((a) => (
                    <Card key={a.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{a.salon?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(a.appointment_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setTarget(a);
                            setOpen(true);
                          }}
                        >
                          Write Review
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-semibold mb-3">Your reviews</h2>
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Star className="w-12 h-12 opacity-50 mb-4" />
                    <p>No reviews yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {reviews.map((r) => (
                    <Card key={r.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Stars value={r.rating} />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(r.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {r.review && <p className="text-sm">{r.review}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">Your rating</p>
              <Stars value={rating} onChange={setRating} />
            </div>
            <Textarea
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitReview} disabled={saving}>
              {saving ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CustomerReviews;
