import { supabase } from '@/lib/supabase';
import { isValidCreditCard, isValidExpiryDate, isValidCVV } from '@/utils/validation';
import { Database } from '@/types/database.types';
import analyticsService from './analytics-service';
import PaymentNotificationService from './payment-notification-service';
import { retry } from '@/utils/api';
import { PaymentError } from '@/utils/errors';

// Payment gateway types
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'paypal' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'overdue';

export interface PaymentRequest {
  parentId: string;
  childId?: string;
  amount: number;
  currency?: string;
  description: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardholderName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  receiptUrl?: string;
  status: PaymentStatus | string;
  error?: string;
  details?: Record<string, any>;
}

export interface ReceiptData {
  transactionId: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  status: string;
  customerName: string;
  customerEmail: string;
  parentName?: string; // Parent's name
  childName?: string;  // Child's name
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Service for processing payments through various payment gateways
 *
 * This is a mock implementation for demonstration purposes.
 * In a production environment, this would integrate with real payment gateways.
 */
export class PaymentGatewayService {
  private static defaultCurrency = 'USD';

  /**
   * Process a payment through the appropriate payment gateway
   *
   * @param paymentRequest - The payment request details
   * @returns Payment response with transaction details
   */
  public static async processPayment(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      // Log payment attempt
      console.log(`Processing payment of ${paymentRequest.amount} via ${paymentRequest.paymentMethod}`);

      // IMPORTANT: In a production environment, this would integrate with a real payment gateway
      // such as Stripe, PayPal, or Square. For now, we'll simulate the payment process.

      // Use retry logic for payment processing with timeout handling
      return await retry(
        async () => {
          // Simulate payment processing based on payment method
          let paymentResponse: PaymentResponse;

          // Add timeout handling
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new PaymentError('Payment processing timed out', undefined, 'PAYMENT_TIMEOUT', 408)), 15000);
          });

          // Actual payment processing
          const processingPromise = (async () => {
            switch (paymentRequest.paymentMethod) {
              case 'credit_card':
                paymentResponse = await this.processCreditCardPayment(paymentRequest);
                break;
              case 'bank_transfer':
                paymentResponse = await this.processBankTransferPayment(paymentRequest);
                break;
              case 'paypal':
                paymentResponse = await this.processPayPalPayment(paymentRequest);
                break;
              case 'cash':
                paymentResponse = await this.processCashPayment(paymentRequest);
                break;
              default:
                throw new Error(`Unsupported payment method: ${paymentRequest.paymentMethod}`);
            }

            // If payment was successful, save to database
            if (paymentResponse.success) {
              await this.savePaymentToDatabase(paymentRequest, paymentResponse);

              // Track successful payment in analytics
              analyticsService.trackPaymentSuccess(
                paymentRequest.amount,
                paymentRequest.paymentMethod,
                paymentResponse.transactionId || '',
                'tuition', // Default payment type
                {
                  description: paymentRequest.description,
                  childId: paymentRequest.childId
                }
              );

              // Send payment success notification
              // Note: Using sendAdminPaymentNotification as a fallback
              await PaymentNotificationService.sendAdminPaymentNotification(
                'Parent', // Placeholder, should be fetched from database
                paymentRequest.childId ? 'Child' : null, // Placeholder
                paymentRequest.amount,
                'paid' as PaymentStatus,
                paymentRequest.description
              );
            }

            // Track payment in analytics
            analyticsService.trackPayment(
              paymentRequest.amount,
              paymentRequest.paymentMethod,
              paymentRequest.description,
              paymentResponse.transactionId,
              paymentRequest.childId
            );

            // Send payment notification
            // Note: Using sendAdminPaymentNotification as a fallback
            if (paymentResponse.success) {
              await PaymentNotificationService.sendAdminPaymentNotification(
                'Parent', // Placeholder
                paymentRequest.childId ? 'Child' : null, // Placeholder
                paymentRequest.amount,
                paymentResponse.status as PaymentStatus,
                paymentRequest.description
              );
            }

            return paymentResponse;
          })();

