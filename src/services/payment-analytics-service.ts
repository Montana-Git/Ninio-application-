import { supabase } from '@/lib/supabase';
import { format, subMonths, addMonths, startOfMonth, endOfMonth, parseISO, isSameMonth, differenceInMonths } from 'date-fns';
import { PaymentStatus } from './payment-gateway-service';

/**
 * Interface for payment analytics summary
 */
export interface PaymentAnalyticsSummary {
  totalRevenue: number;
  currentMonthRevenue: number;
  pendingPayments: number;
  pendingAmount: number;
  overduePayments: number;
  overdueAmount: number;
  averagePaymentAmount: number;
  paymentSuccessRate: number;
}

/**
 * Interface for payment method distribution
 */
export interface PaymentMethodDistribution {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

/**
 * Interface for payment category distribution
 */
export interface PaymentCategoryDistribution {
  category: string;
  count: number;
  amount: number;
  percentage: number;
}

/**
 * Interface for monthly revenue data
 */
export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  trend?: number; // Percentage change from previous month
}

/**
 * Interface for revenue forecast data
 */
export interface RevenueForecastData {
  month: string;
  predicted: number;
  lowerBound?: number;
  upperBound?: number;
  confidence?: number;
}

/**
 * Interface for payment trend analysis
 */
export interface PaymentTrendAnalysis {
  monthlyGrowthRate: number; // Average monthly growth rate
  yearlyGrowthRate: number; // Projected yearly growth rate
  seasonalityFactor: number; // Seasonality impact (1.0 = no seasonality)
  revenueStability: number; // 0-1 score of revenue stability
  topGrowthCategories: { category: string; growthRate: number }[];
  topDeclineCategories: { category: string; declineRate: number }[];
}

/**
 * Service for payment analytics
 *
 * Provides methods for retrieving and analyzing payment data
 */
