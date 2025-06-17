import { createClient } from '@/lib/supabase/client';

export interface User {
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
  is_active: boolean | null;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  age: number | null;
  location: string | null;
  gender: string | null;

  // Computed fields
  status: 'active' | 'inactive' | 'suspended';
  lastActiveDate: string | null;
  membershipDuration: string;
  engagementScore: number;
}

export interface UserFilters {
  search?: string;
  fitnessLevel?: string[];
  activityLevel?: string[];
  isActive?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  location?: string;
  gender?: string;
}

export interface UserActions {
  activate: (userId: string) => Promise<boolean>;
  deactivate: (userId: string) => Promise<boolean>;
  resetPassword: (userId: string) => Promise<boolean>;
  sendNotification: (userId: string, message: string) => Promise<boolean>;
  exportData: (userId: string) => Promise<any>;
  bulkAction: (userIds: string[], action: string) => Promise<boolean>;
}

export class UserService {
  private supabase = createClient();

  async getUsers(
    filters?: UserFilters,
    pagination?: { page: number; limit: number }
  ): Promise<{ users: User[]; total: number }> {
    try {
      let query = this.supabase.from('users').select('*');

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (filters?.fitnessLevel?.length) {
        query = query.in('fitness_level', filters.fitnessLevel);
      }

      if (filters?.activityLevel?.length) {
        query = query.in('activity_level', filters.activityLevel);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.gender) {
        query = query.eq('gender', filters.gender);
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      // Apply pagination
      if (pagination) {
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data: users, error, count } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        return { users: [], total: 0 };
      }

      // Transform data and add computed fields
      const transformedUsers: User[] = (users || []).map(user =>
        this.transformUser(user)
      );

      return {
        users: transformedUsers,
        total: count || users?.length || 0,
      };
    } catch (error) {
      console.error('Error in getUsers:', error);
      return { users: [], total: 0 };
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !user) {
        console.error('Error fetching user:', error);
        return null;
      }

      return this.transformUser(user);
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  async getUserActivity(userId: string): Promise<any[]> {
    try {
      // Get user's workout sessions, community posts, etc.
      const [workouts, posts] = await Promise.all([
        this.supabase
          .from('user_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),

        this.supabase
          .from('community_posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const activity = [
        ...(workouts.data || []).map(workout => ({
          type: 'workout',
          title: `Workout Plan: ${workout.plan_id}`,
          timestamp: workout.created_at,
          status: workout.status || 'active',
        })),
        ...(posts.data || []).map(post => ({
          type: 'community',
          title: `Community Post: ${post.content?.slice(0, 50)}...`,
          timestamp: post.created_at,
          status: post.status,
        })),
      ];

      return activity.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        return false;
      }

      // Log admin action
      await this.logAdminAction('user_update', userId, updates);
      return true;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return false;
    }
  }

  async activateUser(userId: string): Promise<boolean> {
    return this.updateUser(userId, { is_active: true });
  }

  async deactivateUser(userId: string): Promise<boolean> {
    return this.updateUser(userId, { is_active: false });
  }

  async resetUserPassword(userId: string): Promise<boolean> {
    try {
      // In a real implementation, this would trigger a password reset email
      // For now, we'll just log the action
      await this.logAdminAction('password_reset', userId, {
        action: 'reset_password',
      });
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  async sendNotification(userId: string, message: string): Promise<boolean> {
    try {
      // In a real implementation, this would send a push notification or email
      // For now, we'll log the action
      await this.logAdminAction('notification_sent', userId, { message });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async exportUserData(userId: string): Promise<any> {
    try {
      const user = await this.getUserById(userId);
      const activity = await this.getUserActivity(userId);

      const exportData = {
        user,
        activity,
        exportedAt: new Date().toISOString(),
        exportedBy: 'admin', // Should come from auth context
      };

      await this.logAdminAction('data_export', userId, { exported: true });
      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  async bulkAction(userIds: string[], action: string): Promise<boolean> {
    try {
      const results = await Promise.all(
        userIds.map(async userId => {
          switch (action) {
            case 'activate':
              return this.activateUser(userId);
            case 'deactivate':
              return this.deactivateUser(userId);
            case 'reset_password':
              return this.resetUserPassword(userId);
            default:
              return false;
          }
        })
      );

      const successCount = results.filter(result => result).length;
      await this.logAdminAction('bulk_action', 'multiple', {
        action,
        userCount: userIds.length,
        successCount,
      });

      return successCount === userIds.length;
    } catch (error) {
      console.error('Error in bulk action:', error);
      return false;
    }
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    byFitnessLevel: Record<string, number>;
    byLocation: Record<string, number>;
  }> {
    try {
      const { data: users } = await this.supabase.from('users').select('*');

      if (!users)
        return {
          total: 0,
          active: 0,
          inactive: 0,
          newThisMonth: 0,
          byFitnessLevel: {},
          byLocation: {},
        };

      const now = new Date();
      const monthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );

      const total = users.length;
      const active = users.filter(u => u.is_active).length;
      const inactive = total - active;
      const newThisMonth = users.filter(
        u => u.created_at && new Date(u.created_at) > monthAgo
      ).length;

      const byFitnessLevel = users.reduce(
        (acc, user) => {
          const level = user.fitness_level || 'unknown';
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const byLocation = users.reduce(
        (acc, user) => {
          const location = user.location || 'unknown';
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        total,
        active,
        inactive,
        newThisMonth,
        byFitnessLevel,
        byLocation,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        newThisMonth: 0,
        byFitnessLevel: {},
        byLocation: {},
      };
    }
  }

  private transformUser(user: any): User {
    const createdAt = user.created_at ? new Date(user.created_at) : null;
    const lastLogin = user.last_login_at ? new Date(user.last_login_at) : null;
    const now = new Date();

    // Calculate membership duration
    let membershipDuration = 'New';
    if (createdAt) {
      const days = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days < 30) {
        membershipDuration = `${days} days`;
      } else if (days < 365) {
        membershipDuration = `${Math.floor(days / 30)} months`;
      } else {
        membershipDuration = `${Math.floor(days / 365)} years`;
      }
    }

    // Calculate engagement score (0-100)
    let engagementScore = 0;
    if (user.is_active) engagementScore += 30;
    if (
      lastLogin &&
      now.getTime() - lastLogin.getTime() < 7 * 24 * 60 * 60 * 1000
    ) {
      engagementScore += 40; // Active in last week
    }
    if (user.fitness_level) engagementScore += 10;
    if (user.fitness_goals?.length) engagementScore += 20;

    return {
      ...user,
      status: user.is_active ? 'active' : 'inactive',
      lastActiveDate: user.last_login_at,
      membershipDuration,
      engagementScore,
    };
  }

  private async logAdminAction(
    action: string,
    resourceId: string,
    details: any
  ): Promise<void> {
    try {
      // Get current admin user (should come from auth context)
      const adminId = 'current-admin-id'; // TODO: Get from context

      await this.supabase.from('admin_activity_logs').insert({
        admin_id: adminId,
        action,
        resource_type: 'user',
        resource_id: resourceId,
        details,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }
}

export const userService = new UserService();
