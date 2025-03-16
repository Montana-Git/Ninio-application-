import { supabase } from "./supabase";
import { Database } from "@/types/database.types";

// Types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Child = Database["public"]["Tables"]["children"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type Facility = Database["public"]["Tables"]["facilities"]["Row"];
export type UserPreferences =
  Database["public"]["Tables"]["user_preferences"]["Row"];

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

    return { data, error };
  } catch (error) {
    console.error("Error signing in:", error);
    return { data: null, error };
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
    } = await supabase.auth.getUser();

    if (!user) return { data: null, error: null };

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { data: null, error };
  }
}

export async function updateUserProfile(
  userId: string,
  userData: Partial<User>,
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

export async function getUserPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return { data: null, error };
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
) {
  try {
    // Check if preferences exist
    const { data: existingPrefs } = await getUserPreferences(userId);

    let result;
    if (existingPrefs) {
      // Update existing preferences
      result = await supabase
        .from("user_preferences")
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();
    } else {
      // Create new preferences
      result = await supabase
        .from("user_preferences")
        .insert({
          user_id: userId,
          ...preferences,
        })
        .select()
        .single();
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
  childData: Database["public"]["Tables"]["children"]["Insert"],
) {
  try {
    const { data, error } = await supabase
      .from("children")
      .insert(childData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error adding child:", error);
    return { data: null, error };
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
      .insert(eventData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error adding event:", error);
    return { data: null, error };
  }
}

// Payments functions
export async function getPayments(parentId?: string) {
  try {
    let query = supabase.from("payments").select("*");

    if (parentId) {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query.order("date", { ascending: false });
    return { data, error };
  } catch (error) {
    console.error("Error getting payments:", error);
    return { data: null, error };
  }
}

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
