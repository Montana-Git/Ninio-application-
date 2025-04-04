import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { safeGet, safeParseDate, safeFormatDate } from '@/utils/data';
import { formatName, formatDate, transformArray } from '@/utils/transform';
import { ReportData } from '@/types/extended.types';

export type ReportType =
  | 'activities'
  | 'payments'
  | 'attendance'
  | 'children'
  | 'events';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  childId?: string;
  parentId?: string;
  status?: string;
  category?: string;
}

// Re-export the ReportFilter type for backward compatibility
export type { ReportData } from '@/types/extended.types';

/**
 * Service for generating reports from the database
 */
export class ReportService {
  /**
   * Generate a report based on the specified type and filters
   */
  static async generateReport(
    type: ReportType,
    filters: ReportFilter = {}
  ): Promise<{ data: ReportData | null; error: any }> {
    try {
      let data: ReportData | null = null;

      switch (type) {
        case 'activities':
          data = await this.generateActivitiesReport(filters);
          break;
        case 'payments':
          data = await this.generatePaymentsReport(filters);
          break;
        case 'attendance':
          data = await this.generateAttendanceReport(filters);
          break;
        case 'children':
          data = await this.generateChildrenReport(filters);
          break;
        case 'events':
          data = await this.generateEventsReport(filters);
          break;
        default:
          throw new Error(`Unsupported report type: ${type}`);
      }

      return { data, error: null };
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      return { data: null, error };
    }
  }