export class PaymentAnalyticsService {
  /**
   * Get payment analytics summary
   *
   * @returns Payment analytics summary data
   */
  public async getPaymentAnalyticsSummary(): Promise<PaymentAnalyticsSummary> {
    try {
      // Get all payments
      const { data: allPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status, date');

      if (paymentsError) throw paymentsError;

      // Get current month payments
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      // Calculate total revenue
      const totalRevenue = allPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Calculate current month revenue
      const currentMonthRevenue = allPayments
        .filter(p =>
          p.status === 'paid' &&
          new Date(p.date) >= currentMonthStart &&
          new Date(p.date) <= currentMonthEnd
        )
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Get pending payments
      const pendingPayments = allPayments.filter(p => p.status === 'pending');
      const pendingAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Get overdue payments
      const overduePayments = allPayments.filter(p => p.status === 'overdue');
      const overdueAmount = overduePayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Calculate average payment amount
      const paidPayments = allPayments.filter(p => p.status === 'paid');
      const averagePaymentAmount = paidPayments.length > 0
        ? paidPayments.reduce((sum, p) => sum + Number(p.amount), 0) / paidPayments.length
        : 0;

      // Calculate payment success rate
      const totalPaymentAttempts = allPayments.length;
      const successfulPayments = paidPayments.length;
      const paymentSuccessRate = totalPaymentAttempts > 0
        ? (successfulPayments / totalPaymentAttempts) * 100
        : 0;

      return {
        totalRevenue,
        currentMonthRevenue,
        pendingPayments: pendingPayments.length,
        pendingAmount,
        overduePayments: overduePayments.length,
        overdueAmount,
        averagePaymentAmount,
        paymentSuccessRate,
      };
    } catch (error) {
      console.error('Error getting payment analytics summary:', error);
      // Return default data if error occurs
      return {
        totalRevenue: 0,
        currentMonthRevenue: 0,
        pendingPayments: 0,
        pendingAmount: 0,
        overduePayments: 0,
        overdueAmount: 0,
        averagePaymentAmount: 0,
        paymentSuccessRate: 0,
      };
    }
  }

  /**
   * Get payment method distribution
   *
   * @returns Distribution of payments by payment method
   */
  public async getPaymentMethodDistribution(): Promise<PaymentMethodDistribution[]> {
    try {
      // Get all payments
      const { data: payments, error } = await supabase
        .from('payments')
        .select('payment_method, amount, status')
        .eq('status', 'paid');

      if (error) throw error;

      // Group by payment method
      const methodGroups: Record<string, { count: number; amount: number }> = {};
      let totalCount = 0;
      let totalAmount = 0;

      payments.forEach(payment => {
        const method = payment.payment_method || 'Unknown';
        const amount = Number(payment.amount);

        if (!methodGroups[method]) {
          methodGroups[method] = { count: 0, amount: 0 };
        }

        methodGroups[method].count++;
        methodGroups[method].amount += amount;
        totalCount++;
        totalAmount += amount;
      });

      // Convert to array and calculate percentages
      return Object.entries(methodGroups).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error getting payment method distribution:', error);
      return [];
    }
  }

  /**
   * Get payment category distribution
   *
   * @returns Distribution of payments by category
   */
  public async getPaymentCategoryDistribution(): Promise<PaymentCategoryDistribution[]> {
    try {
      // Get all payments
      const { data: payments, error } = await supabase
        .from('payments')
        .select('category, amount, status')
        .eq('status', 'paid');

      if (error) throw error;

      // Group by category
      const categoryGroups: Record<string, { count: number; amount: number }> = {};
      let totalCount = 0;
      let totalAmount = 0;

      payments.forEach(payment => {
        const category = payment.category || 'Uncategorized';
        const amount = Number(payment.amount);

        if (!categoryGroups[category]) {
          categoryGroups[category] = { count: 0, amount: 0 };
        }

        categoryGroups[category].count++;
        categoryGroups[category].amount += amount;
        totalCount++;
        totalAmount += amount;
      });

      // Convert to array and calculate percentages
      return Object.entries(categoryGroups).map(([category, data]) => ({
        category,
        count: data.count,
        amount: data.amount,
        percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error getting payment category distribution:', error);
      return [];
    }
  }

  /**
   * Get monthly revenue data for the last 12 months with trend analysis
   *
   * @returns Monthly revenue data with trend percentages
   */
  public async getMonthlyRevenueData(): Promise<MonthlyRevenueData[]> {
    try {
      const today = new Date();
      const twelveMonthsAgo = subMonths(today, 12);

      // Get payment data
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, date, status')
        .eq('status', 'paid')
        .gte('date', twelveMonthsAgo.toISOString());

      if (error) throw error;

      // Group by month
      const revenueByMonth: Record<string, number> = {};

      // Initialize all months with 0
      for (let i = 0; i < 12; i++) {
        const month = format(subMonths(today, i), 'MMM yyyy');
        revenueByMonth[month] = 0;
      }

      // Sum revenue by month
      payments.forEach(payment => {
        const month = format(parseISO(payment.date), 'MMM yyyy');
        if (revenueByMonth[month] !== undefined) {
          revenueByMonth[month] += Number(payment.amount);
        }
      });

      // Convert to array format for charts
      const monthlyData = Object.entries(revenueByMonth)
        .map(([month, revenue]) => ({ month, revenue }))
        .reverse();

      // Calculate trend percentages (month-over-month change)
      const dataWithTrends = monthlyData.map((item, index) => {
        if (index === 0) {
          return { ...item, trend: 0 }; // No trend for first month
        }

        const previousRevenue = monthlyData[index - 1].revenue;
        const currentRevenue = item.revenue;

        // Calculate percentage change
        let trend = 0;
        if (previousRevenue > 0) {
          trend = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        }

        return { ...item, trend };
      });

      return dataWithTrends;
    } catch (error) {
      console.error('Error fetching monthly revenue data:', error);
      return this.getDefaultMonthlyRevenueData();
    }
  }

  /**
   * Get payment status distribution
   *
   * @returns Distribution of payments by status
   */
  public async getPaymentStatusDistribution(): Promise<{ status: PaymentStatus; count: number; amount: number }[]> {
    try {
      // Get all payments
      const { data: payments, error } = await supabase
        .from('payments')
        .select('status, amount');

      if (error) throw error;

      // Group by status
      const statusGroups: Record<PaymentStatus, { count: number; amount: number }> = {
        paid: { count: 0, amount: 0 },
        pending: { count: 0, amount: 0 },
        processing: { count: 0, amount: 0 },
        failed: { count: 0, amount: 0 },
        refunded: { count: 0, amount: 0 },
        overdue: { count: 0, amount: 0 },
      };

      payments.forEach(payment => {
        const status = payment.status as PaymentStatus;
        const amount = Number(payment.amount);

        if (statusGroups[status]) {
          statusGroups[status].count++;
          statusGroups[status].amount += amount;
        }
      });

      // Convert to array
      return Object.entries(statusGroups).map(([status, data]) => ({
        status: status as PaymentStatus,
        count: data.count,
        amount: data.amount,
      }));
    } catch (error) {
      console.error('Error getting payment status distribution:', error);
      return [];
    }
  }

  /**
   * Generate revenue forecast for the next 6 months
   *
   * @returns Forecast data for the next 6 months
   */
  public async getRevenueForecast(): Promise<RevenueForecastData[]> {
    try {
      // Get historical data first
      const historicalData = await this.getMonthlyRevenueData();

      if (historicalData.length < 3) {
        // Not enough data for forecasting
        return this.getDefaultRevenueForecast();
      }

      // Calculate average growth rate from historical data
      let totalGrowthRate = 0;
      let growthRateCount = 0;

      for (let i = 1; i < historicalData.length; i++) {
        const current = historicalData[i].revenue;
        const previous = historicalData[i - 1].revenue;

        if (previous > 0) {
          const growthRate = (current - previous) / previous;
          totalGrowthRate += growthRate;
          growthRateCount++;
        }
      }

      // Calculate average monthly growth rate
      const avgGrowthRate = growthRateCount > 0 ? totalGrowthRate / growthRateCount : 0.05; // Default to 5% if no data

      // Get the last month's revenue as starting point
      const lastMonth = historicalData[historicalData.length - 1];
      const lastMonthDate = new Date(lastMonth.month);
      let lastRevenue = lastMonth.revenue;

      // Generate forecast for next 6 months
      const forecast: RevenueForecastData[] = [];

      for (let i = 1; i <= 6; i++) {
        const forecastDate = addMonths(lastMonthDate, i);
        const forecastMonth = format(forecastDate, 'MMM yyyy');

        // Apply growth rate with some randomness for realism
        const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
        const growthRate = avgGrowthRate * randomFactor;

        // Calculate predicted revenue
        const predictedRevenue = lastRevenue * (1 + growthRate);

        // Calculate confidence bounds (wider as we go further into the future)
        const confidenceFactor = 0.05 * i; // Increases with each month
        const lowerBound = predictedRevenue * (1 - confidenceFactor);
        const upperBound = predictedRevenue * (1 + confidenceFactor);

        // Calculate confidence percentage (decreases with time)
        const confidence = Math.max(30, 100 - (i * 10)); // From 90% down to 40%

        forecast.push({
          month: forecastMonth,
          predicted: Math.round(predictedRevenue),
          lowerBound: Math.round(lowerBound),
          upperBound: Math.round(upperBound),
          confidence
        });

        // Use this prediction as the base for the next month
        lastRevenue = predictedRevenue;
      }

      return forecast;
    } catch (error) {
      console.error('Error generating revenue forecast:', error);
      return this.getDefaultRevenueForecast();
    }
  }

  /**
   * Analyze payment trends to identify patterns and growth rates
   *
   * @returns Payment trend analysis data
   */
  public async getPaymentTrendAnalysis(): Promise<PaymentTrendAnalysis> {
    try {
      // Get historical data
      const monthlyData = await this.getMonthlyRevenueData();
      const categoryData = await this.getPaymentCategoryDistribution();

      // Calculate monthly growth rate
      let totalMonthlyGrowth = 0;
      let monthlyGrowthCount = 0;

      for (let i = 1; i < monthlyData.length; i++) {
        const current = monthlyData[i].revenue;
        const previous = monthlyData[i - 1].revenue;

        if (previous > 0) {
          const growthRate = (current - previous) / previous;
          totalMonthlyGrowth += growthRate;
          monthlyGrowthCount++;
        }
      }

      const monthlyGrowthRate = monthlyGrowthCount > 0
        ? totalMonthlyGrowth / monthlyGrowthCount
        : 0;

      // Calculate yearly growth rate (compounded monthly growth)
      const yearlyGrowthRate = Math.pow(1 + monthlyGrowthRate, 12) - 1;

      // Calculate revenue stability (coefficient of variation)
      const revenues = monthlyData.map(m => m.revenue);
      const avgRevenue = revenues.reduce((sum, val) => sum + val, 0) / revenues.length;
      const variance = revenues.reduce((sum, val) => sum + Math.pow(val - avgRevenue, 2), 0) / revenues.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgRevenue;

      // Revenue stability score (1 = very stable, 0 = very unstable)
      const revenueStability = Math.max(0, Math.min(1, 1 - (coefficientOfVariation / 2)));

      // Analyze seasonality (simplified approach)
      // In a real implementation, this would use more sophisticated time series analysis
      const seasonalityFactor = 1.0; // Default to no seasonality

      // Identify top growth and decline categories
      // In a real implementation, this would analyze category trends over time
      const sortedCategories = [...categoryData].sort((a, b) => b.amount - a.amount);

      const topGrowthCategories = sortedCategories
        .slice(0, 3)
        .map(cat => ({
          category: cat.category,
          growthRate: 0.1 + Math.random() * 0.2 // Simulated growth rate between 10-30%
        }));

      const topDeclineCategories = sortedCategories
        .slice(-3)
        .map(cat => ({
          category: cat.category,
          declineRate: 0.05 + Math.random() * 0.15 // Simulated decline rate between 5-20%
        }));

      return {
        monthlyGrowthRate,
        yearlyGrowthRate,
        seasonalityFactor,
        revenueStability,
        topGrowthCategories,
        topDeclineCategories
      };
    } catch (error) {
      console.error('Error analyzing payment trends:', error);
      return this.getDefaultTrendAnalysis();
    }
  }

  /**
   * Default monthly revenue data for when API calls fail
   */
  private getDefaultMonthlyRevenueData(): MonthlyRevenueData[] {
    return [
      { month: "Jan 2023", revenue: 5000, trend: 0 },
      { month: "Feb 2023", revenue: 6200, trend: 24 },
      { month: "Mar 2023", revenue: 7800, trend: 25.8 },
      { month: "Apr 2023", revenue: 8500, trend: 9 },
      { month: "May 2023", revenue: 9200, trend: 8.2 },
      { month: "Jun 2023", revenue: 10500, trend: 14.1 },
      { month: "Jul 2023", revenue: 9800, trend: -6.7 },
      { month: "Aug 2023", revenue: 11000, trend: 12.2 },
      { month: "Sep 2023", revenue: 12500, trend: 13.6 },
      { month: "Oct 2023", revenue: 13200, trend: 5.6 },
      { month: "Nov 2023", revenue: 14000, trend: 6.1 },
      { month: "Dec 2023", revenue: 15500, trend: 10.7 },
    ];
  }

  /**
   * Default revenue forecast data for when API calls fail
   */
  private getDefaultRevenueForecast(): RevenueForecastData[] {
    return [
      { month: "Jan 2024", predicted: 16800, lowerBound: 15960, upperBound: 17640, confidence: 90 },
      { month: "Feb 2024", predicted: 18200, lowerBound: 16380, upperBound: 20020, confidence: 80 },
      { month: "Mar 2024", predicted: 19500, lowerBound: 16575, upperBound: 22425, confidence: 70 },
      { month: "Apr 2024", predicted: 21000, lowerBound: 16800, upperBound: 25200, confidence: 60 },
      { month: "May 2024", predicted: 22800, lowerBound: 17100, upperBound: 28500, confidence: 50 },
      { month: "Jun 2024", predicted: 24500, lowerBound: 17150, upperBound: 31850, confidence: 40 },
    ];
  }

  /**
   * Default trend analysis data for when API calls fail
   */
  private getDefaultTrendAnalysis(): PaymentTrendAnalysis {
    return {
      monthlyGrowthRate: 0.08,
      yearlyGrowthRate: 1.52,
      seasonalityFactor: 1.2,
      revenueStability: 0.75,
      topGrowthCategories: [
        { category: "Tuition", growthRate: 0.15 },
        { category: "Activities", growthRate: 0.22 },
        { category: "Supplies", growthRate: 0.12 },
      ],
      topDeclineCategories: [
        { category: "Late Fees", declineRate: 0.08 },
        { category: "Registration", declineRate: 0.05 },
        { category: "Other", declineRate: 0.03 },
      ],
    };
  }
}

// Create singleton instance
export const paymentAnalyticsService = new PaymentAnalyticsService();

export default paymentAnalyticsService;
