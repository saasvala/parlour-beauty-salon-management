import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { items, unreadCount, markAsRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.slice(0, 10).map((n) => (
                <li
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                    if (n.action_url) navigate(n.action_url);
                  }}
                  className={cn(
                    'p-3 cursor-pointer hover:bg-secondary/50 transition-colors',
                    !n.is_read && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => navigate('/notifications')}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
