import { createClient } from "@supabase/supabase-js";
import { getEnvVariable } from "@/utils/env";

// Get Supabase URL and API key from environment variables with validation
const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL', { required: true });
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY', { required: true });

// Validate that we have the required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. ' +
    'Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'are set in your environment variables.'
  );
}

// Create and export the Supabase client with custom options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'ninio-kindergarten',
    },
  },
});

// Function to seed data for testing
export async function seedTestData() {
  try {
    console.log("Seeding test data...");

    // Check if we already have users
    const { data: existingUsers, error: usersError } = await supabase
      .from("users")
      .select("id, role")
      .limit(5);

    if (usersError) {
      console.error("Error checking for existing users:", usersError);
      return { success: false, error: usersError };
    }

    // If we already have some users, don't seed
    if (existingUsers && existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing users, skipping seed.`);

      // Check if we have at least one admin and one parent
      const hasAdmin = existingUsers.some(user => user.role === 'admin');
      const hasParent = existingUsers.some(user => user.role === 'parent');

      if (!hasAdmin || !hasParent) {
        console.log("Missing required user roles, will create them.");
      } else {
        return { success: true, message: "Data already exists" };
      }
    }

    // Create a test parent if needed
    let parentId = null;
    const existingParent = existingUsers?.find(user => user.role === 'parent');

    if (!existingParent) {
      // Create a parent user directly in the users table
      const { data: parentData, error: parentError } = await supabase
        .from("users")
        .insert({
          id: crypto.randomUUID(), // Generate a UUID client-side
          first_name: "Test",
          last_name: "Parent",
          email: `testparent${Date.now()}@example.com`,
          role: "parent",
          children_count: 3,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (parentError) {
        console.error("Error creating test parent:", parentError);
        return { success: false, error: parentError };
      }

      parentId = parentData.id;
      console.log("Created test parent:", parentData);
    } else {
      parentId = existingParent.id;
    }

    // Create a test admin if needed
    const existingAdmin = existingUsers?.find(user => user.role === 'admin');

    if (!existingAdmin) {
      // Create an admin user directly in the users table
      const { data: adminData, error: adminError } = await supabase
        .from("users")
        .insert({
          id: crypto.randomUUID(), // Generate a UUID client-side
          first_name: "Test",
          last_name: "Admin",
          email: `testadmin${Date.now()}@example.com`,
          role: "admin",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (adminError) {
        console.error("Error creating test admin:", adminError);
        return { success: false, error: adminError };
      }

      console.log("Created test admin:", adminData);
    }

    // Check if we already have children for this parent
    if (parentId) {
      const { data: existingChildren, error: childrenError } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", parentId);

      if (childrenError) {
        console.error("Error checking for existing children:", childrenError);
        return { success: false, error: childrenError };
      }

      // If we already have children for this parent, don't create more
      if (existingChildren && existingChildren.length > 0) {
        console.log(`Found ${existingChildren.length} existing children for parent ${parentId}, skipping child creation.`);
        return { success: true, message: "Children already exist" };
      }

      // Create test children for the parent
      const testChildren = [
        {
          id: crypto.randomUUID(),
          parent_id: parentId,
          first_name: "Emma",
          last_name: "Smith",
          date_of_birth: "2018-05-15",
          age_group: "4-5",
          allergies: "Peanuts",
          special_notes: "Loves drawing",
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          parent_id: parentId,
          first_name: "Noah",
          last_name: "Johnson",
          date_of_birth: "2019-03-22",
          age_group: "3-4",
          allergies: "",
          special_notes: "Shy with new people",
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          parent_id: parentId,
          first_name: "Olivia",
          last_name: "Williams",
          date_of_birth: "2017-11-10",
          age_group: "5-6",
          allergies: "Dairy",
          special_notes: "Excellent at puzzles",
          created_at: new Date().toISOString(),
        }
      ];

      // Insert test children
      const { data, error } = await supabase
        .from("children")
        .insert(testChildren)
        .select();

      if (error) {
        console.error("Error creating test children:", error);
        return { success: false, error };
      }

      console.log("Created test children:", data);

      // Update parent's children_count
      const { error: updateError } = await supabase
        .from("users")
        .update({ children_count: testChildren.length })
        .eq("id", parentId);

      if (updateError) {
        console.error("Error updating parent's children count:", updateError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in seedTestData:", error);
    return { success: false, error };
  }
}
