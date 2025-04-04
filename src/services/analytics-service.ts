import { supabase } from '@/lib/supabase';
import { User } from '@/lib/api';

// Analytics event types
export type EventType =
  | 'page_view'
  | 'login'
  | 'logout'
  | 'registration'
  | 'activity_start'
  | 'activity_complete'
  | 'program_view'
  | 'payment'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_refund'
  | 'profile_update'
  | 'search'
  | 'feature_use'
  | 'error';

// Analytics event data
export interface AnalyticsEvent {
  event_type: EventType;
  user_id?: string;
  user_role?: string;
  page_path?: string;
  component?: string;
  action?: string;
  target_id?: string;
  target_type?: string;
  value?: number;
  duration?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  session_id: string;
}

// Generate a unique session ID
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('ninio_session_id');

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('ninio_session_id', sessionId);
  }

  return sessionId;
};

/**
 * Analytics service for tracking user behavior and application usage
 */
class AnalyticsService {
  private sessionId: string;
  private user: User | null = null;
  private isEnabled: boolean = true;
  private eventQueue: AnalyticsEvent[] = [];
  private isProcessingQueue: boolean = false;
  private flushInterval: number = 10000; // 10 seconds
  private intervalId: number | null = null;

  constructor() {
    this.sessionId = getSessionId();
    // Disable analytics by default until tables are created
    this.isEnabled = false;
    this.setupFlushInterval();
  }

  /**
   * Initialize the analytics service with user data
   */
  public init(user: User | null): void {
    this.user = user;

    // Disable analytics completely until tables are created
    this.isEnabled = false;

    // Uncomment when analytics tables are created
    // const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS !== 'false';
    // this.setEnabled(analyticsEnabled);
    // if (this.isEnabled) {
    //   this.trackPageView(window.location.pathname);
    // }
  }

  /**
   * Enable or disable analytics tracking
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Track a page view event
   */
  public trackPageView(path: string): void {
    this.trackEvent('page_view', {
      page_path: path,
    });
  }

  /**
   * Track a user login event
   */
  public trackLogin(userId: string, userRole: string): void {
    this.trackEvent('login', {
      user_id: userId,
      user_role: userRole,
    });
  }

  /**
   * Track a user logout event
   */
  public trackLogout(): void {
    this.trackEvent('logout');
  }

  /**
   * Track a user registration event
   */
  public trackRegistration(userId: string, userRole: string): void {
    this.trackEvent('registration', {
      user_id: userId,
      user_role: userRole,
    });
  }

  /**
   * Track an activity start event
   */
  public trackActivityStart(activityId: string, activityType: string): void {
    this.trackEvent('activity_start', {
      target_id: activityId,
      target_type: activityType,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track an activity completion event
   */
  public trackActivityComplete(activityId: string, activityType: string, duration: number): void {
    this.trackEvent('activity_complete', {
      target_id: activityId,
      target_type: activityType,
      duration,
    });
  }

  /**
   * Track a program view event
   */
  public trackProgramView(programId: string): void {
    this.trackEvent('program_view', {
      target_id: programId,
      target_type: 'program',
    });
  }

  /**
   * Track a payment event
   *
   * @param amount - The payment amount
   * @param paymentMethod - The payment method used
   * @param description - Description of what the payment was for
   * @param transactionId - Optional transaction ID
   * @param childId - Optional child ID associated with the payment
   */
  public trackPayment(amount: number, paymentMethod: string, description: string, transactionId?: string, childId?: string): void {
    this.trackEvent('payment', {
      value: amount,
      action: paymentMethod,
      target_id: transactionId,
      target_type: 'payment',
      metadata: {
        description,
        childId
      },
    });
  }

  /**
   * Track a successful payment event
   *
   * @param amount - The payment amount
   * @param paymentMethod - The payment method used
   * @param transactionId - The transaction ID
   * @param paymentType - The type of payment (tuition, supplies, etc.)
   * @param metadata - Additional metadata about the payment
   */
  public trackPaymentSuccess(amount: number, paymentMethod: string, transactionId: string, paymentType: string, metadata?: Record<string, any>): void {
    this.trackEvent('payment_success', {
      value: amount,
      action: paymentMethod,
      target_id: transactionId,
      target_type: paymentType,
      metadata,
    });
  }

  /**
   * Track a failed payment event
   *
   * @param amount - The payment amount
   * @param paymentMethod - The payment method used
   * @param errorMessage - The error message
   * @param metadata - Additional metadata about the payment
   */
  public trackPaymentFailed(amount: number, paymentMethod: string, errorMessage: string, metadata?: Record<string, any>): void {
    this.trackEvent('payment_failed', {
      value: amount,
      action: paymentMethod,
      metadata: {
        errorMessage,
        ...metadata
      },
    });
  }

  /**
   * Track a payment refund event
   *
   * @param amount - The refund amount
   * @param originalTransactionId - The original transaction ID
   * @param reason - The reason for the refund
   * @param metadata - Additional metadata about the refund
   */
  public trackPaymentRefund(amount: number, originalTransactionId: string, reason?: string, metadata?: Record<string, any>): void {
    this.trackEvent('payment_refund', {
      value: amount,
      target_id: originalTransactionId,
      target_type: 'refund',
      metadata: {
        reason,
        ...metadata
      },
    });
  }

  /**
   * Track a feature use event
   */
  public trackFeatureUse(featureName: string, action: string, metadata?: Record<string, any>): void {
    this.trackEvent('feature_use', {
      component: featureName,
      action,
      metadata,
    });
  }

  /**
   * Track an error event
   */
  public trackError(errorMessage: string, errorCode?: string, component?: string): void {
    this.trackEvent('error', {
      component,
      metadata: {
        errorMessage,
        errorCode,
      },
    });
  }

  /**
   * Track a custom event
   */
  public trackEvent(
    eventType: EventType,
    data: Partial<AnalyticsEvent> = {}
  ): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      event_type: eventType,
      user_id: this.user?.id,
      user_role: this.user?.role,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      ...data,
    };

    // Add to queue
    this.eventQueue.push(event);

    // If queue is getting large, flush immediately
    if (this.eventQueue.length >= 10) {
      this.flushEvents();
    }
  }

  /**
   * Set up interval to flush events periodically
   */
  private setupFlushInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Flush events to the server
   */
  private async flushEvents(): Promise<void> {
    // Analytics is disabled until tables are created
    if (!this.isEnabled) return;

    if (this.isProcessingQueue || this.eventQueue.length === 0) return;

    this.isProcessingQueue = true;
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // This code is disabled until analytics tables are created
      // When tables are created, uncomment this code
      /*
      // Send events to Supabase
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToProcess);

      if (error) {
        console.error('Error sending analytics events:', error);
        // Put events back in queue
        this.eventQueue = [...eventsToProcess, ...this.eventQueue];
      }
      */
    } catch (error) {
      // Silently fail - analytics is disabled
    } finally {
      this.isProcessingQueue = false;
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

export default analyticsService;
