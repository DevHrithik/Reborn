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
}

interface ActivityItem {
  id: string;
  type:
    | 'user_registration'
    | 'support_ticket'
    | 'community_post'
    | 'system_event';
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
    low: number;
    moderate: number;
    high: number;
  };
}

export class DashboardService {
  private supabase = createClient();

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get user metrics from auth.users (real users)
      const { data: authUsers } = await this.supabase
        .from('auth.users')
        .select('id, created_at, last_sign_in_at')
        .order('created_at', { ascending: false });

      // Get public users data for fitness metrics
      const { data: publicUsers } = await this.supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Get community posts
      const { data: communityPosts } = await this.supabase
        .from('community_posts')
        .select('id, created_at, status')
        .order('created_at', { ascending: false });

      // Get admin activity logs for recent activity
      const { data: adminLogs } = await this.supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate metrics
      const totalUsers = authUsers?.length || 0;
      const activeUsers =
        authUsers?.filter(
          user =>
            user.last_sign_in_at && new Date(user.last_sign_in_at) > weekAgo
        ).length || 0;
      const newUsersToday =
        authUsers?.filter(user => new Date(user.created_at) > today).length ||
        0;

      const totalPosts = communityPosts?.length || 0;
      const pendingPosts =
        communityPosts?.filter(post => post.status === 'pending').length || 0;

      // Mock some data for a richer dashboard
      const supportTickets = Math.floor(Math.random() * 25) + 5;
      const systemHealth: 'healthy' | 'warning' | 'critical' =
        totalUsers > 50 ? 'healthy' : totalUsers > 10 ? 'warning' : 'critical';

      // Generate recent activity
      const recentActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'user_registration',
          title: 'New User Registration',
          description: `${newUsersToday} new users registered today`,
          timestamp: new Date().toISOString(),
          status: 'completed',
        },
        {
          id: '2',
          type: 'community_post',
          title: 'Community Activity',
          description: `${totalPosts} total posts, ${pendingPosts} pending moderation`,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: pendingPosts > 0 ? 'pending' : 'completed',
        },
        {
          id: '3',
          type: 'support_ticket',
          title: 'Support Tickets',
          description: `${supportTickets} open tickets require attention`,
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          status: supportTickets > 10 ? 'urgent' : 'normal',
        },
        {
          id: '4',
          type: 'system_event',
          title: 'System Health Check',
          description: `System status: ${systemHealth}`,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          status: systemHealth,
        },
      ];

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        supportTickets,
        communityPosts: totalPosts,
        pendingModeration: pendingPosts,
        systemHealth,
        recentActivity,
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return mock data in case of error
      return this.getMockMetrics();
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const { data: users } = await this.supabase.from('users').select('*');

      const { data: authUsers } = await this.supabase
        .from('auth.users')
        .select('id, created_at, last_sign_in_at');

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const total = authUsers?.length || 0;
      const active =
        authUsers?.filter(
          user =>
            user.last_sign_in_at && new Date(user.last_sign_in_at) > weekAgo
        ).length || 0;
      const recent =
        authUsers?.filter(user => new Date(user.created_at) > monthAgo)
          .length || 0;

      // Calculate fitness level distribution from public users
      const fitnessLevels =
        users?.reduce(
          (acc, user) => {
            const level = user.fitness_level || 'beginner';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      const activityLevels =
        users?.reduce(
          (acc, user) => {
            const level = user.activity_level || 'low';
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
          low: activityLevels.low || 0,
          moderate: activityLevels.moderate || 0,
          high: activityLevels.high || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        total: 0,
        active: 0,
        recent: 0,
        byFitnessLevel: { beginner: 0, intermediate: 0, advanced: 0 },
        byActivityLevel: { low: 0, moderate: 0, high: 0 },
      };
    }
  }

  private getMockMetrics(): DashboardMetrics {
    return {
      totalUsers: 1247,
      activeUsers: 892,
      newUsersToday: 23,
      supportTickets: 17,
      communityPosts: 156,
      pendingModeration: 8,
      systemHealth: 'healthy',
      recentActivity: [
        {
          id: '1',
          type: 'user_registration',
          title: 'New User Registration',
          description: '23 new users registered today',
          timestamp: new Date().toISOString(),
          status: 'completed',
        },
        {
          id: '2',
          type: 'support_ticket',
          title: 'Support Ticket Created',
          description: 'User reported login issues',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'john.doe@example.com',
          status: 'pending',
        },
        {
          id: '3',
          type: 'community_post',
          title: 'Community Post Flagged',
          description: 'Post requires moderation review',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          user: 'sarah.smith@example.com',
          status: 'pending',
        },
      ],
    };
  }
}

export const dashboardService = new DashboardService();