          // Race between timeout and processing
          return Promise.race([processingPromise, timeoutPromise]);
        },
        {
          maxRetries: 2,
          initialDelay: 1000,
          retryableErrors: ['PAYMENT_TIMEOUT', 'NETWORK_ERROR', 408, 500, 502, 503, 504],
          onRetry: (error, attempt) => {
            console.warn(`Payment processing failed, retrying (${attempt}/2)...`, error);
          }
        }
      );
    } catch (error) {
      console.error('Error processing payment after retries:', error);

      // Handle payment failure
      const errorMessage = error instanceof Error ? error.message : 'Unknown payment error';

      // Track payment failure in analytics
      analyticsService.trackPaymentFailed(
        paymentRequest.amount,
        paymentRequest.paymentMethod,
        errorMessage,
        {
          description: paymentRequest.description,
          childId: paymentRequest.childId,
          ...paymentRequest.metadata
        }
      );

      // Send payment failure notification
      await PaymentNotificationService.sendPaymentFailure(
        paymentRequest.parentId,
        paymentRequest.amount,
        paymentRequest.description,
        errorMessage
      );

      // Get parent and child info for admin notification
      try {
        const { data: parent } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', paymentRequest.parentId)
          .single();

        let childName = null;
        if (paymentRequest.childId) {
          const { data: child } = await supabase
            .from('children')
            .select('first_name, last_name')
            .eq('id', paymentRequest.childId)
            .single();

          if (child) {
            childName = `${child.first_name} ${child.last_name}`;
          }
        }

        // Send admin notification
        if (parent) {
          const parentName = `${parent.first_name} ${parent.last_name}`;
          await PaymentNotificationService.sendAdminPaymentNotification(
            parentName,
            childName,
            paymentRequest.amount,
            'failed' as PaymentStatus,
            paymentRequest.description
          );
        }
      } catch (notificationError) {
        console.error('Error sending admin notification:', notificationError);
      }

      return {
        success: false,
        error: errorMessage,
        status: 'failed'
      };
    }
  }

  /**
   * Process a refund for a previous payment
   *
   * @param transactionId - The original transaction ID to refund
   * @param amount - The amount to refund (defaults to full amount)
   * @param reason - The reason for the refund
   * @returns Refund response with transaction details
   */
  public static async processRefund(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResponse> {
    try {
      // Get the original payment from the database
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      if (!payment) throw new Error(`Payment with ID ${transactionId} not found`);

      // IMPORTANT: In a production environment, this would call the payment gateway's
      // refund API. For now, we'll simulate the refund process.

      // Simulate refund processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the payment status in the database
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // Generate a refund transaction ID
      const refundTransactionId = `refund_${transactionId}_${Date.now()}`;

      // Track refund in analytics
      analyticsService.trackPaymentRefund(
        payment.amount,
        payment.payment_method as PaymentMethod,
        reason || 'Customer requested refund'
      );

      // Send refund notification
      await PaymentNotificationService.sendRefundNotification(
        payment.parent_id,
        payment.amount,
        payment.description,
        refundTransactionId
      );

      return {
        success: true,
        transactionId: refundTransactionId,
        status: 'refunded'
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown refund error',
        status: 'failed'
      };
    }
  }

  /**
   * Get payment status
   *
   * @param transactionId - The transaction ID to check
   * @returns Payment status information
   */
  public static async getPaymentStatus(transactionId: string): Promise<{ status: PaymentStatus | null; error: any }> {
    try {
      // Get the payment from the database
      const { data: payment, error } = await supabase
        .from('payments')
        .select('status')
        .eq('transaction_id', transactionId)
        .single();

      if (error) {
        console.error('Error fetching payment status:', error);
        return { status: null, error };
      }

      if (!payment) {
        return { status: null, error: 'Payment not found' };
      }

      return { status: payment.status as PaymentStatus, error: null };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return { status: null, error };
    }
  }

  /**
   * Get a receipt for a payment
   *
   * @param transactionId - The transaction ID to get the receipt for
   * @returns Receipt data
   */
  public static async getReceipt(transactionId: string): Promise<ReceiptData | null> {
    try {
      // Get the payment from the database
      const { data: payment, error } = await supabase
        .from('payments')
        .select(`
          *,
          users:parent_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      if (!payment) throw new Error(`Payment with ID ${transactionId} not found`);

      // Format the receipt data
      const receiptData: ReceiptData = {
        transactionId: payment.id,
        date: payment.created_at,
        amount: payment.amount,
        currency: payment.currency || this.defaultCurrency,
        description: payment.description,
        paymentMethod: this.formatPaymentMethod(payment.payment_method),
        status: payment.status,
        customerName: `${payment.users.first_name} ${payment.users.last_name}`,
        customerEmail: payment.users.email,
        items: [
          {
            name: payment.description,
            quantity: 1,
            price: payment.amount
          }
        ]
      };

      return receiptData;
    } catch (error) {
      console.error('Error getting receipt:', error);
      return null;
    }
  }

  /**
   * Process a credit card payment
   *
   * @param paymentRequest - The payment request details
   * @returns Payment response
   */
  private static async processCreditCardPayment(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    // IMPORTANT: In a production environment, this would integrate with a credit card processor
    // such as Stripe, Braintree, or Adyen. For now, we'll simulate the payment process.

    // Validate credit card details
    if (!paymentRequest.cardNumber || !paymentRequest.cardExpiry || !paymentRequest.cardCvv) {
      return {
        success: false,
        error: 'Missing credit card details',
        status: 'failed'
      };
    }

    // Validate card number format
    if (!isValidCreditCard(paymentRequest.cardNumber)) {
      return {
        success: false,
        error: 'Invalid credit card number',
        status: 'failed'
      };
    }

    // Validate expiry date
    if (!isValidExpiryDate(paymentRequest.cardExpiry)) {
      return {
        success: false,
        error: 'Invalid or expired card',
        status: 'failed'
      };
    }

    // Validate CVV
    if (!isValidCVV(paymentRequest.cardCvv)) {
      return {
        success: false,
        error: 'Invalid CVV code',
        status: 'failed'
      };
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate a fake transaction ID
    const transactionId = `cc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Generate a fake receipt URL
    const receiptUrl = `https://receipts.ninio.app/${transactionId}`;

    return {
      success: true,
      transactionId,
      receiptUrl,
      status: 'paid'
    };
  }

  /**
   * Process a bank transfer payment
   *
   * @param paymentRequest - The payment request details
   * @returns Payment response
   */
  private static async processBankTransferPayment(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    // IMPORTANT: In a production environment, this would integrate with a bank transfer processor
    // such as Plaid or similar. For now, we'll simulate the payment process.

    // Validate bank details
    if (!paymentRequest.accountName || !paymentRequest.accountNumber || !paymentRequest.routingNumber) {
      return {
        success: false,
        error: 'Missing bank account details',
        status: 'failed'
      };
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a fake transaction ID
    const transactionId = `bt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Generate a fake receipt URL
    const receiptUrl = `https://receipts.ninio.app/${transactionId}`;

    return {
      success: true,
      transactionId,
      receiptUrl,
      status: 'paid'
    };
  }

  /**
   * Process a PayPal payment
   *
   * @param paymentRequest - The payment request details
   * @returns Payment response
   */
  private static async processPayPalPayment(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    // IMPORTANT: In a production environment, this would integrate with the PayPal API
    // For now, we'll simulate the payment process.

    // Validate PayPal details
    if (!paymentRequest.email) {
      return {
        success: false,
        error: 'Missing PayPal email',
        status: 'failed'
      };
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Generate a fake transaction ID
    const transactionId = `pp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Generate a fake receipt URL
    const receiptUrl = `https://receipts.ninio.app/${transactionId}`;

    return {
      success: true,
      transactionId,
      receiptUrl,
      status: 'paid'
    };
  }

  /**
   * Save payment details to the database
   *
   * @param paymentRequest - The payment request
   * @param paymentResponse - The payment response
   */
  private static async savePaymentToDatabase(
    paymentRequest: PaymentRequest,
    paymentResponse: PaymentResponse
  ): Promise<void> {
    try {
      const { error } = await supabase.from('payments').insert({
        id: paymentResponse.transactionId,
        parent_id: paymentRequest.parentId,
        child_id: paymentRequest.childId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency || this.defaultCurrency,
        payment_method: paymentRequest.paymentMethod,
        status: paymentResponse.status,
        description: paymentRequest.description,
        receipt_url: paymentResponse.receiptUrl,
        metadata: paymentRequest.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving payment to database:', error);
      // We don't throw here to avoid failing the payment if only the database save fails
    }
  }

  /**
   * Format payment method for display
   *
   * @param method - The payment method
   * @returns Formatted payment method
   */
  /**
   * Process a cash payment
   *
   * @param paymentRequest - The payment request details
   * @returns Payment response
   */
  private static async processCashPayment(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    // Cash payments are marked as pending until confirmed by admin
    // This is because cash needs to be physically collected

    // Generate a transaction ID for the cash payment
    const transactionId = `cash_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Generate a receipt URL
    const receiptUrl = `https://receipts.ninio.app/${transactionId}`;

    return {
      success: true,
      transactionId,
      receiptUrl,
      status: 'pending', // Cash payments start as pending until confirmed
      details: {
        message: 'Cash payment recorded. Please pay at the front desk or to your child\'s teacher.'
      }
    };
  }

  private static formatPaymentMethod(method: string): string {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'paypal':
        return 'PayPal';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  }
}
