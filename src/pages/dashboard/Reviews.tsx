import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalon } from '@/hooks/useSalon';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Star, Eye, EyeOff, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewRow {
  id: string;
  rating: number;
  review: string | null;
  is_visible: boolean;
  created_at: string;
  customer?: { full_name: string } | null;
}

const ReviewsPage = () => {
  const { salonId } = useSalon();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!salonId) return;
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, review, is_visible, created_at, customer:customers(full_name)')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false });
    setReviews((data || []) as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [salonId]);

  const toggleVisibility = async (r: ReviewRow) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_visible: !r.is_visible })
      .eq('id', r.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: r.is_visible ? 'Hidden' : 'Now visible' });
      load();
    }
  };

  const handleDelete = async (r: ReviewRow) => {
    if (!confirm('Delete this review permanently?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', r.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Review deleted' });
      load();
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '–';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl">Reviews</h1>
            <p className="text-sm text-muted-foreground">
              {reviews.length} total · Average {avgRating} ★
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No reviews yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id} className={!r.is_visible ? 'opacity-60' : ''}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.customer?.full_name || 'Customer'}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < r.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      {!r.is_visible && <Badge variant="outline">Hidden</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {r.review && <p className="text-sm text-muted-foreground">{r.review}</p>}
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => toggleVisibility(r)}>
                      {r.is_visible ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" /> Show
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(r)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewsPage;
