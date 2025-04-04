import { createContext, useContext, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import analyticsService from '@/services/analytics-service';
import { useAuth } from './AuthContext';

interface AnalyticsContextType {
  trackEvent: typeof analyticsService.trackEvent;
  trackFeatureUse: typeof analyticsService.trackFeatureUse;
  trackProgramView: typeof analyticsService.trackProgramView;
  trackActivityStart: typeof analyticsService.trackActivityStart;
  trackActivityComplete: typeof analyticsService.trackActivityComplete;
  trackPayment: typeof analyticsService.trackPayment;
  trackPaymentSuccess: typeof analyticsService.trackPaymentSuccess;
  trackPaymentFailed: typeof analyticsService.trackPaymentFailed;
  trackPaymentRefund: typeof analyticsService.trackPaymentRefund;
  trackError: typeof analyticsService.trackError;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Initialize analytics with user data when it changes
  useEffect(() => {
    analyticsService.init(user);
  }, [user]);

  // Track page views when location changes
  // This is disabled until analytics tables are created
  // useEffect(() => {
  //   analyticsService.trackPageView(location.pathname);
  // }, [location.pathname]);

  const value: AnalyticsContextType = {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackFeatureUse: analyticsService.trackFeatureUse.bind(analyticsService),
    trackProgramView: analyticsService.trackProgramView.bind(analyticsService),
    trackActivityStart: analyticsService.trackActivityStart.bind(analyticsService),
    trackActivityComplete: analyticsService.trackActivityComplete.bind(analyticsService),
    trackPayment: analyticsService.trackPayment.bind(analyticsService),
    trackPaymentSuccess: analyticsService.trackPaymentSuccess.bind(analyticsService),
    trackPaymentFailed: analyticsService.trackPaymentFailed.bind(analyticsService),
    trackPaymentRefund: analyticsService.trackPaymentRefund.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);

  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
};

export default AnalyticsContext;
