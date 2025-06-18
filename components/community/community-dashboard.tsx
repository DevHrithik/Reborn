'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Heart, 
  Clock, 
  User, 
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Video,
  Trophy,
  Dumbbell,
  HelpCircle,
  Filter,
  Search,
  MoreHorizontal,
  Ban,
  Flag,
  Trash2
} from 'lucide-react';

// Mock data for demonstration
const mockPosts = [
  {
    id: 1,
    content: "Just completed my first 5K run! Feeling amazing and ready for more challenges.",
    type: 'achievement',
    user: { name: 'Sarah Johnson', email: 'sarah@example.com', avatar_url: null },
    moderation_status: 'pending',
    is_flagged: false,
    likes_count: 12,
    comments_count: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    content: "Check out this workout routine I've been following. It's been great for building strength!",
    type: 'workout_share',
    user: { name: 'Mike Chen', email: 'mike@example.com', avatar_url: null },
    moderation_status: 'approved',
    is_flagged: false,
    likes_count: 24,
    comments_count: 8,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    content: "This is inappropriate content that should be flagged for review.",
    type: 'text',
    user: { name: 'Test User', email: 'test@example.com', avatar_url: null },
    moderation_status: 'pending',
    is_flagged: true,
    likes_count: 2,
    comments_count: 1,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const mockStats = {
  totalPosts: 1247,
  pendingModeration: 23,
  flaggedContent: 8,
  postsToday: 45,
  engagementMetrics: {
    averageLikes: 18,
    averageComments: 6,
  },
};

export default function CommunityDashboard() {
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [moderationReason, setModerationReason] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    flagged_only: false,
    search: ''
  });

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'workout_share': return <Dumbbell className="h-4 w-4" />;
      case 'question': return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'auto_approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPosts = mockPosts.filter(post => {
    if (filters.status !== 'all' && post.moderation_status !== filters.status) return false;
    if (filters.type !== 'all' && post.type !== filters.type) return false;
    if (filters.flagged_only && !post.is_flagged) return false;
    if (filters.search && !post.content.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.postsToday} posted today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Moderation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendingModeration}</div>
            <p className="text-xs text-muted-foreground">
              Needs review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.flaggedContent}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.engagementMetrics.averageLikes}</div>
            <p className="text-xs text-muted-foreground">
              Likes per post
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts & Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="auto_approved">Auto Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={filters.type} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="workout_share">Workout</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search posts..." 
                      className="pl-8 w-64"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="flagged"
                    checked={filters.flagged_only}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, flagged_only: checked as boolean }))
                    }
                  />
                  <label htmlFor="flagged" className="text-sm font-medium">
                    Flagged only
                  </label>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedPosts.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedPosts.length} posts selected
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Bulk Approve
                      </Button>
                      <Button variant="outline" size="sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Bulk Reject
                      </Button>
                    </div>
                  </div>
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
                        checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPosts(filteredPosts.map(p => p.id));
                          } else {
                            setSelectedPosts([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedPosts.includes(post.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPosts(prev => [...prev, post.id]);
                            } else {
                              setSelectedPosts(prev => prev.filter(id => id !== post.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm truncate">{post.content}</p>
                          {post.is_flagged && (
                            <Badge variant="destructive" className="mt-1">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {post.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{post.user?.name}</p>
                            <p className="text-xs text-gray-500">{post.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getPostTypeIcon(post.type)}
                          <span className="text-sm capitalize">{post.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(post.moderation_status)}>
                          {post.moderation_status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.comments_count}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDate(post.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedPost(post)}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Post Actions</DialogTitle>
                            </DialogHeader>
                            {selectedPost && (
                              <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={selectedPost.user?.avatar_url || undefined} />
                                      <AvatarFallback>
                                        {selectedPost.user?.name?.charAt(0) || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{selectedPost.user?.name}</p>
                                      <p className="text-sm text-gray-500">
                                        {formatDate(selectedPost.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm">{selectedPost.content}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      {selectedPost.likes_count} likes
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageCircle className="h-3 w-3" />
                                      {selectedPost.comments_count} comments
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Moderation Reason</label>
                                  <Textarea
                                    placeholder="Enter reason for moderation action..."
                                    value={moderationReason}
                                    onChange={(e) => setModerationReason(e.target.value)}
                                  />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {selectedPost.moderation_status === 'pending' && (
                                    <>
                                      <Button className="flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                      </Button>
                                      <Button variant="destructive">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  
                                  <Button variant="outline">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>

                                  <Button variant="outline">
                                    <Ban className="h-4 w-4 mr-1" />
                                    Ban User
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredPosts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No posts found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Posts by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Achievement</span>
                    </div>
                    <span className="font-medium">342</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      <span>Workout Share</span>
                    </div>
                    <span className="font-medium">256</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Text</span>
                    </div>
                    <span className="font-medium">189</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Average Likes</span>
                      <span className="font-medium">{mockStats.engagementMetrics.averageLikes}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Average Comments</span>
                      <span className="font-medium">{mockStats.engagementMetrics.averageComments}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                User management features will be integrated with the main user management system.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
