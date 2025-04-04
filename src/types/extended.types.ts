import { Database } from './database.types';

// Base types from database schema
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Child = Database["public"]["Tables"]["children"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type Facility = Database["public"]["Tables"]["facilities"]["Row"];
export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];

// Extended user preferences with additional properties
export interface ExtendedUserPreferences extends UserPreferences {
  language?: string;
}

// Extended types with additional properties
export interface ExtendedUser extends User {
  // Additional properties from auth.users metadata
  avatar_url?: string;
  phone?: string;
  address?: string;
  bio?: string;
  status?: string;
  children_names?: string[];
  children_count?: number;
}

export interface ExtendedChild extends Child {
  // Additional properties for child
  gender?: string;
  emergency_contact?: string;
  special_needs?: string;
  program_id?: string;
  birth_date?: string; // Alternative to date_of_birth for compatibility
}

export interface ExtendedPayment extends Omit<Payment, 'category'> {
  // Additional properties for payment display
  parentName?: string;
  childName?: string;
  category: string; // Make it required to match the database schema
}

export interface ExtendedEvent extends Event {
  // Additional properties for event display
  isPublic?: boolean;
}

// Type for notification
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  link?: string;
  description?: string;
  read?: boolean;
  created_at?: string;
}

// Type for creating a notification
export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  link?: string;
  description?: string;
  isRead?: boolean;
  userId: string;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'payment'
  | 'event'
  | 'activity';

// Type for due payment
export interface DuePayment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  description?: string;
}

// Type for payment status
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'overdue' | 'cancelled';

// Type for animation
export type AnimationType = 'none' | 'fade-in' | 'slide-in-right' | 'slide-in-left' | 'fade-in-up';

// Type for report data
export interface ReportData {
  columns: string[];
  rows: Record<string, string | number>[];
  summary?: Record<string, any>; // Allow complex summary data
  title: string;
  description: string;
  generatedAt: string;
}