  /**
   * Generate a report on activities
   */
  private static async generateActivitiesReport(
    filters: ReportFilter
  ): Promise<ReportData> {
    let query = supabase
      .from('activities')
      .select(`
        id,
        name,
        description,
        age_group,
        duration,
        date,
        category
      `);

    // Apply filters
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Execute query
    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    // Format data for report
    const rows = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      ageGroup: item.age_group,
      duration: item.duration,
      date: format(new Date(item.date), 'PPP'),
      category: item.category || 'N/A'
    }));

    // Generate summary
    const categoryCounts: Record<string, number> = {};
    data.forEach(item => {
      const category = item.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return {
      columns: ['ID', 'Name', 'Description', 'Age Group', 'Duration', 'Date', 'Category'],
      rows,
      summary: {
        totalActivities: data.length,
        byCategory: categoryCounts as any
      },
      title: 'Activities Report',
      description: `Activities from ${filters.startDate ? format(new Date(filters.startDate), 'PPP') : 'all time'} to ${filters.endDate ? format(new Date(filters.endDate), 'PPP') : 'present'}`,
      generatedAt: format(new Date(), 'PPP p')
    };
  }

  /**
   * Generate a report on payments
   */
  private static async generatePaymentsReport(
    filters: ReportFilter
  ): Promise<ReportData> {
    let query = supabase
      .from('payments')
      .select(`
        id,
        parent_id,
        child_id,
        amount,
        date,
        due_date,
        status,
        payment_type,
        payment_method,
        category
      `);

    // Apply filters
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    if (filters.parentId) {
      query = query.eq('parent_id', filters.parentId);
    }

    if (filters.childId) {
      query = query.eq('child_id', filters.childId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Execute query
    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    // Format data for report
    const rows = data.map(item => ({
      id: item.id,
      parentId: item.parent_id,
      childId: item.child_id || 'N/A',
      amount: `$${item.amount.toFixed(2)}`,
      date: format(new Date(item.date), 'PPP'),
      dueDate: item.due_date ? format(new Date(item.due_date), 'PPP') : 'N/A',
      status: item.status,
      paymentType: item.payment_type,
      paymentMethod: item.payment_method || 'N/A',
      category: item.category || 'N/A'
    }));

    // Generate summary
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    data.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      typeCounts[item.payment_type] = (typeCounts[item.payment_type] || 0) + 1;
    });

    return {
      columns: ['ID', 'Parent ID', 'Child ID', 'Amount', 'Date', 'Due Date', 'Status', 'Type', 'Method', 'Category'],
      rows,
      summary: {
        totalPayments: data.length,
        totalAmount: `$${totalAmount.toFixed(2)}`,
        byStatus: statusCounts as any,
        byType: typeCounts as any
      },
      title: 'Payments Report',
      description: `Payments from ${filters.startDate ? format(new Date(filters.startDate), 'PPP') : 'all time'} to ${filters.endDate ? format(new Date(filters.endDate), 'PPP') : 'present'}`,
      generatedAt: format(new Date(), 'PPP p')
    };
  }

  /**
   * Generate a report on attendance
   */
  private static async generateAttendanceReport(
    filters: ReportFilter
  ): Promise<ReportData> {
    let query = supabase
      .from('child_activities')
      .select(`
        id,
        child_id,
        activity_id,
        date,
        notes,
        children:child_id(first_name, last_name),
        activities:activity_id(name)
      `);

    // Apply filters
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    if (filters.childId) {
      query = query.eq('child_id', filters.childId);
    }

    // Execute query
    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    // Format data for report
    const rows = transformArray(data, item => ({
      id: item.id,
      childId: item.child_id,
      childName: formatName(item.children, 'first_name', 'last_name', 'Unknown'),
      activityId: item.activity_id,
      activityName: safeGet(item.activities, 'name', 'Unknown'),
      date: formatDate(item.date, { year: 'numeric', month: 'long', day: 'numeric' }, 'en-US'),
      notes: item.notes || 'N/A'
    }));

    // Generate summary
    const childAttendance: Record<string, number> = {};
    const activityAttendance: Record<string, number> = {};

    data.forEach(item => {
      const childName = formatName(item.children, 'first_name', 'last_name', 'Unknown');
      const activityName = safeGet(item.activities, 'name', 'Unknown');

      childAttendance[childName] = (childAttendance[childName] || 0) + 1;
      activityAttendance[activityName] = (activityAttendance[activityName] || 0) + 1;
    });

    return {
      columns: ['ID', 'Child ID', 'Child Name', 'Activity ID', 'Activity Name', 'Date', 'Notes'],
      rows,
      summary: {
        totalAttendance: data.length,
        byChild: childAttendance as any,
        byActivity: activityAttendance as any
      },
      title: 'Attendance Report',
      description: `Attendance from ${filters.startDate ? format(new Date(filters.startDate), 'PPP') : 'all time'} to ${filters.endDate ? format(new Date(filters.endDate), 'PPP') : 'present'}`,
      generatedAt: format(new Date(), 'PPP p')
    };
  }

  /**
   * Generate a report on children
   */
  private static async generateChildrenReport(
    filters: ReportFilter
  ): Promise<ReportData> {
    let query = supabase
      .from('children')
      .select(`
        id,
        parent_id,
        first_name,
        last_name,
        date_of_birth,
        age_group,
        allergies,
        special_notes,
        parents:parent_id(first_name, last_name)
      `);

    // Apply filters
    if (filters.parentId) {
      query = query.eq('parent_id', filters.parentId);
    }

    // Execute query
    const { data, error } = await query.order('first_name');

    if (error) throw error;

    // Format data for report
    const rows = data.map(item => ({
      id: item.id,
      parentId: item.parent_id,
      parentName: formatName(item.parents, 'first_name', 'last_name', 'Unknown'),
      firstName: item.first_name,
      lastName: item.last_name,
      dateOfBirth: formatDate(item.date_of_birth, { year: 'numeric', month: 'long', day: 'numeric' }, 'en-US'),
      ageGroup: item.age_group,
      allergies: item.allergies || 'None',
      specialNotes: item.special_notes || 'None'
    }));

    // Generate summary
    const ageGroupCounts: Record<string, number> = {};
    const allergyCounts = {
      withAllergies: data.filter(item => item.allergies).length,
      withoutAllergies: data.filter(item => !item.allergies).length
    };

    data.forEach(item => {
      ageGroupCounts[item.age_group] = (ageGroupCounts[item.age_group] || 0) + 1;
    });

    return {
      columns: ['ID', 'Parent ID', 'Parent Name', 'First Name', 'Last Name', 'Date of Birth', 'Age Group', 'Allergies', 'Special Notes'],
      rows,
      summary: {
        totalChildren: data.length,
        byAgeGroup: ageGroupCounts as any,
        allergies: allergyCounts as any
      },
      title: 'Children Report',
      description: filters.parentId ? 'Children for specific parent' : 'All children',
      generatedAt: format(new Date(), 'PPP p')
    };
  }

  /**
   * Generate a report on events
   */
  private static async generateEventsReport(
    filters: ReportFilter
  ): Promise<ReportData> {
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        date,
        time,
        description,
        location,
        type
      `);

    // Apply filters
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    if (filters.category) {
      query = query.eq('type', filters.category);
    }

    // Execute query
    const { data, error } = await query.order('date');

    if (error) throw error;

    // Format data for report
    const rows = data.map(item => ({
      id: item.id,
      title: item.title,
      date: format(new Date(item.date), 'PPP'),
      time: item.time,
      description: item.description,
      location: item.location,
      type: item.type
    }));

    // Generate summary
    const typeCounts: Record<string, number> = {};
    const upcomingEvents = data.filter(item => new Date(item.date) >= new Date()).length;
    const pastEvents = data.length - upcomingEvents;

    data.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    return {
      columns: ['ID', 'Title', 'Date', 'Time', 'Description', 'Location', 'Type'],
      rows,
      summary: {
        totalEvents: data.length,
        upcomingEvents,
        pastEvents,
        byType: typeCounts as any
      },
      title: 'Events Report',
      description: `Events from ${filters.startDate ? format(new Date(filters.startDate), 'PPP') : 'all time'} to ${filters.endDate ? format(new Date(filters.endDate), 'PPP') : 'present'}`,
      generatedAt: format(new Date(), 'PPP p')
    };
  }

  /**
   * Export report data to CSV format
   */
  static exportToCsv(reportData: ReportData): string {
    const { columns, rows } = reportData;

    // Create header row
    let csv = columns.join(',') + '\n';

    // Add data rows
    rows.forEach(row => {
      const values = columns.map(column => {
        // Convert column name to camelCase property
        const prop = column.charAt(0).toLowerCase() +
          column.slice(1).replace(/\s+(.)/g, (_, c) => c.toUpperCase());

        // Get the value and escape it if it's a string
        const value = row[prop];
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma
          return value.includes(',') ?
            `"${value.replace(/"/g, '""')}"` :
            value;
        }
        return value;
      });

      csv += values.join(',') + '\n';
    });

    return csv;
  }
}
