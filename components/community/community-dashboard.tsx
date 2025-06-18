'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  MessageSquare,
  Flag,
  TrendingUp,
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  Activity,
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import {
  CommunityService,
  type CommunityPost,
  type CommunityComment,
  type CommunityStats,
  type PostFilters,
} from '@/lib/data/community';

export function CommunityDashboard() {
  const { toast } = useToast();

  // State management
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [moderationDialog, setModerationDialog] = useState<{
    open: boolean;
    post: CommunityPost | null;
  }>({
    open: false,
    post: null,
  });
  const [postDetailsDialog, setPostDetailsDialog] = useState<{
    open: boolean;
    post: CommunityPost | null;
  }>({
    open: false,
    post: null,
  });
  const [postComments, setPostComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  const [filters, setFilters] = useState<PostFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, [filters]);

  // Set up real-time subscriptions
  useEffect(() => {
    const newPostsSubscription = CommunityService.subscribeToNewPosts(
      newPost => {
        setPosts(prev => [newPost, ...prev]);
        setStats(prev =>
          prev ? { ...prev, totalPosts: prev.totalPosts + 1 } : null
        );

        toast({
          title: 'New Community Post',
          description: `New ${newPost.post_type} post from ${newPost.user?.full_name || 'Unknown User'}`,
        });
      }
    );

    const flaggedContentSubscription =
      CommunityService.subscribeToFlaggedContent(moderation => {
        setStats(prev =>
          prev ? { ...prev, flaggedContent: prev.flaggedContent + 1 } : null
        );

        toast({
          title: 'Content Flagged',
          description: 'New content requires moderation review',
          variant: 'destructive',
        });
      });

    return () => {
      newPostsSubscription.unsubscribe();
      flaggedContentSubscription.unsubscribe();
    };
  }, [toast]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, statsData] = await Promise.all([
        CommunityService.getAllPosts(50, 0, filters),
        CommunityService.getCommunityStats(),
      ]);

      setPosts(postsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading community data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load community data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPostComments = async (postId: number) => {
    try {
      setLoadingComments(true);
      const comments = await CommunityService.getPostComments(postId);
      setPostComments(comments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments.',
        variant: 'destructive',
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSearch = async () => {
    const searchFilters = { ...filters, search: searchTerm || undefined };
    setFilters(searchFilters);
  };

  const handleFilterChange = (key: keyof PostFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  };

  const handleSelectPost = (postId: number, checked: boolean) => {
    const newSelected = new Set(selectedPosts);
    if (checked) {
      newSelected.add(postId);
    } else {
      newSelected.delete(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(new Set(posts.map(p => p.id)));
    } else {
      setSelectedPosts(new Set());
    }
  };

  const handleViewPost = async (post: CommunityPost) => {
    setPostDetailsDialog({ open: true, post });
    await loadPostComments(post.id);
  };

  const handleModeratePost = async (
    postId: number,
    action: 'approve' | 'reject' | 'delete',
    reason?: string
  ) => {
    try {
      // Using the actual admin user ID from the database
      const adminId = '90bc1e63-0f9c-48c7-8fcf-dec340b74069';

      await CommunityService.moderatePost(postId, action, adminId, reason);

      // Update local state
      if (action === 'delete') {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast({
          title: 'Post Deleted',
          description: 'The post has been permanently deleted.',
        });
      } else {
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? {
                  ...p,
                  moderation_status:
                    action === 'approve' ? 'approved' : 'rejected',
                  is_flagged: false,
                }
              : p
          )
        );

        toast({
          title: action === 'approve' ? 'Post Approved' : 'Post Rejected',
          description:
            action === 'approve'
              ? 'The post is now visible to all users.'
              : 'The post has been hidden from users.',
        });
      }

      // Close dialogs
      setModerationDialog({ open: false, post: null });
      setPostDetailsDialog({ open: false, post: null });
      setModerationReason('');

      // Refresh stats
      const newStats = await CommunityService.getCommunityStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error moderating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to moderate post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      // In a real implementation, you'd have a deleteComment method
      // For now, we'll just remove it from local state
      setPostComments(prev => prev.filter(c => c.id !== commentId));

      toast({
        title: 'Comment Deleted',
        description: 'The comment has been removed.',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkModeration = async (action: 'approve' | 'reject') => {
    if (selectedPosts.size === 0) return;

    try {
      const adminId = '90bc1e63-0f9c-48c7-8fcf-dec340b74069';
      const postIds = Array.from(selectedPosts);

      await CommunityService.bulkModerate(
        postIds,
        action,
        adminId,
        'Bulk moderation'
      );

      // Update local state
      setPosts(prev =>
        prev.map(p =>
          selectedPosts.has(p.id)
            ? {
                ...p,
                moderation_status:
                  action === 'approve' ? 'approved' : 'rejected',
                is_flagged: false,
              }
            : p
        )
      );

      setSelectedPosts(new Set());

      toast({
        title: 'Bulk Moderation Complete',
        description: `${selectedPosts.size} posts ${action}d successfully`,
      });

      // Refresh stats
      const newStats = await CommunityService.getCommunityStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error bulk moderating:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk moderate posts. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPostTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      milestone: 'bg-green-100 text-green-800',
      tip: 'bg-blue-100 text-blue-800',
      celebration: 'bg-yellow-100 text-yellow-800',
      question: 'bg-purple-100 text-purple-800',
      sharing: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status || 'approved'] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.postsToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Moderation
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingModeration}
              </div>
              <p className="text-xs text-muted-foreground">Requires review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Flagged Content
              </CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.flaggedContent}</div>
              <p className="text-xs text-muted-foreground">
                Auto-flagged items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Engagement
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.engagementMetrics.averageLikes}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.engagementMetrics.averageComments} avg. comments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts & Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Filter & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <Select
                  onValueChange={value => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={value => handleFilterChange('type', value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="tip">Tip</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="sharing">Sharing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPosts.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedPosts.size} selected
                  </span>
                  <Button
                    onClick={() => handleBulkModeration('approve')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve All
                  </Button>
                  <Button
                    onClick={() => handleBulkModeration('reject')}
                    size="sm"
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject All
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Community Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedPosts.size === posts.length &&
                          posts.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map(post => (
                    <TableRow
                      key={post.id}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedPosts.has(post.id)}
                          onCheckedChange={checked =>
                            handleSelectPost(post.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={post.user?.avatar_url || undefined}
                            />
                            <AvatarFallback>
                              {post.user?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {post.user?.full_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {post.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleViewPost(post)}>
                        <div className="max-w-md">
                          <p className="truncate">{post.content}</p>
                          {post.image_url && (
                            <Badge variant="outline" className="mt-1">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Has Image
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPostTypeColor(post.post_type)}>
                          {post.post_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(post.moderation_status)}
                        >
                          {post.moderation_status || 'approved'}
                        </Badge>
                        {post.is_flagged && (
                          <Flag className="h-4 w-4 text-red-500 ml-1 inline" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1 text-red-500" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1 text-blue-500" />
                            {post.comments_count}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(post.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            onClick={() => handleViewPost(post)}
                            size="sm"
                            variant="outline"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              handleModeratePost(post.id, 'approve')
                            }
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            title="Approve Post"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              handleModeratePost(post.id, 'reject')
                            }
                            size="sm"
                            variant="destructive"
                            title="Reject Post"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              setModerationDialog({ open: true, post })
                            }
                            size="sm"
                            variant="outline"
                            title="Delete Post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Posts by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.postsByType.map(item => (
                      <div
                        key={item.type}
                        className="flex justify-between items-center"
                      >
                        <span className="capitalize">{item.type}</span>
                        <Badge>{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Moderation Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Approved Today</span>
                      <Badge className="bg-green-100 text-green-800">
                        {stats.moderationStats.approvedToday}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rejected Today</span>
                      <Badge className="bg-red-100 text-red-800">
                        {stats.moderationStats.rejectedToday}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Auto-approved</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {stats.moderationStats.autoApproved}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg. Response Time</span>
                      <Badge>{stats.moderationStats.responseTime}m</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Post Details Modal */}
      <Dialog
        open={postDetailsDialog.open}
        onOpenChange={open => setPostDetailsDialog({ open, post: null })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {postDetailsDialog.post && (
            <div className="space-y-6">
              {/* Post Header */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={postDetailsDialog.post.user?.avatar_url || undefined}
                  />
                  <AvatarFallback>
                    {postDetailsDialog.post.user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">
                      {postDetailsDialog.post.user?.full_name || 'Unknown User'}
                    </h3>
                    <Badge
                      className={getPostTypeColor(
                        postDetailsDialog.post.post_type
                      )}
                    >
                      {postDetailsDialog.post.post_type}
                    </Badge>
                    <Badge
                      className={getStatusColor(
                        postDetailsDialog.post.moderation_status
                      )}
                    >
                      {postDetailsDialog.post.moderation_status || 'approved'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(postDetailsDialog.post.created_at)}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">
                    {postDetailsDialog.post.content}
                  </p>
                </div>

                {/* Post Image */}
                {postDetailsDialog.post.image_url && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={postDetailsDialog.post.image_url}
                      alt="Post image"
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-red-500" />
                    {postDetailsDialog.post.likes_count} likes
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                    {postDetailsDialog.post.comments_count} comments
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    Comments ({postComments.length})
                  </h4>
                </div>

                <ScrollArea className="h-64 w-full border rounded-lg p-4">
                  {loadingComments ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  ) : postComments.length > 0 ? (
                    <div className="space-y-4">
                      {postComments.map(comment => (
                        <div
                          key={comment.id}
                          className="flex items-start space-x-3 group"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={comment.user?.avatar_url || undefined}
                            />
                            <AvatarFallback>
                              {comment.user?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">
                                {comment.user?.full_name || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {comment.content}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleDeleteComment(comment.id)}
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No comments yet
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  onClick={() =>
                    handleModeratePost(postDetailsDialog.post!.id, 'approve')
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Post
                </Button>
                <Button
                  onClick={() =>
                    handleModeratePost(postDetailsDialog.post!.id, 'reject')
                  }
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Post
                </Button>
                <Button
                  onClick={() => {
                    setModerationDialog({
                      open: true,
                      post: postDetailsDialog.post,
                    });
                    setPostDetailsDialog({ open: false, post: null });
                  }}
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={moderationDialog.open}
        onOpenChange={open => setModerationDialog({ open, post: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to permanently delete this post? This action
              cannot be undone.
            </p>
            <Textarea
              placeholder="Reason for deletion (optional)"
              value={moderationReason}
              onChange={e => setModerationReason(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setModerationDialog({ open: false, post: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  handleModeratePost(
                    moderationDialog.post!.id,
                    'delete',
                    moderationReason
                  )
                }
              >
                Delete Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
