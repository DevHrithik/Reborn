import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface CommunityPost {
  id: number;
  user_id: string;
  content: string;
  type:
    | 'text'
    | 'image'
    | 'video'
    | 'achievement'
    | 'workout_share'
    | 'question';
  images: string[] | null;
  video_url: string | null;
  likes_count: number;
  comments_count: number;
  is_flagged: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  moderated_by: string | null;
  moderated_at: string | null;
  moderation_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    fitness_level?: string;
  };
}

export interface CommunityComment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  likes_count: number;
  is_flagged: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  // Joined fields
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface ModerationAction {
  id: number;
  admin_id: string;
  target_type: 'post' | 'comment' | 'user';
  target_id: string;
  action:
    | 'approve'
    | 'reject'
    | 'delete'
    | 'ban_user'
    | 'warn_user'
    | 'feature_post';
  reason: string;
  notes: string | null;
  created_at: string;
  // Joined fields
  admin?: {
    name: string;
    email: string;
  };
}

export interface CommunityStats {
  totalPosts: number;
  pendingModeration: number;
  flaggedContent: number;
  totalUsers: number;
  activeUsers: number;
  postsToday: number;
  postsByType: Array<{ type: string; count: number }>;
  engagementMetrics: {
    averageLikes: number;
    averageComments: number;
    topEngagementTypes: Array<{ type: string; engagement: number }>;
  };
  moderationStats: {
    approvedToday: number;
    rejectedToday: number;
    autoApproved: number;
    responseTime: number; // average in minutes
  };
}

export interface UserBan {
  id: number;
  user_id: string;
  banned_by: string;
  reason: string;
  type: 'temporary' | 'permanent' | 'community_only';
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
}

