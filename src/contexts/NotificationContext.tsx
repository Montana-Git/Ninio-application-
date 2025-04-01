import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Notification,
  NotificationClose,
  NotificationTitle,
  NotificationDescription,
} from "@/components/ui/notification";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  showNotification: ({
    type,
    title,
    message,
    duration,
  }: {
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
  }) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => {},
  dismissNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = useCallback(
    ({
      type,
      title,
      message,
      duration = 5000,
    }: {
      type: NotificationType;
      title: string;
      message: string;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const notification = { id, type, title, message, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration !== Infinity) {
        setTimeout(() => {
          dismissNotification(id);
        }, duration);
      }
    },
    [],
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, showNotification, dismissNotification }}
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
