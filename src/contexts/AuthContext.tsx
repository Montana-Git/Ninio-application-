import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, getCurrentUser } from "@/lib/api";
import { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
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
    const { data, error } = await getCurrentUser();
    if (error) {
      console.error("Error fetching user:", error);
    } else {
      setUser(data);
    }
    setIsLoading(false);
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
            const supabaseAdmin = supabase.auth.admin;
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const { data: profile } = await getCurrentUser();
        setUser(profile);
      }

      return { data, error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
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
