import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/api";
import { ExtendedUser } from "@/types/extended.types";
import { Session, createClient } from "@supabase/supabase-js";
import { AuthError, handleApiError } from "@/utils/errors";

type AuthContextType = {
  session: Session | null;
  user: ExtendedUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isParent: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "parent" | "admin",
    childrenCount?: number,
    childrenNames?: string[],
  ) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAdmin: false,
  isParent: false,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
});

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUser();
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUser();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getCurrentUser();
      if (error) {
        console.error("Error fetching user:", error);
        // If there's an authentication error, sign out the user
        if (error.code?.includes('AUTH_') || error.status === 401) {
          await signOut();
        }
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error("Unexpected error fetching user:", error);
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "parent" | "admin",
    childrenCount: number = 0,
    childrenNames: string[] = [],
  ) => {
    try {
      // First create the auth user
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
          emailRedirectTo: `${window.location.origin}/auth/login?verified=true`,
        },
      });

      if (authError) throw authError;

      // Create user profile in public.users table
      if (authData.user) {
        // Direct insert approach
        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role,
          children_count: childrenCount,
          children_names: childrenNames,
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("Error with direct insert:", insertError);

          // Try using the service role client if available
          const serviceRoleKey =
            import.meta.env.VITE_SUPABASE_SERVICE_KEY || "";
          if (serviceRoleKey) {
            // Create a new client with the service role key
            const supabaseAdmin = createClient(import.meta.env.VITE_SUPABASE_URL || "", serviceRoleKey);
            const { error: adminInsertError } = await supabaseAdmin
              .from("users")
              .insert({
                id: authData.user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                role,
                children_count: childrenCount,
                children_names: childrenNames,
                created_at: new Date().toISOString(),
              });

            if (adminInsertError) {
              throw new Error(
                "Failed to create user profile: " + adminInsertError.message,
              );
            }
          } else {
            throw new Error(
              "Failed to create user profile: " + insertError.message,
            );
          }
        }
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error("Error signing up:", error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new AuthError(
          'Email and password are required',
          'AUTH_MISSING_CREDENTIALS',
          400
        );
      }

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

      if (data.user) {
        try {
          const { data: profile, error: profileError } = await getCurrentUser();
          if (profileError) {
            console.error("Error fetching user profile:", profileError);
          } else {
            setUser(profile);
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Continue with sign-in even if profile fetch fails
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error signing in:", error);
      return handleApiError(error, { email });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
      // Always clear user state even if there's an error
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Unexpected error signing out:", error);
      // Force clear user state
      setUser(null);
      setSession(null);
    }
  };

  const isAdmin = user?.role === "admin";
  const isParent = user?.role === "parent";

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAdmin,
        isParent,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth, AuthProvider };
