'use client';

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/types/database';

// Types based on actual database schema
export interface CommunityPost {
  id: number;
  user_id: string;
  title?: string | null;
  content: string;
  status?: 'published' | 'draft' | 'archived' | 'flagged';
  category?: 'General' | 'Workouts' | 'Nutrition' | 'Support';
  tags?: string[] | null;
  likes_count?: number;
  comments_count?: number;
  is_pinned?: boolean;
  post_type: 'milestone' | 'tip' | 'celebration' | 'question' | 'sharing';
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  // Additional properties used by the dashboard
  moderation_status?: 'pending' | 'approved' | 'rejected';
  is_flagged?: boolean;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
  };
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  parent_comment_id?: number | null;
  status?: 'published' | 'hidden' | 'flagged';
  likes_count?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

export interface Report {
  id: number;
  post_id: number | null;
  comment_id: number | null;
  reporter_user_id: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  description: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface CommunityComment {
  id: number;
  user_id: string;
  post_id: number;
  content: string;
  parent_comment_id?: number | null;
  status?: 'published' | 'hidden' | 'flagged';
  likes_count?: number;
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
  postsToday: number;
  totalComments: number;
  commentsToday: number;
  pendingReports: number;
  activeUsers: number;
  // Optional fields for backward compatibility
  pendingModeration?: number;
  flaggedContent?: number;
  engagementMetrics?: {
    averageLikes: number;
    averageComments: number;
  };
  postsByType?: Array<{
    type: string;
    count: number;
  }>;
  moderationStats?: {
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

const supabase = createClient();

export class CommunityService {
  static async getPosts(
    page: number = 1,
    limit: number = 20,
    status?: string,
    category?: string
  ): Promise<{ posts: CommunityPost[]; total: number }> {
    let query = supabase
      .from('community_posts')
      .select(
        `
        *,
        user:users!inner(
          id,
          full_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      posts: (data || []) as CommunityPost[],
      total: count || 0,
    };
  }

  static async getPost(id: number): Promise<CommunityPost | null> {
    const { data, error } = await supabase
      .from('community_posts')
      .select(
        `
        *,
        user:users!inner(
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as CommunityPost;
  }

  static async updatePostStatus(
    id: number,
    status: CommunityPost['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('community_posts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async deletePost(id: number): Promise<void> {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getComments(
    postId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{ comments: Comment[]; total: number }> {
    const { data, error, count } = await supabase
      .from('community_comments')
      .select(
        `
        *,
        user:users!inner(
          id,
          full_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Note: community_comments table doesn't have parent_comment_id, so no nested replies
    const comments = data || [];

    return {
      comments: comments as Comment[],
      total: count || 0,
    };
  }

  static async updateCommentStatus(
    id: number,
    status: Comment['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('community_comments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteComment(id: number): Promise<void> {
    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getReports(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ reports: Report[]; total: number }> {
    // Using content_moderation table as proxy for reports
    let query = supabase
      .from('content_moderation')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform content_moderation data to Report format
    const reports = (data || []).map((mod: any) => ({
      id: parseInt(mod.id) || 0,
      post_id: mod.content_type === 'post' ? parseInt(mod.content_id) : null,
      comment_id:
        mod.content_type === 'comment' ? parseInt(mod.content_id) : null,
      reporter_user_id: mod.moderator_id || '',
      reason: mod.reason || 'other',
      description: mod.notes || null,
      status:
        mod.status === 'pending'
          ? 'pending'
          : mod.status === 'approved'
            ? 'resolved'
            : 'dismissed',
      created_at: mod.created_at,
      resolved_at: mod.updated_at !== mod.created_at ? mod.updated_at : null,
      resolved_by: mod.moderator_id || null,
    }));

    return {
      reports: reports as Report[],
      total: count || 0,
    };
  }

  static async updateReportStatus(
    id: number,
    status: Report['status'],
    resolvedBy?: string
  ): Promise<void> {
    // Map Report status to content_moderation status
    const moderationStatus =
      status === 'resolved'
        ? 'approved'
        : status === 'dismissed'
          ? 'rejected'
          : 'pending';

    const updateData: any = {
      status: moderationStatus,
      updated_at: new Date().toISOString(),
    };

    if (resolvedBy) {
      updateData.moderator_id = resolvedBy;
    }

    const { error } = await supabase
      .from('content_moderation')
      .update(updateData)
      .eq('id', id.toString());

    if (error) throw error;
  }

  // Analytics
  static async getCommunityStats(): Promise<{
    totalPosts: number;
    postsToday: number;
    totalComments: number;
    commentsToday: number;
    pendingReports: number;
    activeUsers: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [postsCount, commentsCount, reportsCount] = await Promise.all([
      supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true }),
      // Note: no specific reports table in schema, using content_moderation instead
      supabase
        .from('content_moderation')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

    const [postsTodayCount, commentsTodayCount] = await Promise.all([
      supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO),
      supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO),
    ]);

    // Get active users (users who posted or commented in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const { data: activeUsersData } = await supabase
      .from('community_posts')
      .select('user_id')
      .gte('created_at', sevenDaysAgoISO);

    const { data: activeCommentersData } = await supabase
      .from('community_comments')
      .select('user_id')
      .gte('created_at', sevenDaysAgoISO);

    const activeUserIds = new Set([
      ...(activeUsersData || []).map((p: any) => p.user_id),
      ...(activeCommentersData || []).map((c: any) => c.user_id),
    ]);

    return {
      totalPosts: postsCount.count || 0,
      postsToday: postsTodayCount.count || 0,
      totalComments: commentsCount.count || 0,
      commentsToday: commentsTodayCount.count || 0,
      pendingReports: reportsCount.count || 0,
      activeUsers: activeUserIds.size,
    };
  }

  static async getMostActiveUsers(limit: number = 10): Promise<
    Array<{
      user_id: string;
      full_name: string | null;
      posts_count: number;
      comments_count: number;
      total_activity: number;
    }>
  > {
    // This would require a more complex query in a real implementation
    // For now, we'll return mock data
    return [];
  }

  static async getPopularTags(limit: number = 20): Promise<
    Array<{
      tag: string;
      count: number;
    }>
  > {
    // This would require extracting and counting tags from posts
    // For now, we'll return mock data
    return [];
  }

  static async getAllPosts(
    limit: number = 20,
    offset: number = 0,
    filters?: PostFilters
  ): Promise<CommunityPost[]> {
    try {
      let query = supabase
        .from('community_posts')
        .select(
          `
          *,
          user:users!inner(
            id,
            full_name,
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
        posts.map(async (post: any) => {
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
      const { data: post, error } = await supabase
        .from('community_posts')
        .select(
          `
          *,
          user:users!inner(
            id,
            full_name,
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
      // Fetch from community_comments table
      const { data: comments, error } = await supabase
        .from('community_comments')
        .select(
          `
          *,
          user:users!inner(
            id,
            full_name,
            avatar_url,
            email
          )
        `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw new Error(
          `Failed to fetch comments: ${error.message || 'Unknown error'}`
        );
      }

      return (comments || []).map((comment: any) => ({
        ...comment,
        user: Array.isArray(comment.user) ? comment.user[0] : comment.user,
      })) as CommunityComment[];
    } catch (error) {
      console.error('Error in getPostComments:', error);
      // If it's our custom error, re-throw it
      if (
        error instanceof Error &&
        error.message.startsWith('Failed to fetch comments:')
      ) {
        throw error;
      }
      // For other errors, provide a more descriptive message
      throw new Error(
        `Unable to load comments: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private static async getPostLikesCount(postId: number): Promise<number> {
    try {
      const { count, error } = await supabase
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
      const { count, error } = await supabase
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
      const { data: moderation, error } = await supabase
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

      return moderation as ModerationAction;
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
        const { error } = await supabase
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

        const { error } = await supabase
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

      const { error } = await supabase
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

  private static async logAdminActivity(
    adminId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: any
  ): Promise<void> {
    try {
      const { error } = await supabase.from('admin_activity_logs').insert({
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
    return supabase
      .channel('new-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        async (payload: any) => {
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
    return supabase
      .channel('flagged-content')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'content_moderation' },
        (payload: any) => {
          if (payload.new.status === 'pending') {
            callback(payload.new as ModerationAction);
          }
        }
      )
      .subscribe();
  }
}
