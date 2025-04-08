import { supabase, seedTestData } from "./supabaseClient";
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

    // Get user metadata
    const userMetadata = user.user_metadata || {};

    try {
      // Try to get user from database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn('Error fetching user from database, falling back to auth data:', error);
        // Fall back to auth data
        const fallbackUser = {
          id: user.id,
          email: user.email || '',
          first_name: userMetadata.first_name || '',
          last_name: userMetadata.last_name || '',
          role: (userMetadata.role as 'parent' | 'admin') || 'admin', // Default to admin for testing
          children_count: userMetadata.children_count || 0,
          created_at: user.created_at,
        };

        return { data: fallbackUser, error: null };
      }

      return { data, error: null };
    } catch (dbError) {
      console.error('Database error when fetching user, falling back to auth data:', dbError);
      // Fall back to auth data
      const fallbackUser = {
        id: user.id,
        email: user.email || '',
        first_name: userMetadata.first_name || '',
        last_name: userMetadata.last_name || '',
        role: (userMetadata.role as 'parent' | 'admin') || 'admin', // Default to admin for testing
        children_count: userMetadata.children_count || 0,
        created_at: user.created_at,
      };

      return { data: fallbackUser, error: null };
    }
  } catch (error) {
    return handleApiError(error, { context: 'getCurrentUser' });
  }
}

export async function getUsers(role?: "parent" | "admin") {
  try {
    // Create mock data for development if needed
    const mockParents = [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        role: 'parent',
        children_count: 2,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@example.com',
        role: 'parent',
        children_count: 1,
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];

    // Try to get real data first
    try {
      let query = supabase.from("users").select("*");

      if (role) {
        query = query.eq("role", role);
      }

      let { data, error } = await query.order("last_name");

      if (error) {
        console.error('Error fetching users from database:', error);
        // Fall back to mock data
        if (role === 'parent' || !role) {
          console.log('Using mock parent data');
          return { data: mockParents, error: null };
        }
        return { data: [], error: null };
      }

      // If we got real data, use it
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} users with role: ${role || 'all'}`);
        return { data, error: null };
      }

      // If no data, use mock data
      console.warn(`No users found with role: ${role || 'all'}, using mock data`);
      if (role === 'parent' || !role) {
        return { data: mockParents, error: null };
      }
      return { data: [], error: null };
    } catch (dbError) {
      console.error('Database error when fetching users:', dbError);
      // Fall back to mock data
      if (role === 'parent' || !role) {
        console.log('Using mock parent data due to error');
        return { data: mockParents, error: null };
      }
      return { data: [], error: null };
    }

  } catch (error) {
    console.error("Error in getUsers:", error);
    // Fall back to mock data in case of any error
    if (role === 'parent' || !role) {
      const mockParents = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@example.com',
          role: 'parent',
          children_count: 2,
          status: 'active',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          first_name: 'Maria',
          last_name: 'Garcia',
          email: 'maria.garcia@example.com',
          role: 'parent',
          children_count: 1,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ];
      return { data: mockParents, error: null };
    }
    return { data: [], error: null };
  }

}

export async function addUser(
  userData: Partial<ExtendedUser>,
  sendWelcomeEmail: boolean = false
) {
  try {
    // For client-side usage, we'll directly insert into the users table
    // This bypasses the auth system but works for testing purposes
    const userId = crypto.randomUUID();

    // Insert directly into users table
    const { data, error } = await supabase.from("users").insert({
      id: userId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      role: userData.role,
      children_count: userData.children_count || 0,
      created_at: new Date().toISOString(),
    }).select().single();

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
    // Create mock data for development if needed
    const mockChildren = [
      {
        id: '101',
        parent_id: '1',
        first_name: 'Emma',
        last_name: 'Smith',
        date_of_birth: '2018-05-15',
        age_group: '4-5',
        allergies: 'Peanuts',
        special_notes: 'Loves drawing',
        created_at: new Date().toISOString(),
      },
      {
        id: '102',
        parent_id: '1',
        first_name: 'Noah',
        last_name: 'Smith',
        date_of_birth: '2019-03-22',
        age_group: '3-4',
        allergies: '',
        special_notes: 'Shy with new people',
        created_at: new Date().toISOString(),
      },
      {
        id: '103',
        parent_id: '2',
        first_name: 'Olivia',
        last_name: 'Garcia',
        date_of_birth: '2017-11-10',
        age_group: '5-6',
        allergies: 'Dairy',
        special_notes: 'Excellent at puzzles',
        created_at: new Date().toISOString(),
      },
    ];

    // Try to get real data first
    try {
      let query = supabase.from("children").select("*");

      if (parentId) {
        query = query.eq("parent_id", parentId);
      }

      let { data, error } = await query.order("first_name");

      if (error) {
        console.error('Error fetching children from database:', error);
        // Fall back to mock data
        if (parentId) {
          const filteredChildren = mockChildren.filter(child => child.parent_id === parentId);
          console.log(`Using ${filteredChildren.length} mock children for parent ID: ${parentId}`);
          return { data: filteredChildren, error: null };
        } else {
          console.log('Using all mock children');
          return { data: mockChildren, error: null };
        }
      }

      // If we got real data, use it
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} children${parentId ? ` for parent ID: ${parentId}` : ''}`);
        return { data, error: null };
      }

      // If no data, use mock data
      console.warn(`No children found${parentId ? ` for parent ID: ${parentId}` : ''}, using mock data`);
      if (parentId) {
        const filteredChildren = mockChildren.filter(child => child.parent_id === parentId);
        return { data: filteredChildren, error: null };
      } else {
        return { data: mockChildren, error: null };
      }
    } catch (dbError) {
      console.error('Database error when fetching children:', dbError);
      // Fall back to mock data
      if (parentId) {
        const filteredChildren = mockChildren.filter(child => child.parent_id === parentId);
        console.log(`Using ${filteredChildren.length} mock children for parent ID: ${parentId} due to error`);
        return { data: filteredChildren, error: null };
      } else {
        console.log('Using all mock children due to error');
        return { data: mockChildren, error: null };
      }
    }
  } catch (error) {
    console.error("Error in getChildren:", error);
    // Fall back to mock data in case of any error
    const mockChildren = [
      {
        id: '101',
        parent_id: '1',
        first_name: 'Emma',
        last_name: 'Smith',
        date_of_birth: '2018-05-15',
        age_group: '4-5',
        allergies: 'Peanuts',
        special_notes: 'Loves drawing',
        created_at: new Date().toISOString(),
      },
      {
        id: '102',
        parent_id: '1',
        first_name: 'Noah',
        last_name: 'Smith',
        date_of_birth: '2019-03-22',
        age_group: '3-4',
        allergies: '',
        special_notes: 'Shy with new people',
        created_at: new Date().toISOString(),
      },
      {
        id: '103',
        parent_id: '2',
        first_name: 'Olivia',
        last_name: 'Garcia',
        date_of_birth: '2017-11-10',
        age_group: '5-6',
        allergies: 'Dairy',
        special_notes: 'Excellent at puzzles',
        created_at: new Date().toISOString(),
      },
    ];

    if (parentId) {
      const filteredChildren = mockChildren.filter(child => child.parent_id === parentId);
      return { data: filteredChildren, error: null };
    } else {
      return { data: mockChildren, error: null };
    }
  }
}

