import { useState } from 'react';
import { 
  getPayments, 
  getParentPayments, 
  processPayment, 
  processRefund,
  generateReceipt,
  getPaymentStatus,
  updatePaymentStatus
} from '@/lib/api';
import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus, 
  ReceiptData 
} from '@/services/payment-gateway-service';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for payment operations
 * 
 * Provides methods for processing payments, refunds, and managing payment data
 */
export function usePayments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Process a payment
   * 
   * @param paymentRequest - Payment request details
   * @returns Payment response or error
   */
  const handleProcessPayment = async (
    paymentRequest: Omit<PaymentRequest, 'parentId'> & { parentId?: string }
  ): Promise<{ data: PaymentResponse | null; error: string | null }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the current user's ID if parentId is not provided
      const parentId = paymentRequest.parentId || user?.id;
      
      if (!parentId) {
        throw new Error('Parent ID is required for payment processing');
      }
      
      // Process the payment
      const { data, error } = await processPayment({
        ...paymentRequest,
        parentId
      });
      
      if (error) {
        throw new Error(error.message || 'Payment processing failed');
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown payment error';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Process a refund
   * 
   * @param transactionId - Transaction ID to refund
   * @param amount - Optional amount to refund
   * @param reason - Optional reason for refund
   * @returns Refund response or error
   */
  const handleProcessRefund = async (
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<{ data: PaymentResponse | null; error: string | null }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await processRefund(transactionId, amount, reason);
      
      if (error) {
        throw new Error(error.message || 'Refund processing failed');
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown refund error';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get payment receipt
   * 
   * @param transactionId - Transaction ID to get receipt for
   * @returns Receipt data or error
   */
  const handleGetReceipt = async (
    transactionId: string
  ): Promise<{ data: ReceiptData | null; error: string | null }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await generateReceipt(transactionId);
      
      if (error) {
        throw new Error(error.message || 'Failed to generate receipt');
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating receipt';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get parent payments
   * 
   * @param parentId - Optional parent ID (uses current user if not provided)
   * @returns Array of payments or error
   */
  const handleGetParentPayments = async (parentId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the current user's ID if parentId is not provided
      const id = parentId || user?.id;
      
      if (!id) {
        throw new Error('Parent ID is required');
      }
      
      const { data, error } = await getParentPayments(id);
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch payments');
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching payments';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Update payment status
   * 
   * @param paymentId - Payment ID to update
   * @param status - New payment status
   * @returns Updated payment or error
   */
  const handleUpdatePaymentStatus = async (
    paymentId: string,
    status: PaymentStatus
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await updatePaymentStatus(paymentId, status);
      
      if (error) {
        throw new Error(error.message || 'Failed to update payment status');
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating payment status';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    processPayment: handleProcessPayment,
    processRefund: handleProcessRefund,
    getReceipt: handleGetReceipt,
    getParentPayments: handleGetParentPayments,
    updatePaymentStatus: handleUpdatePaymentStatus,
  };
}
