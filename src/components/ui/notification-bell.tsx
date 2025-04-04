import { useState } from "react";
import { Bell } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './dropdown-menu';
import { useNotification } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from './scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const {
    systemNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotification();

  const [open, setOpen] = useState(false);

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);

    // Find the notification to check if it has a link
    const notification = systemNotifications.find(n => n.id === id);
    if (notification?.link) {
      window.location.href = notification.link;
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[300px]">
          {systemNotifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            systemNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3 cursor-pointer",
                  !notification.isRead && "bg-muted/50"
                )}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-center w-full">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      notification.type === 'success' && "bg-success",
                      notification.type === 'error' && "bg-destructive",
                      notification.type === 'warning' && "bg-warning",
                      notification.type === 'info' && "bg-info"
                    )}
                  />
                  <span className="font-medium flex-1 truncate">{notification.title}</span>
                  {!notification.isRead && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 w-full truncate">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        <div className="text-xs text-center text-muted-foreground py-2 border-t border-border mt-1">
          {systemNotifications.length > 0 ? (
            <span>Click on a notification to mark it as read</span>
          ) : (
            <span>You're all caught up!</span>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