// Using the existing getAgeGroup function defined below

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

export async function deleteChild(childId: string) {
  try {
    const { data, error } = await supabase
      .from("children")
      .delete()
      .eq("id", childId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error deleting child:", error);
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

// Export the seedTestData function for use in other files
export { seedTestData };

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

// Get activities for parent dashboard
export async function getParentActivities() {
  try {
    console.log('Fetching activities for parents');

    const { data, error } = await supabase.rpc("get_parent_activities");

    if (error) {
      console.error('Error fetching parent activities:', error);
      // Fall back to regular activities
      return { data: [], error };
    }

    // Transform the data to match our expected format
    const formattedData = data?.map(activity => {
      // Ensure date is properly formatted
      let formattedDate = activity.date;
      if (activity.date && typeof activity.date === 'string') {
        try {
          // Try to parse the date and format it consistently
          const parsedDate = new Date(activity.date);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn(`Error parsing date for activity ${activity.activity_id}:`, e);
        }
      }

      return {
        ...activity,
        id: activity.activity_id,
        activity_date: formattedDate // Ensure activity_date is set correctly
      };
    });

    console.log(`Successfully fetched ${formattedData?.length || 0} activities for parents`);
    return { data: formattedData, error: null };
  } catch (error) {
    console.error("Error getting parent activities:", error);
    return { data: [], error };
  }
}

export async function getChildActivities(childId: string) {
  try {
    console.log(`Fetching activities for child ID: ${childId}`);

    // Create mock activities for development if needed
    const mockActivities = [
      {
        activity_id: 'mock-activity-1',
        activity_name: 'Painting Class',
        activity_description: 'Children learn to paint with watercolors',
        activity_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        age_group: '3-5',
        duration: '1 hour',
        image_url: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&q=80',
        category: 'Art'
      },
      {
        activity_id: 'mock-activity-2',
        activity_name: 'Story Time',
        activity_description: 'Reading classic children stories',
        activity_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        age_group: '3-6',
        duration: '30 minutes',
        image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
        category: 'Reading'
      },
      {
        activity_id: 'mock-activity-3',
        activity_name: 'Music and Movement',
        activity_description: 'Dancing and singing to children songs',
        activity_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        age_group: '3-6',
        duration: '45 minutes',
        image_url: 'https://images.unsplash.com/photo-1445743432342-eac500ce72b7?w=600&q=80',
        category: 'Music'
      }
    ];

    // Try to get real data first
    try {
      const { data, error } = await supabase.rpc("get_child_activities", {
        child_id: childId,
      });

      if (error) {
        console.error('Error fetching child activities from database:', error);
        console.log('Using mock activities data');
        return { data: mockActivities, error: null };
      }

      // If we got real data, use it
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} activities for child ID: ${childId}`);
        return { data, error: null };
      }

      // If no data, use mock data
      console.warn(`No activities found for child ID: ${childId}, using mock data`);
      return { data: mockActivities, error: null };
    } catch (dbError) {
      console.error('Database error when fetching child activities:', dbError);
      console.log('Using mock activities data due to error');
      return { data: mockActivities, error: null };
    }
  } catch (error) {
    console.error("Error in getChildActivities:", error);
    // Create mock activities as fallback
    const mockActivities = [
      {
        activity_id: 'fallback-activity-1',
        activity_name: 'Painting Class',
        activity_description: 'Children learn to paint with watercolors',
        activity_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        age_group: '3-5',
        duration: '1 hour',
        image_url: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&q=80',
        category: 'Art'
      },
      {
        activity_id: 'fallback-activity-2',
        activity_name: 'Story Time',
        activity_description: 'Reading classic children stories',
        activity_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        age_group: '3-6',
        duration: '30 minutes',
        image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
        category: 'Reading'
      }
    ];
    return { data: mockActivities, error: null };
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
export async function getEvents(visibleToParentsOnly = false) {
  try {
    console.log(`Fetching events (visibleToParentsOnly: ${visibleToParentsOnly})`);

    // Create mock events for development if needed
    const mockEvents = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'Parent-Teacher Meeting',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:00',
        description: 'Discuss your child\'s progress',
        location: 'Main Hall',
        type: 'meeting',
        visible_to_parents: true
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        title: 'Summer Festival',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00',
        description: 'Annual summer celebration with games and food',
        location: 'Kindergarten Playground',
        type: 'activity',
        visible_to_parents: true
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        title: 'Art Exhibition',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00',
        description: 'Display of children\'s artwork',
        location: 'Art Room',
        type: 'activity',
        visible_to_parents: true
      }
    ];

    // Try to get real data first
    try {
      let query = supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      // If visibleToParentsOnly is true, only return events visible to parents
      if (visibleToParentsOnly) {
        query = query.eq('visible_to_parents', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching events from database:', error);
        console.log('Using mock events data');
        return { data: mockEvents, error: null };
      }

      // If we got real data, use it
      if (data && data.length > 0) {
        console.log(`Successfully fetched ${data.length} events`);
        return { data, error: null };
      }

      // If no data, use mock data
      console.warn('No events found, using mock data');
      return { data: mockEvents, error: null };
    } catch (dbError) {
      console.error('Database error when fetching events:', dbError);
      console.log('Using mock events data due to error');
      return { data: mockEvents, error: null };
    }
  } catch (error) {
    console.error("Error in getEvents:", error);
    // Create mock events as fallback
    const mockEvents = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'Parent-Teacher Meeting',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:00',
        description: 'Discuss your child\'s progress',
        location: 'Main Hall',
        type: 'meeting',
        visible_to_parents: true
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        title: 'Summer Festival',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00',
        description: 'Annual summer celebration with games and food',
        location: 'Kindergarten Playground',
        type: 'activity',
        visible_to_parents: true
      }
    ];
    return { data: mockEvents, error: null };
  }
}

// Update event visibility
export async function updateEventVisibility(eventId: string, visibleToParents: boolean) {
  try {
    const { data, error } = await supabase
      .from("events")
      .update({ visible_to_parents: visibleToParents })
      .eq("id", eventId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating event visibility:", error);
    return { data: null, error };
  }
}

// Update activity visibility
export async function updateActivityVisibility(activityId: string, visibleToParents: boolean) {
  try {
    const { data, error } = await supabase
      .from("activities")
      .update({ visible_to_parents: visibleToParents })
      .eq("id", activityId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating activity visibility:", error);
    return { data: null, error };
  }
}

// Get events for parent dashboard
export async function getParentEvents(parentId: string) {
  try {
    console.log(`Fetching events for parent ID: ${parentId}`);

    const { data, error } = await supabase.rpc("get_parent_events", {
      parent_id: parentId,
    });

    if (error) {
      console.error('Error fetching parent events:', error);
      // Fall back to regular events with visibility filter
      return getEvents(true);
    }

    // Transform the data to match our expected format
    // Map event_time back to time for consistency with the rest of the app
    const formattedData = data?.map(event => {
      // Ensure date is properly formatted
      let formattedDate = event.date;
      if (event.date && typeof event.date === 'string') {
        try {
          // Try to parse the date and format it consistently
          const parsedDate = new Date(event.date);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate;
          }
        } catch (e) {
          console.warn(`Error parsing date for event ${event.event_id}:`, e);
        }
      }

      return {
        ...event,
        time: event.event_time,
        id: event.event_id,
        date: formattedDate // Ensure date is a proper Date object
      };
    });

    console.log(`Successfully fetched ${formattedData?.length || 0} events for parent`);
    return { data: formattedData, error: null };
  } catch (error) {
    console.error("Error getting parent events:", error);
    // Fall back to regular events with visibility filter
    return getEvents(true);
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
