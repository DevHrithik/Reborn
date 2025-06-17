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
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          user_role: string | null;
          fitness_level: string | null;
          fitness_goals: string[] | null;
          date_of_birth: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level: string | null;
          age: number | null;
          location: string | null;
          gender: string | null;
          is_active: boolean | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          user_role?: string | null;
          fitness_level?: string | null;
          fitness_goals?: string[] | null;
          date_of_birth?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: string | null;
          age?: number | null;
          location?: string | null;
          gender?: string | null;
          is_active?: boolean | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          user_role?: string | null;
          fitness_level?: string | null;
          fitness_goals?: string[] | null;
          date_of_birth?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: string | null;
          age?: number | null;
          location?: string | null;
          gender?: string | null;
          is_active?: boolean | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          role: string;
          permissions: Json | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: string;
          permissions?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          permissions?: Json | null;
          created_at?: string;
        };
      };
      plans: {
        Row: {
          id: number;
          name: string;
          category: string;
          focus: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          category: string;
          focus: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          category?: string;
          focus?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: number;
          user_id: string;
          content: string;
          post_type: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          content: string;
          post_type: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          content?: string;
          post_type?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add more tables as needed...
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
