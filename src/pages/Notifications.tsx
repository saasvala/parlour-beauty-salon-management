import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { items, loading, unreadCount, markAsRead, markAllRead } = useNotifications();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.is_read) markAsRead(n.id);
                  if (n.action_url) navigate(n.action_url);
                }}
                className={cn(
                  'w-full text-left p-4 rounded-xl border bg-card hover:shadow-md transition-all',
                  !n.is_read && 'border-primary/40 bg-primary/5'
                )}
              >
                <div className="flex items-start gap-3">
                  {!n.is_read && <span className="mt-2 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(n.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
