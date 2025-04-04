import { supabase } from '@/lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

/**
 * Service for fetching and processing analytics data
 */
class AnalyticsDataService {
  /**
   * Get enrollment data for the last 6 months
   */
  public async getEnrollmentData() {
    try {
      const today = new Date();
      const sixMonthsAgo = subMonths(today, 6);

      // Get enrollment data from children table
      const { data, error } = await supabase
        .from('children')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (error) throw error;

      // Group by month
      const enrollmentByMonth: Record<string, number> = {};

      // Initialize all months with 0
      for (let i = 0; i < 6; i++) {
        const month = format(subMonths(today, i), 'MMM');
        enrollmentByMonth[month] = 0;
      }

      // Count enrollments by month
      data.forEach(item => {
        const month = format(parseISO(item.created_at), 'MMM');
        if (enrollmentByMonth[month] !== undefined) {
          enrollmentByMonth[month]++;
        }
      });

      // Convert to array format for charts
      return Object.entries(enrollmentByMonth)
        .map(([month, count]) => ({ month, count }))
        .reverse();
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
      return this.getDefaultEnrollmentData();
    }
  }

  /**
   * Get age group distribution data
   */
  public async getAgeGroupData() {
    try {
      // Get children data
      const { data, error } = await supabase
        .from('children')
        .select('age_group');

      if (error) throw error;

      // Count by age group
      const ageGroups: Record<string, number> = {};

      data.forEach(item => {
        const ageGroup = item.age_group || 'Unknown';
        ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
      });

      // Convert to array format for charts
      return Object.entries(ageGroups)
        .map(([name, value]) => ({ name, value }));
    } catch (error) {
      console.error('Error fetching age group data:', error);
      return this.getDefaultAgeGroupData();
    }
  }

  /**
   * Get revenue data for the last 6 months
   */
  public async getRevenueData() {
    try {
      const today = new Date();
      const sixMonthsAgo = subMonths(today, 6);

      // Get payment data
      const { data, error } = await supabase
        .from('payments')
        .select('amount, date')
        .gte('date', sixMonthsAgo.toISOString());

      if (error) throw error;

      // Group by month
      const revenueByMonth: Record<string, number> = {};

      // Initialize all months with 0
      for (let i = 0; i < 6; i++) {
        const month = format(subMonths(today, i), 'MMM');
        revenueByMonth[month] = 0;
      }

      // Sum revenue by month
      data.forEach(item => {
        const month = format(parseISO(item.date), 'MMM');
        if (revenueByMonth[month] !== undefined) {
          revenueByMonth[month] += Number(item.amount);
        }
      });

      // Convert to array format for charts
      return Object.entries(revenueByMonth)
        .map(([month, revenue]) => ({ month, revenue }))
        .reverse();
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return this.getDefaultRevenueData();
    }
  }

  /**
   * Get attendance data for the current week
   */
  public async getAttendanceData() {
    try {
      // In a real implementation, this would fetch from an attendance table
      // For now, return default data
      return this.getDefaultAttendanceData();
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return this.getDefaultAttendanceData();
    }
  }

  /**
   * Get activity participation data
   */
  public async getActivityParticipationData() {
    try {
      // Get activity data
      const { data, error } = await supabase
        .from('child_activities')
        .select('activities(category)');

      if (error) throw error;

      // Count by activity category
      const categories: Record<string, number> = {};

      data.forEach(item => {
        // Check if activities exists and has a category property
        if (item.activities && typeof item.activities === 'object') {
          const activity = item.activities as { category?: string };
          if (activity.category) {
            categories[activity.category] = (categories[activity.category] || 0) + 1;
          }
        }
      });

      // Convert to array format for charts
      return Object.entries(categories)
        .map(([name, value]) => ({ name, value }));
    } catch (error) {
      console.error('Error fetching activity participation data:', error);
      return this.getDefaultActivityParticipationData();
    }
  }

  /**
   * Get analytics summary data
   */
  public async getAnalyticsSummary() {
    try {
      // Get total children count
      const { count: childrenCount, error: childrenError } = await supabase
        .from('children')
        .select('*', { count: 'exact', head: true });

      if (childrenError) throw childrenError;

      // Get total revenue for current month
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      const { data: revenueData, error: revenueError } = await supabase
        .from('payments')
        .select('amount')
        .gte('date', currentMonthStart.toISOString())
        .lte('date', currentMonthEnd.toISOString());

      if (revenueError) throw revenueError;

      const monthlyRevenue = revenueData.reduce((sum, item) => sum + Number(item.amount), 0);

      // Get upcoming events count
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('date', new Date().toISOString());

      if (eventsError) throw eventsError;

      // Get attendance rate (mock data for now)
      const attendanceRate = 92;

      return {
        childrenCount: childrenCount || 0,
        monthlyRevenue,
        upcomingEvents: eventsCount || 0,
        attendanceRate,
      };
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return {
        childrenCount: 85,
        monthlyRevenue: 10500,
        upcomingEvents: 8,
        attendanceRate: 92,
      };
    }
  }

  /**
   * Get analytics data from analytics_events table
   */
  public async getAnalyticsEvents(eventType?: string, limit: number = 1000) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*');

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching analytics events:', error);
      return [];
    }
  }

  /**
   * Get page view analytics
   */
  public async getPageViewAnalytics() {
    try {
      const { data, error } = await supabase
        .from('analytics_page_views')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by page path
      const pageViews: Record<string, number> = {};

      data.forEach(item => {
        const path = item.page_path;
        pageViews[path] = (pageViews[path] || 0) + 1;
      });

      // Convert to array format for charts
      return Object.entries(pageViews)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error fetching page view analytics:', error);
      return [];
    }
  }

  /**
   * Default data for when API calls fail
   */
  private getDefaultEnrollmentData() {
    return [
      { month: "Jan", count: 12 },
      { month: "Feb", count: 15 },
      { month: "Mar", count: 18 },
      { month: "Apr", count: 20 },
      { month: "May", count: 22 },
      { month: "Jun", count: 25 },
    ];
  }

  private getDefaultAgeGroupData() {
    return [
      { name: "2-3 years", value: 15 },
      { name: "3-4 years", value: 25 },
      { name: "4-5 years", value: 30 },
      { name: "5-6 years", value: 10 },
    ];
  }

  private getDefaultRevenueData() {
    return [
      { month: "Jan", revenue: 5000 },
      { month: "Feb", revenue: 6200 },
      { month: "Mar", revenue: 7800 },
      { month: "Apr", revenue: 8500 },
      { month: "May", revenue: 9200 },
      { month: "Jun", revenue: 10500 },
    ];
  }

  private getDefaultAttendanceData() {
    return [
      { day: "Mon", present: 85, absent: 15 },
      { day: "Tue", present: 90, absent: 10 },
      { day: "Wed", present: 88, absent: 12 },
      { day: "Thu", present: 92, absent: 8 },
      { day: "Fri", present: 80, absent: 20 },
    ];
  }

  private getDefaultActivityParticipationData() {
    return [
      { name: "Art", value: 35 },
      { name: "Music", value: 25 },
      { name: "Sports", value: 20 },
      { name: "Reading", value: 15 },
      { name: "Science", value: 5 },
    ];
  }
}

// Create singleton instance
export const analyticsDataService = new AnalyticsDataService();

export default analyticsDataService;
