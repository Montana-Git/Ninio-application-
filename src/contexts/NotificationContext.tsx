import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Notification,
  NotificationClose,
  NotificationTitle,
  NotificationDescription,
} from "@/components/ui/notification";
import { useAuth } from "./AuthContext";
import { NotificationService } from "@/services/notification-service";
import { NotificationType as ServiceNotificationType } from "@/types/extended.types";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  link?: string;
  isSystem?: boolean;
  isRead?: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  systemNotifications: NotificationItem[];
  unreadCount: number;
  showNotification: ({
    type,
    title,
    message,
    duration,
    link,
  }: {
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    link?: string;
  }) => void;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchUserNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  systemNotifications: [],
  unreadCount: 0,
  showNotification: () => {},
  dismissNotification: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  fetchUserNotifications: async () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // UI notifications (temporary, shown in the UI)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // System notifications (persistent, stored in the database)
  const [systemNotifications, setSystemNotifications] = useState<NotificationItem[]>([]);

  const { user } = useAuth();

  // Fetch user notifications when user changes
  useEffect(() => {
    if (user) {
      fetchUserNotifications();
    } else {
      setSystemNotifications([]);
    }
  }, [user]);

  // Calculate unread count
  const unreadCount = systemNotifications.filter(n => !n.isRead).length;

  // Fetch user notifications from the server
  const fetchUserNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await NotificationService.getUserNotifications(user.id);
      if (error) throw error;

      if (data) {
        const formattedNotifications = data.map(n => ({
          id: n.id || '',
          type: n.type as NotificationType,
          title: n.title,
          message: n.message,
          link: n.link,
          isSystem: true,
          isRead: n.isRead,
        }));

        setSystemNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Show a temporary UI notification
  const showNotification = useCallback(
    ({
      type,
      title,
      message,
      duration = 5000,
      link,
    }: {
      type: NotificationType;
      title: string;
      message: string;
      duration?: number;
      link?: string;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const notification = { id, type, title, message, duration, link };

      setNotifications((prev) => [...prev, notification]);

      if (duration !== Infinity) {
        setTimeout(() => {
          dismissNotification(id);
        }, duration);
      }

      // If user is logged in, also save this notification to the database
      if (user) {
        NotificationService.createNotification({
          userId: user.id,
          title,
          message,
          type: type as ServiceNotificationType,
          link,
        });
      }
    },
    [user],
  );

  // Dismiss a temporary UI notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  // Mark a system notification as read
  const markAsRead = async (id: string) => {
    try {
      const { success, error } = await NotificationService.markAsRead(id);
      if (error) throw error;

      if (success) {
        setSystemNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all system notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { success, error } = await NotificationService.markAllAsRead(user.id);
      if (error) throw error;

      if (success) {
        setSystemNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        systemNotifications,
        unreadCount,
        showNotification,
        dismissNotification,
        markAsRead,
        markAllAsRead,
        fetchUserNotifications
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Notification variant={notification.type}>
                <div className="flex-1">
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationDescription>
                    {notification.message}
                  </NotificationDescription>
                </div>
                <NotificationClose
                  onClick={() => dismissNotification(notification.id)}
                />
              </Notification>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
