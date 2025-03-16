export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean;
          activity_updates: boolean;
          payment_reminders: boolean;
          event_reminders: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_notifications?: boolean;
          activity_updates?: boolean;
          payment_reminders?: boolean;
          event_reminders?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_notifications?: boolean;
          activity_updates?: boolean;
          payment_reminders?: boolean;
          event_reminders?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          name: string;
          description: string;
          age_group: string;
          duration: string;
          date: string;
          image_url: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          age_group: string;
          duration: string;
          date: string;
          image_url?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          age_group?: string;
          duration?: string;
          date?: string;
          image_url?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      child_activities: {
        Row: {
          id: string;
          child_id: string;
          activity_id: string;
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          activity_id: string;
          date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          activity_id?: string;
          date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          age_group: string;
          allergies: string | null;
          special_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          age_group: string;
          allergies?: string | null;
          special_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          age_group?: string;
          allergies?: string | null;
          special_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          date: string;
          time: string;
          description: string;
          location: string;
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          time: string;
          description: string;
          location: string;
          type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          time?: string;
          description?: string;
          location?: string;
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      facilities: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string;
          features: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url: string;
          features: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          parent_id: string;
          child_id: string | null;
          amount: number;
          date: string;
          due_date: string | null;
          status: string;
          payment_type: string;
          payment_method: string | null;
          notes: string | null;
          category: string | null;
          receipt_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          child_id?: string | null;
          amount: number;
          date: string;
          due_date?: string | null;
          status: string;
          payment_type: string;
          payment_method?: string | null;
          notes?: string | null;
          category?: string | null;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          child_id?: string | null;
          amount?: number;
          date?: string;
          due_date?: string | null;
          status?: string;
          payment_type?: string;
          payment_method?: string | null;
          notes?: string | null;
          category?: string | null;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      programs: {
        Row: {
          id: string;
          title: string;
          age_group: string;
          schedule: string;
          description: string;
          image_url: string | null;
          category: string;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          age_group: string;
          schedule: string;
          description: string;
          image_url?: string | null;
          category: string;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          age_group?: string;
          schedule?: string;
          description?: string;
          image_url?: string | null;
          category?: string;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email: string;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_child_activities: {
        Args: {
          child_id: string;
        };
        Returns: {
          activity_id: string;
          activity_name: string;
          activity_description: string;
          activity_date: string;
          age_group: string;
          duration: string;
          image_url: string | null;
          category: string | null;
        }[];
      };
      get_parent_payments: {
        Args: {
          parent_id: string;
        };
        Returns: {
          payment_id: string;
          child_name: string;
          amount: number;
          date: string;
          due_date: string | null;
          status: string;
          payment_type: string;
          payment_method: string | null;
          category: string | null;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