export class CommunityService {
  // Post Management
  static async getAllPosts(
    limit: number = 20,
    offset: number = 0,
    filters?: {
      status?: string;
      type?: string;
      user_id?: string;
      flagged_only?: boolean;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<CommunityPost[]> {
    let query = supabase
      .from('community_posts')
      .select(
        `
        *,
        user:users!user_id (
          id,
          name,
          email,
          avatar_url,
          fitness_level
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('moderation_status', filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.flagged_only) {
      query = query.eq('is_flagged', true);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching community posts:', error);
      throw error;
    }

    return data || [];
  }

  static async getPostById(id: number): Promise<CommunityPost | null> {
    const { data, error } = await supabase
      .from('community_posts')
      .select(
        `
        *,
        user:users!user_id (
          id,
          name,
          email,
          avatar_url,
          fitness_level
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      throw error;
    }

    return data;
  }

  static async getPostComments(postId: number): Promise<CommunityComment[]> {
    const { data, error } = await supabase
      .from('community_comments')
      .select(
        `
        *,
        user:users!user_id (
          id,
          name,
          email,
          avatar_url
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return data || [];
  }

  // Moderation Actions
  static async moderatePost(
    postId: number,
    action: 'approve' | 'reject' | 'delete',
    adminId: string,
    reason?: string,
    notes?: string
  ): Promise<void> {
    const updates: any = {
      moderated_by: adminId,
      moderated_at: new Date().toISOString(),
      moderation_reason: reason || null,
    };

    if (action === 'approve') {
      updates.moderation_status = 'approved';
      updates.is_flagged = false;
    } else if (action === 'reject') {
      updates.moderation_status = 'rejected';
    }

    if (action === 'delete') {
      // Soft delete - mark as rejected and hide
      updates.moderation_status = 'rejected';
      updates.is_flagged = true;
    }

    const { error: postError } = await supabase
      .from('community_posts')
      .update(updates)
      .eq('id', postId);

    if (postError) {
      console.error('Error moderating post:', postError);
      throw postError;
    }

    // Log moderation action
    const { error: logError } = await supabase
      .from('moderation_actions')
      .insert([
        {
          admin_id: adminId,
          target_type: 'post',
          target_id: postId.toString(),
          action,
          reason: reason || '',
          notes,
        },
      ]);

    if (logError) {
      console.error('Error logging moderation action:', logError);
    }
  }

  static async bulkModerate(
    postIds: number[],
    action: 'approve' | 'reject',
    adminId: string,
    reason?: string
  ): Promise<void> {
    const updates: any = {
      moderated_by: adminId,
      moderated_at: new Date().toISOString(),
      moderation_reason: reason || null,
    };

    if (action === 'approve') {
      updates.moderation_status = 'approved';
      updates.is_flagged = false;
    } else {
      updates.moderation_status = 'rejected';
    }

    const { error } = await supabase
      .from('community_posts')
      .update(updates)
      .in('id', postIds);

    if (error) {
      console.error('Error bulk moderating posts:', error);
      throw error;
    }

    // Log bulk actions
    const actions = postIds.map(postId => ({
      admin_id: adminId,
      target_type: 'post' as const,
      target_id: postId.toString(),
      action,
      reason: reason || 'Bulk moderation',
      notes: `Bulk ${action} of ${postIds.length} posts`,
    }));

    await supabase.from('moderation_actions').insert(actions);
  }

  // User Management
  static async banUser(
    userId: string,
    adminId: string,
    reason: string,
    type: 'temporary' | 'permanent' | 'community_only',
    expiresAt?: string
  ): Promise<void> {
    const { error } = await supabase.from('user_bans').insert([
      {
        user_id: userId,
        banned_by: adminId,
        reason,
        type,
        expires_at: expiresAt || null,
        is_active: true,
      },
    ]);

    if (error) {
      console.error('Error banning user:', error);
      throw error;
    }

    // Log the action
    await supabase.from('moderation_actions').insert([
      {
        admin_id: adminId,
        target_type: 'user',
        target_id: userId,
        action: 'ban_user',
        reason,
        notes: `${type} ban${expiresAt ? ` until ${expiresAt}` : ''}`,
      },
    ]);
  }

  static async unbanUser(userId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('user_bans')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }

    // Log the action
    await supabase.from('moderation_actions').insert([
      {
        admin_id: adminId,
        target_type: 'user',
        target_id: userId,
        action: 'approve', // Using approve to indicate unban
        reason: 'User unbanned',
        notes: 'Ban removed by admin',
      },
    ]);
  }

  static async getUserBans(userId?: string): Promise<UserBan[]> {
    let query = supabase
      .from('user_bans')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user bans:', error);
      throw error;
    }

    return data || [];
  }

  // Analytics and Stats
  static async getCommunityStats(): Promise<CommunityStats> {
    try {
      // Get basic counts
      const [postsResult, flaggedResult, usersResult, todayPostsResult] =
        await Promise.all([
          supabase.from('community_posts').select('id', { count: 'exact' }),
          supabase
            .from('community_posts')
            .select('id', { count: 'exact' })
            .eq('is_flagged', true),
          supabase.from('users').select('id', { count: 'exact' }),
          supabase
            .from('community_posts')
            .select('id', { count: 'exact' })
            .gte('created_at', new Date().toISOString().split('T')[0]),
        ]);

      // Get pending moderation count
      const { count: pendingCount } = await supabase
        .from('community_posts')
        .select('id', { count: 'exact' })
        .eq('moderation_status', 'pending');

      // Get posts by type
      const { data: postTypes } = await supabase
        .from('community_posts')
        .select('type')
        .neq('moderation_status', 'rejected');

      const postsByType =
        postTypes?.reduce(
          (acc, post) => {
            acc[post.type] = (acc[post.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      // Get engagement metrics
      const { data: engagementData } = await supabase
        .from('community_posts')
        .select('type, likes_count, comments_count')
        .neq('moderation_status', 'rejected');

      const engagementByType =
        engagementData?.reduce(
          (acc, post) => {
            if (!acc[post.type]) {
              acc[post.type] = { total: 0, likes: 0, comments: 0, count: 0 };
            }
            acc[post.type].likes += post.likes_count || 0;
            acc[post.type].comments += post.comments_count || 0;
            acc[post.type].count += 1;
            acc[post.type].total =
              acc[post.type].likes + acc[post.type].comments;
            return acc;
          },
          {} as Record<string, any>
        ) || {};

      // Get moderation stats for today
      const today = new Date().toISOString().split('T')[0];
      const [approvedToday, rejectedToday, autoApproved] = await Promise.all([
        supabase
          .from('moderation_actions')
          .select('id', { count: 'exact' })
          .eq('action', 'approve')
          .gte('created_at', today),
        supabase
          .from('moderation_actions')
          .select('id', { count: 'exact' })
          .eq('action', 'reject')
          .gte('created_at', today),
        supabase
          .from('community_posts')
          .select('id', { count: 'exact' })
          .eq('moderation_status', 'auto_approved')
          .gte('created_at', today),
      ]);

      const totalLikes =
        engagementData?.reduce(
          (sum, post) => sum + (post.likes_count || 0),
          0
        ) || 0;
      const totalComments =
        engagementData?.reduce(
          (sum, post) => sum + (post.comments_count || 0),
          0
        ) || 0;
      const totalPosts = engagementData?.length || 1;

      return {
        totalPosts: postsResult.count || 0,
        pendingModeration: pendingCount || 0,
        flaggedContent: flaggedResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeUsers: usersResult.count || 0, // TODO: Add proper active user calculation
        postsToday: todayPostsResult.count || 0,
        postsByType: Object.entries(postsByType).map(([type, count]) => ({
          type,
          count,
        })),
        engagementMetrics: {
          averageLikes: Math.round(totalLikes / totalPosts),
          averageComments: Math.round(totalComments / totalPosts),
          topEngagementTypes: Object.entries(engagementByType)
            .map(([type, data]) => ({
              type,
              engagement: Math.round(data.total / data.count),
            }))
            .sort((a, b) => b.engagement - a.engagement),
        },
        moderationStats: {
          approvedToday: approvedToday.count || 0,
          rejectedToday: rejectedToday.count || 0,
          autoApproved: autoApproved.count || 0,
          responseTime: 30, // TODO: Calculate actual response time
        },
      };
    } catch (error) {
      console.error('Error fetching community stats:', error);
      throw error;
    }
  }

  static async getModerationHistory(
    limit: number = 50,
    offset: number = 0
  ): Promise<ModerationAction[]> {
    const { data, error } = await supabase
      .from('moderation_actions')
      .select(
        `
        *,
        admin:users!admin_id (
          name,
          email
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching moderation history:', error);
      throw error;
    }

    return data || [];
  }

  // Real-time subscriptions
  static subscribeToNewPosts(callback: (post: CommunityPost) => void) {
    return supabase
      .channel('community_posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        payload => callback(payload.new as CommunityPost)
      )
      .subscribe();
  }

  static subscribeToFlaggedContent(callback: (post: CommunityPost) => void) {
    return supabase
      .channel('flagged_content')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_posts',
          filter: 'is_flagged=eq.true',
        },
        payload => callback(payload.new as CommunityPost)
      )
      .subscribe();
  }
}
