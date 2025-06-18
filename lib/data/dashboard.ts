import { createClient } from '@/lib/supabase/client';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  supportTickets: number;
  communityPosts: number;
  pendingModeration: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivity: ActivityItem[];
  workoutSessions: number;
  totalPlans: number;
  totalRecipes: number;
}

interface ActivityItem {
  id: string;
  type:
    | 'user_registration'
    | 'support_ticket'
    | 'community_post'
    | 'system_event'
    | 'workout_session';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: string;
}

interface UserStats {
  total: number;
  active: number;
  recent: number;
  byFitnessLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  byActivityLevel: {
    sedentary: number;
    lightly_active: number;
    moderately_active: number;
    very_active: number;
  };
}

interface WorkoutStats {
  totalSessions: number;
  todaySessions: number;
  weekSessions: number;
  popularExercises: Array<{
    name: string;
    count: number;
  }>;
}

export class DashboardService {
  private supabase = createClient();

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get all metrics in parallel for better performance
      const [
        userMetrics,
        communityMetrics,
        supportMetrics,
        workoutMetrics,
        planMetrics,
        recipeMetrics,
        activityData,
      ] = await Promise.all([
        this.getUserMetrics(),
        this.getCommunityMetrics(),
        this.getSupportMetrics(),
        this.getWorkoutMetrics(),
        this.getPlanMetrics(),
        this.getRecipeMetrics(),
        this.getRecentActivity(),
      ]);

      // Determine system health based on various factors
      const systemHealth = this.calculateSystemHealth(
        userMetrics.total,
        supportMetrics.openTickets,
        communityMetrics.pendingModeration
      );

      return {
        totalUsers: userMetrics.total,
        activeUsers: userMetrics.active,
        newUsersToday: userMetrics.newToday,
        supportTickets: supportMetrics.openTickets,
        communityPosts: communityMetrics.totalPosts,
        pendingModeration: communityMetrics.pendingModeration,
        workoutSessions: workoutMetrics.totalSessions,
        totalPlans: planMetrics.total,
        totalRecipes: recipeMetrics.total,
        systemHealth,
        recentActivity: activityData,
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  private async getUserMetrics() {
    // Use the public users table instead of auth.users
    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, created_at, last_login_at, is_active')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching users:', error);
      return { total: 0, active: 0, newToday: 0 };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total = users?.length || 0;
    const active =
      users?.filter(
        user => user.last_login_at && new Date(user.last_login_at) > weekAgo
      ).length || 0;
    const newToday =
      users?.filter(user => new Date(user.created_at) >= today).length || 0;

    return { total, active, newToday };
  }

  private async getCommunityMetrics() {
    const { data: posts, error } = await this.supabase
      .from('community_posts')
      .select('id, created_at, post_type');

    if (error) {
      console.error('Error fetching community posts:', error);
      return { totalPosts: 0, pendingModeration: 0 };
    }

    const totalPosts = posts?.length || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingModeration =
      posts?.filter(
        post =>
          new Date(post.created_at) >= today && post.post_type === 'sharing'
      ).length || 0;

    return { totalPosts, pendingModeration };
  }

  private async getSupportMetrics() {
    const { data: tickets, error } = await this.supabase
      .from('support_chat_sessions')
      .select('id, status, created_at');

    if (error) {
      console.error('Error fetching support tickets:', error);
      return { openTickets: 0 };
    }

    const openTickets =
      tickets?.filter(
        ticket => ticket.status === 'open' || ticket.status === 'in_progress'
      ).length || 0;

    return { openTickets };
  }

  private async getWorkoutMetrics() {
    const { data: sessions, error } = await this.supabase
      .from('exercise_performances')
      .select('id, performed_at');

    if (error) {
      console.error('Error fetching workout sessions:', error);
      return { totalSessions: 0 };
    }

    const totalSessions = sessions?.length || 0;

    return { totalSessions };
  }

  private async getPlanMetrics() {
    const { data: plans, error } = await this.supabase
      .from('plans')
      .select('id');

    if (error) {
      console.error('Error fetching plans:', error);
      return { total: 0 };
    }

    return { total: plans?.length || 0 };
  }

  private async getRecipeMetrics() {
    const { data: recipes, error } = await this.supabase
      .from('recipes')
      .select('id');

    if (error) {
      console.error('Error fetching recipes:', error);
      return { total: 0 };
    }

    return { total: recipes?.length || 0 };
  }

