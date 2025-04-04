import { supabase } from "./supabase";
import { Database } from "@/types/database.types";
import { PaymentGatewayService, PaymentRequest, PaymentResponse, PaymentMethod, ReceiptData } from "@/services/payment-gateway-service";
import { generateSecurePassword } from "@/utils/security";
import { AuthError, NotFoundError, ValidationError, ApiError, PaymentError, handleApiError } from "@/utils/errors";

// Import extended types
import {
  User as BaseUser, Child as BaseChild, Activity as BaseActivity,
  Event as BaseEvent, Payment as BasePayment, Program as BaseProgram,
  Facility as BaseFacility, UserPreferences as BaseUserPreferences,
  ExtendedUser, ExtendedChild, ExtendedPayment, ExtendedEvent,
  ExtendedUserPreferences, PaymentStatus
} from '@/types/extended.types';

// Re-export types for use in other files
export type User = ExtendedUser;
export type Child = ExtendedChild;
export type Payment = ExtendedPayment;
export type Event = ExtendedEvent;
export type UserPreferences = ExtendedUserPreferences;

// Auth functions
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "parent" | "admin",
  childrenCount: number = 0,
  childrenNames: string[] = [],
) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
          children_count: childrenCount,
          children_names: childrenNames,
        },
      },
    });

    if (authError) throw authError;

    // Create user profile in public.users table
    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        children_count: childrenCount,
        children_names: childrenNames,
      });

      if (profileError) throw profileError;
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthError(
        error.message || 'Authentication failed',
        'AUTH_SIGNIN_ERROR',
        401
      );
    }

    return { data, error: null };
  } catch (error) {
    return handleApiError(error, { email });
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error };
  }
}

// User functions
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      throw new AuthError(
        authError.message || 'Failed to get current user',
        'AUTH_GET_USER_ERROR',
        401
      );
    }

    if (!user) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(
          'User profile not found',
          'USER_PROFILE_NOT_FOUND',
          404
        );
      }
      throw new ApiError(
        error.message || 'Failed to fetch user profile',
        error,
        'USER_FETCH_ERROR',
        500
      );
    }

    return { data, error: null };
  } catch (error) {
    return handleApiError(error, { context: 'getCurrentUser' });
  }
}

export async function getUsers(role?: "parent" | "admin") {
  try {
    let query = supabase.from("users").select("*");

    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query.order("last_name");
    return { data, error };
  } catch (error) {
    console.error("Error getting users:", error);
    return { data: null, error };
  }
}

export async function addUser(
  userData: Partial<ExtendedUser>,
  sendWelcomeEmail: boolean = false
) {
  try {
    // Generate a secure random password if not provided
    const password = generateSecurePassword(12, true);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email!,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
      },
    });

    if (authError) throw authError;

    // Create user profile in public.users table
    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        address: userData.address,
        status: userData.status || "active",
        created_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // TODO: Send welcome email with password if sendWelcomeEmail is true

      return { data: authData.user, error: null };
    }

    return { data: null, error: new Error("Failed to create user") };
  } catch (error) {
    console.error("Error adding user:", error);
    return { data: null, error };
  }
}

export async function deleteUser(userId: string) {
  try {
    // Delete user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    // Delete user from public.users table
    const { error: profileError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (profileError) throw profileError;

    return { data: { id: userId }, error: null };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { data: null, error };
  }
}

export async function updateUserProfile(
  userId: string,
  userData: Partial<ExtendedUser>,
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { data: null, error };
  }
}

// Alias for updateUserProfile to maintain compatibility with ParentsManagement component
export const updateUser = updateUserProfile;

