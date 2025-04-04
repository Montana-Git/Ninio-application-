import { supabase } from '@/lib/supabase';
import { CreateNotificationParams } from '@/types/extended.types';

import { NotificationType } from '@/types/extended.types';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt?: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  activityUpdates: boolean;
  paymentReminders: boolean;
  eventReminders: boolean;
}

/**
 * Service for managing user notifications
 */
export class NotificationService {
  /**
   * Create a new notification for a user
   */
  static async createNotification(notification: CreateNotificationParams): Promise<{ data: Notification | null, error: any }> {
    try {
      // Check if the notifications table exists
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('count')
        .limit(1)
        .single();

      // If the table doesn't exist, return a mock notification instead of an error
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.warn('Notifications table does not exist yet. This is expected if you haven\'t set it up.');
        // Return a mock notification with the data that was passed in
        const mockNotification: Notification = {
          id: `mock-${Date.now()}`,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: false,
          link: notification.link,
          createdAt: new Date().toISOString()
        };
        return { data: mockNotification, error: null };
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false,
          link: notification.link,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: data ? {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          message: data.message,
          type: data.type as NotificationType,
          isRead: data.is_read,
          link: data.link,
          createdAt: data.created_at
        } : null,
        error: null
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(userId: string): Promise<{ data: Notification[] | null, error: any }> {
    try {
      // Check if the notifications table exists
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('count')
        .limit(1)
        .single();

      // If the table doesn't exist, return an empty array instead of an error
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.warn('Notifications table does not exist yet. This is expected if you haven\'t set it up.');
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data ? data.map(item => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          message: item.message,
          type: item.type as NotificationType,
          isRead: item.is_read,
          link: item.link,
          createdAt: item.created_at
        })) : [],
        error: null
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty array instead of null to prevent UI errors
      return { data: [], error };
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<{ success: boolean, error: any }> {
    try {
      // Check if the notifications table exists
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('count')
        .limit(1)
        .single();

      // If the table doesn't exist, return success without doing anything
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.warn('Notifications table does not exist yet. This is expected if you haven\'t set it up.');
        return { success: true, error: null };
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<{ success: boolean, error: any }> {
    try {
      // Check if the notifications table exists
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('count')
        .limit(1)
        .single();

      // If the table doesn't exist, return success without doing anything
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.warn('Notifications table does not exist yet. This is expected if you haven\'t set it up.');
        return { success: true, error: null };
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<{ success: boolean, error: any }> {
    try {
      // Check if the notifications table exists
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('count')
        .limit(1)
        .single();

      // If the table doesn't exist, return success without doing anything
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.warn('Notifications table does not exist yet. This is expected if you haven\'t set it up.');
        return { success: true, error: null };
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user notification preferences
   */
  static async getNotificationPreferences(userId: string): Promise<{ data: NotificationPreferences | null, error: any }> {
    try {
      // Check if the user_preferences table exists
      const { error: tableCheckError } = await supabase
        .from('user_preferences')
        .select('id')
        .limit(1);

      // If the table doesn't exist, return default preferences
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.warn('User preferences table does not exist yet. This is expected if you haven\'t set it up.');
        // Return default preferences
        const defaultPreferences: NotificationPreferences = {
          userId,
          emailNotifications: true,
          activityUpdates: true,
          paymentReminders: true,
          eventReminders: true
        };
        return { data: defaultPreferences, error: null };
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // If no preferences found, return default preferences
        if (error.code === 'PGRST116') {
          const defaultPreferences: NotificationPreferences = {
            userId,
            emailNotifications: true,
            activityUpdates: true,
            paymentReminders: true,
            eventReminders: true
          };
          return { data: defaultPreferences, error: null };
        }
        throw error;
      }

      return {
        data: data ? {
          userId: data.user_id,
          emailNotifications: data.email_notifications,
          activityUpdates: data.activity_updates,
          paymentReminders: data.payment_reminders,
          eventReminders: data.event_reminders
        } : null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return { data: null, error };
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<{ success: boolean, error: any }> {
    try {
      // Check if the user_preferences table exists
      const { error: tableCheckError } = await supabase
        .from('user_preferences')
        .select('id')
        .limit(1);

      // If the table doesn't exist, return success without doing anything
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.warn('User preferences table does not exist yet. This is expected if you haven\'t set it up.');
        return { success: true, error: null };
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: preferences.userId,
          email_notifications: preferences.emailNotifications,
          activity_updates: preferences.activityUpdates,
          payment_reminders: preferences.paymentReminders,
          event_reminders: preferences.eventReminders,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error };
    }
  }
}