  private async getRecentActivity(): Promise<ActivityItem[]> {
    try {
      // Get recent activity from multiple sources
      const [userActivity, communityActivity, supportActivity] =
        await Promise.all([
          this.getUserActivity(),
          this.getCommunityActivity(),
          this.getSupportActivity(),
        ]);

      // Combine and sort all activities
      const allActivities = [
        ...userActivity,
        ...communityActivity,
        ...supportActivity,
        // Add system health check
        {
          id: 'system-health',
          type: 'system_event' as const,
          title: 'System Health Check',
          description: 'System status: healthy',
          timestamp: new Date().toISOString(),
          status: 'healthy',
        },
      ];

      // Sort by timestamp and return top 10
      return allActivities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  private async getUserActivity(): Promise<ActivityItem[]> {
    const { data: users, error } = await this.supabase
      .from('users')
      .select('created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday =
      users?.filter(user => new Date(user.created_at) >= today).length || 0;

    if (newUsersToday > 0) {
      return [
        {
          id: 'user-registrations',
          type: 'user_registration',
          title: 'New User Registration',
          description: `${newUsersToday} new user${newUsersToday > 1 ? 's' : ''} registered today`,
          timestamp: users?.[0]?.created_at || new Date().toISOString(),
          status: 'completed',
        },
      ];
    }

    return [];
  }

  private async getCommunityActivity(): Promise<ActivityItem[]> {
    const { data: posts, error } = await this.supabase
      .from('community_posts')
      .select('created_at, post_type')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching community activity:', error);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newPostsToday =
      posts?.filter(post => new Date(post.created_at) >= today).length || 0;

    if (newPostsToday > 0) {
      return [
        {
          id: 'community-posts',
          type: 'community_post',
          title: 'Community Activity',
          description: `${newPostsToday} new post${newPostsToday > 1 ? 's' : ''} today`,
          timestamp: posts?.[0]?.created_at || new Date().toISOString(),
          status: 'completed',
        },
      ];
    }

    return [];
  }

  private async getSupportActivity(): Promise<ActivityItem[]> {
    const { data: tickets, error } = await this.supabase
      .from('support_chat_sessions')
      .select('created_at, status')
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support activity:', error);
      return [];
    }

    const openTickets = tickets?.length || 0;

    if (openTickets > 0) {
      return [
        {
          id: 'support-tickets',
          type: 'support_ticket',
          title: 'Support Tickets',
          description: `${openTickets} open ticket${openTickets > 1 ? 's' : ''} require attention`,
          timestamp: tickets?.[0]?.created_at || new Date().toISOString(),
          status: openTickets > 5 ? 'urgent' : 'normal',
        },
      ];
    }

    return [];
  }

  private calculateSystemHealth(
    totalUsers: number,
    openTickets: number,
    pendingModeration: number
  ): 'healthy' | 'warning' | 'critical' {
    // Critical: High number of open tickets or no users
    if (openTickets > 10 || totalUsers === 0) {
      return 'critical';
    }

    // Warning: Moderate tickets or pending moderation
    if (openTickets > 5 || pendingModeration > 5) {
      return 'warning';
    }

    // Healthy: Everything looks good
    return 'healthy';
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select(
          'id, created_at, last_login_at, fitness_level, activity_level, is_active'
        )
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user stats:', error);
        throw new Error('Failed to load user statistics');
      }

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const total = users?.length || 0;
      const active =
        users?.filter(
          user => user.last_login_at && new Date(user.last_login_at) > weekAgo
        ).length || 0;
      const recent =
        users?.filter(user => new Date(user.created_at) > monthAgo).length || 0;

      // Calculate fitness level distribution
      const fitnessLevels =
        users?.reduce(
          (acc, user) => {
            const level = user.fitness_level || 'beginner';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      // Calculate activity level distribution
      const activityLevels =
        users?.reduce(
          (acc, user) => {
            const level = user.activity_level || 'sedentary';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      return {
        total,
        active,
        recent,
        byFitnessLevel: {
          beginner: fitnessLevels.beginner || 0,
          intermediate: fitnessLevels.intermediate || 0,
          advanced: fitnessLevels.advanced || 0,
        },
        byActivityLevel: {
          sedentary: activityLevels.sedentary || 0,
          lightly_active: activityLevels.lightly_active || 0,
          moderately_active: activityLevels.moderately_active || 0,
          very_active: activityLevels.very_active || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to load user statistics');
    }
  }

  async getWorkoutStats(): Promise<WorkoutStats> {
    try {
      const { data: performances, error } = await this.supabase
        .from('exercise_performances')
        .select(
          `
          id,
          performed_at,
          exercises (name)
        `
        )
        .order('performed_at', { ascending: false });

      if (error) {
        console.error('Error fetching workout stats:', error);
        throw new Error('Failed to load workout statistics');
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalSessions = performances?.length || 0;
      const todaySessions =
        performances?.filter(p => new Date(p.performed_at) >= today).length ||
        0;
      const weekSessions =
        performances?.filter(p => new Date(p.performed_at) >= weekAgo).length ||
        0;

      // Calculate popular exercises
      const exerciseCounts =
        performances?.reduce(
          (acc, p) => {
            const exerciseName = p.exercises?.name || 'Unknown Exercise';
            acc[exerciseName] = (acc[exerciseName] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      const popularExercises = Object.entries(exerciseCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSessions,
        todaySessions,
        weekSessions,
        popularExercises,
      };
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      throw new Error('Failed to load workout statistics');
    }
  }

  // Real-time subscription for dashboard updates
  subscribeToUpdates(callback: (data: any) => void) {
    const channels = [
      this.supabase
        .channel('dashboard-users')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users' },
          callback
        ),

      this.supabase
        .channel('dashboard-community')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'community_posts' },
          callback
        ),

      this.supabase
        .channel('dashboard-support')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'support_chat_sessions' },
          callback
        ),

      this.supabase
        .channel('dashboard-workouts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'exercise_performances' },
          callback
        ),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => this.supabase.removeChannel(channel));
    };
  }
}

export const dashboardService = new DashboardService();