export async function getUserPreferences(userId: string) {
  try {
    // First check if the table exists
    const { error: tableCheckError } = await supabase
      .from("user_preferences")
      .select("id")
      .limit(1);

    // If the table doesn't exist, return default preferences
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.warn('User preferences table does not exist yet.');
      return {
        data: {
          id: '',
          user_id: userId,
          email_notifications: true,
          activity_updates: true,
          payment_reminders: true,
          event_reminders: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      };
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // If no preferences found, return default preferences
    if (!data) {
      return {
        data: {
          id: '',
          user_id: userId,
          email_notifications: true,
          activity_updates: true,
          payment_reminders: true,
          event_reminders: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      };
    }

    return { data, error };
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return { data: null, error };
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<ExtendedUserPreferences>,
) {
  try {
    // First check if the table exists
    const { error: tableCheckError } = await supabase
      .from("user_preferences")
      .select("id")
      .limit(1);

    // If the table doesn't exist, return success without doing anything
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.warn('User preferences table does not exist yet.');
      return {
        data: {
          id: '',
          user_id: userId,
          ...preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      };
    }

    // Check if preferences exist
    const { data: existingPrefs } = await getUserPreferences(userId);

    let result;
    if (existingPrefs && existingPrefs.id) {
      // Update existing preferences
      result = await supabase
        .from("user_preferences")
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .maybeSingle();
    } else {
      // Create new preferences
      result = await supabase
        .from("user_preferences")
        .insert({
          user_id: userId,
          ...preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();
    }

    return result;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { data: null, error };
  }
}

// Children functions
export async function getChildren(parentId?: string) {
  try {
    let query = supabase.from("children").select("*");

    if (parentId) {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query.order("first_name");
    return { data, error };
  } catch (error) {
    console.error("Error getting children:", error);
    return { data: null, error };
  }
}

export async function addChild(
  childData: Partial<ExtendedChild>,
) {
  try {
    // Convert ExtendedChild to database schema
    const dbChildData = {
      parent_id: childData.parent_id,
      first_name: childData.first_name,
      last_name: childData.last_name,
      date_of_birth: childData.birth_date || childData.date_of_birth,
      age_group: childData.age_group || getAgeGroup(childData.birth_date || childData.date_of_birth),
      allergies: childData.allergies,
      special_notes: childData.special_needs || childData.special_notes
    };

    const { data, error } = await supabase
      .from("children")
      .insert(dbChildData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error adding child:", error);
    return { data: null, error };
  }
}

export async function updateChild(
  childId: string,
  childData: Partial<ExtendedChild>,
) {
  try {
    // Convert ExtendedChild to database schema
    const dbChildData = {
      parent_id: childData.parent_id,
      first_name: childData.first_name,
      last_name: childData.last_name,
      date_of_birth: childData.birth_date || childData.date_of_birth,
      age_group: childData.age_group || getAgeGroup(childData.birth_date || childData.date_of_birth),
      allergies: childData.allergies,
      special_notes: childData.special_needs || childData.special_notes,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("children")
      .update(dbChildData)
      .eq("id", childId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating child:", error);
    return { data: null, error };
  }
}

// Helper function to determine age group based on birth date
function getAgeGroup(birthDate: string | undefined): string {
  if (!birthDate) return 'Unknown';

  try {
    const today = new Date();
    const birth = new Date(birthDate);

    // Check if the date is valid
    if (isNaN(birth.getTime())) {
      console.warn(`Invalid birth date: ${birthDate}`);
      return 'Unknown';
    }

    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 +
                        today.getMonth() - birth.getMonth();

    if (ageInMonths < 12) return 'Infant (0-1)';
    if (ageInMonths < 36) return 'Toddler (1-3)';
    if (ageInMonths < 60) return 'Preschool (3-5)';
    return 'School-age (5+)';
  } catch (error) {
    console.error('Error calculating age group:', error);
    return 'Unknown';
  }
}

// Activities functions
export async function getActivities() {
  try {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("date", { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Error getting activities:", error);
    return { data: null, error };
  }
}

export async function getChildActivities(childId: string) {
  try {
    const { data, error } = await supabase.rpc("get_child_activities", {
      child_id: childId,
    });

    return { data, error };
  } catch (error) {
    console.error("Error getting child activities:", error);
    return { data: null, error };
  }
}

export async function addActivity(
  activityData: Database["public"]["Tables"]["activities"]["Insert"],
) {
  try {
    const { data, error } = await supabase
      .from("activities")
      .insert(activityData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error adding activity:", error);
    return { data: null, error };
  }
}

// Events functions
export async function getEvents() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    return { data, error };
  } catch (error) {
    console.error("Error getting events:", error);
    return { data: null, error };
  }
}

export async function addEvent(
  eventData: Database["public"]["Tables"]["events"]["Insert"],
) {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert({
        ...eventData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error adding event:", error);
    return { data: null, error };
  }
}

export async function updateEvent(
  eventId: string,
  eventData: Partial<Database["public"]["Tables"]["events"]["Update"]>,
) {
  try {
    const { data, error } = await supabase
      .from("events")
      .update({
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .select();

    return { data, error };
  } catch (error) {
    console.error("Error updating event:", error);
    return { data: null, error };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    return { data, error };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { data: null, error };
  }
}

// Payments functions

/**
 * Get all payments with optional filtering by parent ID
 *
 * @param parentId - Optional parent ID to filter payments
 * @param status - Optional payment status to filter by
 * @param startDate - Optional start date for date range filtering
 * @param endDate - Optional end date for date range filtering
 * @returns Array of payment records or error
 */
export async function getPayments(
  parentId?: string,
  status?: PaymentStatus,
  startDate?: string,
  endDate?: string
) {
  try {
    // Start with base query
    let query = supabase.from("payments").select("*");

    // Apply filters if provided
    if (parentId) {
      query = query.eq("parent_id", parentId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("date", startDate);
    }

    if (endDate) {
      query = query.lte("date", endDate);
    }

    // Execute query with ordering
    const { data, error } = await query.order("date", { ascending: false });
    return { data, error };
  } catch (error) {
    console.error("Error getting payments:", error);
    return { data: null, error };
  }
}

/**
 * Get payments for a specific parent with child information
 *
 * @param parentId - The parent ID to get payments for
 * @returns Array of payment records with child information
 */
export async function getParentPayments(parentId: string) {
  try {
    const { data, error } = await supabase.rpc("get_parent_payments", {
      parent_id: parentId,
    });

    return { data, error };
  } catch (error) {
    console.error("Error getting parent payments:", error);
    return { data: null, error };
  }
}

/**
 * Add a payment record to the database
 *
 * @param paymentData - The payment data to insert
 * @returns The inserted payment record or error
 */
export async function addPayment(
  paymentData: Database["public"]["Tables"]["payments"]["Insert"],
) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error adding payment:", error);
    return { data: null, error };
  }
}

/**
 * Process a payment through the payment gateway
 *
 * @param paymentRequest - The payment request details
 * @returns Payment response with transaction details
 */
export async function processPayment(paymentRequest: PaymentRequest): Promise<{
  data: PaymentResponse | null;
  error: any;
}> {
  try {
    // Validate payment request
    if (!paymentRequest.amount || paymentRequest.amount <= 0) {
      throw new ValidationError(
        'Invalid payment amount',
        { amount: 'Payment amount must be greater than zero' },
        'PAYMENT_VALIDATION_ERROR',
        400
      );
    }

    if (!paymentRequest.paymentMethod) {
      throw new ValidationError(
        'Payment method is required',
        { paymentMethod: 'Please select a payment method' },
        'PAYMENT_VALIDATION_ERROR',
        400
      );
    }

    // Process the payment through the payment gateway service
    const response = await PaymentGatewayService.processPayment(paymentRequest);

    if (response.success) {
      return { data: response, error: null };
    } else {
      throw new PaymentError(
        response.error || 'Payment processing failed',
        response.transactionId,
        'PAYMENT_PROCESSING_ERROR',
        400
      );
    }
  } catch (error) {
    return handleApiError(error, { paymentMethod: paymentRequest.paymentMethod });
  }
}

/**
 * Process a refund for a previous payment
 *
 * @param transactionId - The original transaction ID to refund
 * @param amount - Optional amount to refund (defaults to full amount)
 * @param reason - Optional reason for the refund
 * @returns Refund response with transaction details
 */
export async function processRefund(
  transactionId: string,
  amount?: number,
  reason?: string
): Promise<{
  data: PaymentResponse | null;
  error: any;
}> {
  try {
    // Process the refund through the payment gateway service
    const response = await PaymentGatewayService.processRefund(
      transactionId,
      amount,
      reason
    );

    if (response.success) {
      return { data: response, error: null };
    } else {
      return { data: null, error: response.error };
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    return { data: null, error };
  }
}

/**
 * Generate a receipt for a payment
 *
 * @param transactionId - The transaction ID to generate a receipt for
 * @returns Receipt data or error
 */
export async function generateReceipt(
  transactionId: string
): Promise<{
  data: ReceiptData | null;
  error: any;
}> {
  try {
    const receipt = await PaymentGatewayService.getReceipt(transactionId);
    return { data: receipt, error: null };
  } catch (error) {
    console.error("Error generating receipt:", error);
    return { data: null, error };
  }
}

/**
 * Get payment status
 *
 * @param transactionId - The transaction ID to check
 * @returns Payment status or error
 */
export async function getPaymentStatus(
  transactionId: string
): Promise<{
  status: PaymentStatus | null;
  error: any;
}> {
  try {
    return await PaymentGatewayService.getPaymentStatus(transactionId);
  } catch (error) {
    console.error("Error getting payment status:", error);
    return { status: null, error };
  }
}

/**
 * Update payment status
 *
 * @param paymentId - The payment ID to update
 * @param status - The new payment status
 * @returns Updated payment record or error
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus
) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { data: null, error };
  }
}

// Programs functions
export async function getPrograms(category?: string) {
  try {
    let query = supabase.from("programs").select("*");

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    console.error("Error getting programs:", error);
    return { data: null, error };
  }
}

// Facilities functions
export async function getFacilities() {
  try {
    const { data, error } = await supabase.from("facilities").select("*");

    return { data, error };
  } catch (error) {
    console.error("Error getting facilities:", error);
    return { data: null, error };
  }
}
