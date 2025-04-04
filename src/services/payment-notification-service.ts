import { supabase } from '@/lib/supabase';
import { NotificationService } from './notification-service';
import { PaymentStatus } from './payment-gateway-service';

/**
 * Payment notification service
 *
 * Handles sending notifications related to payments
 */
export class PaymentNotificationService {
  // Use the NotificationService class directly

  /**
   * Send payment confirmation notification
   *
   * @param userId - User ID to send notification to
   * @param amount - Payment amount
   * @param description - Payment description
   * @param transactionId - Transaction ID
   */
  public static async sendPaymentConfirmation(
    userId: string,
    amount: number,
    description: string,
    transactionId: string
  ): Promise<void> {
    try {
      await NotificationService.createNotification({
        userId,
        title: 'Payment Successful',
        message: `Your payment of $${amount.toFixed(2)} for ${description} was successful.`,
        type: 'success',
        isRead: false,
        link: `/dashboard/parent/payments?receipt=${transactionId}`
      });
    } catch (error) {
      console.error('Error sending payment confirmation notification:', error);
    }
  }

  /**
   * Send payment failure notification
   *
   * @param userId - User ID to send notification to
   * @param amount - Payment amount
   * @param description - Payment description
   * @param errorMessage - Error message
   */
  public static async sendPaymentFailure(
    userId: string,
    amount: number,
    description: string,
    errorMessage: string
  ): Promise<void> {
    try {
      await NotificationService.createNotification({
        userId,
        title: 'Payment Failed',
        message: `Your payment of $${amount.toFixed(2)} for ${description} failed: ${errorMessage}`,
        type: 'error',
        isRead: false,
        link: '/dashboard/parent/payments'
      });
    } catch (error) {
      console.error('Error sending payment failure notification:', error);
    }
  }

  /**
   * Send payment refund notification
   *
   * @param userId - User ID to send notification to
   * @param amount - Refund amount
   * @param description - Payment description
   * @param transactionId - Transaction ID
   */
  public static async sendRefundNotification(
    userId: string,
    amount: number,
    description: string,
    transactionId: string
  ): Promise<void> {
    try {
      await NotificationService.createNotification({
        userId,
        title: 'Payment Refunded',
        message: `Your payment of $${amount.toFixed(2)} for ${description} has been refunded.`,
        type: 'info',
        isRead: false,
        link: `/dashboard/parent/payments?receipt=${transactionId}`
      });
    } catch (error) {
      console.error('Error sending refund notification:', error);
    }
  }

  /**
   * Send payment reminder notification
   *
   * @param userId - User ID to send notification to
   * @param amount - Payment amount
   * @param description - Payment description
   * @param dueDate - Due date
   */
  public static async sendPaymentReminder(
    userId: string,
    amount: number,
    description: string,
    dueDate: string
  ): Promise<void> {
    try {
      const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await NotificationService.createNotification({
        userId,
        title: 'Payment Reminder',
        message: `You have a payment of $${amount.toFixed(2)} for ${description} due on ${formattedDate}.`,
        type: 'warning',
        isRead: false,
        link: '/dashboard/parent/payments'
      });
    } catch (error) {
      console.error('Error sending payment reminder notification:', error);
    }
  }

  /**
   * Send payment overdue notification
   *
   * @param userId - User ID to send notification to
   * @param amount - Payment amount
   * @param description - Payment description
   * @param dueDate - Due date
   */
  public static async sendPaymentOverdueNotification(
    userId: string,
    amount: number,
    description: string,
    dueDate: string
  ): Promise<void> {
    try {
      const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await NotificationService.createNotification({
        userId,
        title: 'Payment Overdue',
        message: `Your payment of $${amount.toFixed(2)} for ${description} was due on ${formattedDate} and is now overdue.`,
        type: 'error',
        isRead: false,
        link: '/dashboard/parent/payments'
      });
    } catch (error) {
      console.error('Error sending payment overdue notification:', error);
    }
  }

  /**
   * Send admin payment notification
   *
   * @param parentName - Parent name
   * @param childName - Child name
   * @param amount - Payment amount
   * @param status - Payment status
   * @param description - Payment description
   */
  public static async sendAdminPaymentNotification(
    parentName: string,
    childName: string | null,
    amount: number,
    status: PaymentStatus,
    description: string
  ): Promise<void> {
    try {
      // Get admin users
      const { data: admins, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (error) throw error;

      // Determine notification type based on status
      let notificationType: 'success' | 'warning' | 'error' | 'info' = 'info';
      let title = 'New Payment';

      switch (status) {
        case 'paid':
          notificationType = 'success';
          title = 'Payment Received';
          break;
        case 'pending':
          notificationType = 'info';
          title = 'Payment Pending';
          break;
        case 'failed':
          notificationType = 'error';
          title = 'Payment Failed';
          break;
        case 'overdue':
          notificationType = 'warning';
          title = 'Payment Overdue';
          break;
      }

      // Create message
      const childInfo = childName ? ` for ${childName}` : '';
      const message = `${parentName} has ${status === 'paid' ? 'made' : 'attempted'} a payment of $${amount.toFixed(2)}${childInfo} for ${description}.`;

      // Send notification to all admins
      for (const admin of admins) {
        await NotificationService.createNotification({
          userId: admin.id,
          title,
          message,
          type: notificationType,
          isRead: false,
          link: '/dashboard/admin/payments'
        });
      }
    } catch (error) {
      console.error('Error sending admin payment notification:', error);
    }
  }
}

export default PaymentNotificationService;
