export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string;
          admin_id: string | null;
          created_at: string | null;
          details: Json | null;
          id: string;
          ip_address: unknown | null;
          resource_id: string | null;
          resource_type: string;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          admin_id?: string | null;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          ip_address?: unknown | null;
          resource_id?: string | null;
          resource_type: string;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string | null;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          ip_address?: unknown | null;
          resource_id?: string | null;
          resource_type?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_activity_logs_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_sessions: {
        Row: {
          admin_id: string | null;
          created_at: string | null;
          expires_at: string;
          id: string;
          ip_address: unknown | null;
          session_token: string;
          user_agent: string | null;
        };
        Insert: {
          admin_id?: string | null;
          created_at?: string | null;
          expires_at: string;
          id?: string;
          ip_address?: unknown | null;
          session_token: string;
          user_agent?: string | null;
        };
        Update: {
          admin_id?: string | null;
          created_at?: string | null;
          expires_at?: string;
          id?: string;
          ip_address?: unknown | null;
          session_token?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_sessions_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_users: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          is_active: boolean | null;
          last_login_at: string | null;
          password_hash: string;
          permissions: Json | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_login_at?: string | null;
          password_hash: string;
          permissions?: Json | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_login_at?: string | null;
          password_hash?: string;
          permissions?: Json | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      community_comments: {
        Row: {
          content: string;
          created_at: string | null;
          id: number;
          post_id: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: number;
          post_id: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: number;
          post_id?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'community_comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'community_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'community_comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      community_likes: {
        Row: {
          created_at: string | null;
          id: number;
          post_id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          post_id: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          post_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'community_likes_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'community_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'community_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      community_posts: {
        Row: {
          content: string;
          created_at: string | null;
          id: number;
          image_url: string | null;
          post_type: Database['public']['Enums']['post_type'];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: number;
          image_url?: string | null;
          post_type?: Database['public']['Enums']['post_type'];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: number;
          image_url?: string | null;
          post_type?: Database['public']['Enums']['post_type'];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'community_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      content_moderation: {
        Row: {
          content_id: string;
          content_type: string;
          created_at: string | null;
          id: string;
          moderator_id: string | null;
          notes: string | null;
          reason: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          content_id: string;
          content_type: string;
          created_at?: string | null;
          id?: string;
          moderator_id?: string | null;
          notes?: string | null;
          reason?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          content_id?: string;
          content_type?: string;
          created_at?: string | null;
          id?: string;
          moderator_id?: string | null;
          notes?: string | null;
          reason?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'content_moderation_moderator_id_fkey';
            columns: ['moderator_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users';
            referencedColumns: ['id'];
          },
        ];
      };
      support_chat_messages: {
        Row: {
          attachments: string[] | null;
          created_at: string | null;
          id: number;
          is_agent_message: boolean;
          message_text: string;
          sender_id: string;
          session_id: number;
          updated_at: string | null;
        };
        Insert: {
          attachments?: string[] | null;
          created_at?: string | null;
          id?: number;
          is_agent_message?: boolean;
          message_text: string;
          sender_id: string;
          session_id: number;
          updated_at?: string | null;
        };
        Update: {
          attachments?: string[] | null;
          created_at?: string | null;
          id?: number;
          is_agent_message?: boolean;
          message_text?: string;
          sender_id?: string;
          session_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'support_chat_messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'support_chat_messages_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'support_chat_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      support_chat_sessions: {
        Row: {
          assigned_agent_id: string | null;
          created_at: string | null;
          id: number;
          last_message_at: string | null;
          priority: string;
          status: string;
          subject: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          assigned_agent_id?: string | null;
          created_at?: string | null;
          id?: number;
          last_message_at?: string | null;
          priority?: string;
          status?: string;
          subject?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          assigned_agent_id?: string | null;
          created_at?: string | null;
          id?: number;
          last_message_at?: string | null;
          priority?: string;
          status?: string;
          subject?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'support_chat_sessions_assigned_agent_id_fkey';
            columns: ['assigned_agent_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'support_chat_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          activity_level: string | null;
          age: number | null;
          avatar_url: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          email: string;
          fitness_goals: string[] | null;
          fitness_level: string | null;
          full_name: string | null;
          gender: string | null;
          height_cm: number | null;
          id: string;
          is_active: boolean | null;
          last_login_at: string | null;
          location: string | null;
          updated_at: string | null;
          user_role: string | null;
          weight_kg: number | null;
        };
        Insert: {
          activity_level?: string | null;
          age?: number | null;
          avatar_url?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          email: string;
          fitness_goals?: string[] | null;
          fitness_level?: string | null;
          full_name?: string | null;
          gender?: string | null;
          height_cm?: number | null;
          id: string;
          is_active?: boolean | null;
          last_login_at?: string | null;
          location?: string | null;
          updated_at?: string | null;
          user_role?: string | null;
          weight_kg?: number | null;
        };
        Update: {
          activity_level?: string | null;
          age?: number | null;
          avatar_url?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          email?: string;
          fitness_goals?: string[] | null;
          fitness_level?: string | null;
          full_name?: string | null;
          gender?: string | null;
          height_cm?: number | null;
          id?: string;
          is_active?: boolean | null;
          last_login_at?: string | null;
          location?: string | null;
          updated_at?: string | null;
          user_role?: string | null;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
      // Add other tables as needed for workouts, nutrition, etc.
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
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      post_type: 'milestone' | 'tip' | 'celebration' | 'question' | 'sharing';
      meal_plan_type: 'Cutting' | 'Maintaining' | 'Bulking';
      plan_category: 'Beginner' | 'Intermediate' | 'Advanced';
      plan_focus: 'Fat Burning' | 'Muscle Building' | 'Combo Plan' | 'General';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
