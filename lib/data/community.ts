'use client';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database';

// Types based on actual database schema
export interface CommunityPost {
  id: number;
  user_id: string;
  content: string;
  post_type: Database['public']['Enums']['post_type'];
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  likes_count: number;
  comments_count: number;
  moderation_status?: 'pending' | 'approved' | 'rejected';
  is_flagged?: boolean;
}

export interface CommunityComment {
  id: number;
  user_id: string;
  post_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface ModerationAction {
  id: string;
  content_type: string;
  content_id: string;
  status: 'pending' | 'approved' | 'rejected';
  moderator_id?: string;
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityStats {
  totalPosts: number;
  pendingModeration: number;
  flaggedContent: number;
  postsToday: number;
  engagementMetrics: {
    averageLikes: number;
    averageComments: number;
  };
  postsByType: Array<{
    type: string;
    count: number;
  }>;
  moderationStats: {
    approvedToday: number;
    rejectedToday: number;
    autoApproved: number;
    responseTime: number;
  };
}

export interface PostFilters {
  status?: 'pending' | 'approved' | 'rejected';
  type?: Database['public']['Enums']['post_type'];
  flagged_only?: boolean;
  search?: string;
}

export class CommunityService {
  private static supabase = createClient();

  static async getAllPosts(
    limit: number = 20,
    offset: number = 0,
    filters?: PostFilters
  ): Promise<CommunityPost[]> {
    try {
      let query = this.supabase
        .from('community_posts')
        .select(
          `
          *,
          user:users!community_posts_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters?.type) {
        query = query.eq('post_type', filters.type);
      }

      if (filters?.search) {
        query = query.ilike('content', `%${filters.search}%`);
      }

      const { data: posts, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      if (!posts) return [];

      // Get likes and comments counts
      const postsWithCounts = await Promise.all(
        posts.map(async post => {
          const [likesCount, commentsCount, moderationStatus] =
            await Promise.all([
              this.getPostLikesCount(post.id),
              this.getPostCommentsCount(post.id),
              this.getPostModerationStatus(post.id),
            ]);

          return {
            ...post,
            user: Array.isArray(post.user) ? post.user[0] : post.user,
            likes_count: likesCount,
            comments_count: commentsCount,
            moderation_status: moderationStatus?.status || 'approved',
            is_flagged: moderationStatus?.status === 'pending',
          } as CommunityPost;
        })
      );

      return postsWithCounts;
    } catch (error) {
      console.error('Error in getAllPosts:', error);
      throw error;
    }
  }

  static async getPostById(postId: number): Promise<CommunityPost | null> {
    try {
      const { data: post, error } = await this.supabase
        .from('community_posts')
        .select(
          `
          *,
          user:users!community_posts_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        throw error;
      }

      if (!post) return null;

      const [likesCount, commentsCount, moderationStatus] = await Promise.all([
        this.getPostLikesCount(post.id),
        this.getPostCommentsCount(post.id),
        this.getPostModerationStatus(post.id),
      ]);

      return {
        ...post,
        user: Array.isArray(post.user) ? post.user[0] : post.user,
        likes_count: likesCount,
        comments_count: commentsCount,
        moderation_status: moderationStatus?.status || 'approved',
        is_flagged: moderationStatus?.status === 'pending',
      } as CommunityPost;
    } catch (error) {
      console.error('Error in getPostById:', error);
      throw error;
    }
  }

  static async getPostComments(postId: number): Promise<CommunityComment[]> {
    try {
      const { data: comments, error } = await this.supabase
        .from('community_comments')
        .select(
          `
          *,
          user:users!community_comments_user_id_fkey (
            id,
            full_name,
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

      return (comments || []).map(comment => ({
        ...comment,
        user: Array.isArray(comment.user) ? comment.user[0] : comment.user,
      })) as CommunityComment[];
    } catch (error) {
      console.error('Error in getPostComments:', error);
      throw error;
    }
  }

  private static async getPostLikesCount(postId: number): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('community_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        console.error('Error counting likes:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getPostLikesCount:', error);
      return 0;
    }
  }

  private static async getPostCommentsCount(postId: number): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        console.error('Error counting comments:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getPostCommentsCount:', error);
      return 0;
    }
  }

  private static async getPostModerationStatus(
    postId: number
  ): Promise<ModerationAction | null> {
    try {
      const { data: moderation, error } = await this.supabase
        .from('content_moderation')
        .select('*')
        .eq('content_type', 'post')
        .eq('content_id', postId.toString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching moderation status:', error);
        return null;
      }

      return moderation;
    } catch (error) {
      console.error('Error in getPostModerationStatus:', error);
      return null;
    }
  }

  static async moderatePost(
    postId: number,
    action: 'approve' | 'reject' | 'delete',
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    try {
      console.log('Starting moderation:', {
        postId,
        action,
        moderatorId,
        reason,
      });

      if (action === 'delete') {
        // Delete the post
        const { error } = await this.supabase
          .from('community_posts')
          .delete()
          .eq('id', postId);

        if (error) {
          console.error('Error deleting post:', error);
          throw error;
        }
        console.log('Post deleted successfully');
      } else {
        // Update or create moderation record
        const status = action === 'approve' ? 'approved' : 'rejected';

        const moderationRecord = {
          content_type: 'post',
          content_id: postId.toString(),
          status,
          moderator_id: moderatorId,
          reason: reason || null,
          notes: reason || null,
          updated_at: new Date().toISOString(),
        };

        console.log('Inserting moderation record:', moderationRecord);

        const { error } = await this.supabase
          .from('content_moderation')
          .upsert(moderationRecord);

        if (error) {
          console.error('Error updating moderation:', error);
          throw error;
        }
        console.log('Moderation record updated successfully');
      }

      // Log admin activity (make this optional to avoid blocking the main operation)
      try {
        await this.logAdminActivity(
          moderatorId,
          action,
          'post',
          postId.toString(),
          {
            reason,
            action,
          }
        );
        console.log('Admin activity logged successfully');
      } catch (logError) {
        console.warn('Failed to log admin activity, but continuing:', logError);
        // Don't throw here - logging failure shouldn't block moderation
      }
    } catch (error) {
      console.error('Error in moderatePost:', error);
      throw error;
    }
  }

  static async bulkModerate(
    postIds: number[],
    action: 'approve' | 'reject',
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    try {
      console.log('Starting bulk moderation:', {
        postIds,
        action,
        moderatorId,
        reason,
      });

      const status = action === 'approve' ? 'approved' : 'rejected';

      const moderationRecords = postIds.map(postId => ({
        content_type: 'post',
        content_id: postId.toString(),
        status,
        moderator_id: moderatorId,
        reason: reason || null,
        notes: reason || null,
        updated_at: new Date().toISOString(),
      }));

      console.log('Bulk moderation records:', moderationRecords);

      const { error } = await this.supabase
        .from('content_moderation')
        .upsert(moderationRecords);

      if (error) {
        console.error('Error bulk moderating:', error);
        throw error;
      }

      console.log('Bulk moderation successful');

      // Log admin activity (make this optional to avoid blocking the main operation)
      try {
        await this.logAdminActivity(
          moderatorId,
          `bulk_${action}`,
          'posts',
          postIds.join(','),
          {
            reason,
            count: postIds.length,
          }
        );
        console.log('Bulk admin activity logged successfully');
      } catch (logError) {
        console.warn(
          'Failed to log bulk admin activity, but continuing:',
          logError
        );
        // Don't throw here - logging failure shouldn't block moderation
      }
    } catch (error) {
      console.error('Error in bulkModerate:', error);
      throw error;
    }
  }

  static async getCommunityStats(): Promise<CommunityStats> {
    try {
      const [
        totalPostsCount,
        pendingModerationCount,
        flaggedContentCount,
        postsTodayCount,
        postsTypeStats,
      ] = await Promise.all([
        this.getTotalPostsCount(),
        this.getPendingModerationCount(),
        this.getFlaggedContentCount(),
        this.getPostsTodayCount(),
        this.getPostsByTypeStats(),
      ]);

      // Calculate average engagement
      const averageEngagement = await this.getAverageEngagement();

      return {
        totalPosts: totalPostsCount,
        pendingModeration: pendingModerationCount,
        flaggedContent: flaggedContentCount,
        postsToday: postsTodayCount,
        engagementMetrics: averageEngagement,
        postsByType: postsTypeStats,
        moderationStats: {
          approvedToday: 0, // TODO: Implement
          rejectedToday: 0, // TODO: Implement
          autoApproved: 0, // TODO: Implement
          responseTime: 25, // TODO: Implement
        },
      };
    } catch (error) {
      console.error('Error in getCommunityStats:', error);
      throw error;
    }
  }

  private static async getTotalPostsCount(): Promise<number> {
    const { count } = await this.supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private static async getPendingModerationCount(): Promise<number> {
    const { count } = await this.supabase
      .from('content_moderation')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'post')
      .eq('status', 'pending');
    return count || 0;
  }

  private static async getFlaggedContentCount(): Promise<number> {
    const { count } = await this.supabase
      .from('content_moderation')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'post')
      .eq('status', 'pending');
    return count || 0;
  }

  private static async getPostsTodayCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await this.supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);
    return count || 0;
  }

  private static async getPostsByTypeStats(): Promise<
    Array<{ type: string; count: number }>
  > {
    const { data } = await this.supabase
      .from('community_posts')
      .select('post_type')
      .order('post_type');

    if (!data) return [];

    const typeStats: Record<string, number> = {};
    data.forEach(post => {
      typeStats[post.post_type] = (typeStats[post.post_type] || 0) + 1;
    });

    return Object.entries(typeStats).map(([type, count]) => ({ type, count }));
  }

  private static async getAverageEngagement(): Promise<{
    averageLikes: number;
    averageComments: number;
  }> {
    // This would require a more complex query to calculate averages
    // For now, return mock data
    return {
      averageLikes: 18,
      averageComments: 6,
    };
  }

  private static async logAdminActivity(
    adminId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: any
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('admin_activity_logs').insert({
        admin_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error logging admin activity:', error);
      }
    } catch (error) {
      console.error('Error in logAdminActivity:', error);
    }
  }

  // Real-time subscriptions
  static subscribeToNewPosts(callback: (post: CommunityPost) => void) {
    return this.supabase
      .channel('new-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        async payload => {
          const post = await this.getPostById(payload.new.id);
          if (post) {
            callback(post);
          }
        }
      )
      .subscribe();
  }

  static subscribeToFlaggedContent(
    callback: (moderation: ModerationAction) => void
  ) {
    return this.supabase
      .channel('flagged-content')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'content_moderation' },
        payload => {
          if (payload.new.status === 'pending') {
            callback(payload.new as ModerationAction);
          }
        }
      )
      .subscribe();
  }
}
