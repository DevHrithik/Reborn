'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComponentLoading } from '@/components/shared/loading';
import { dashboardService } from '@/lib/data/dashboard';
import { useToast } from '@/hooks/ui/use-toast';
import {
  Users,
  Activity,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Zap,
  Shield,
  RefreshCw,
  Dumbbell,
  BookOpen,
  ChefHat,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  supportTickets: number;
  communityPosts: number;
  pendingModeration: number;
  workoutSessions: number;
  totalPlans: number;
  totalRecipes: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivity: ActivityItem[];
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

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();

    // Set up real-time updates
    const unsubscribe = dashboardService.subscribeToUpdates(() => {
      loadDashboardData();
    });

    // Auto-refresh every 5 minutes
    const interval = setInterval(
      () => {
        loadDashboardData();
      },
      5 * 60 * 1000
    );

    return () => {
      unsubscribe.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getDashboardMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !metrics) {
    return <ComponentLoading />;
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers.toLocaleString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    },
    {
      title: 'Workout Sessions',
      value: metrics.workoutSessions.toLocaleString(),
      change: '+15%',
      changeType: 'positive' as const,
      icon: Dumbbell,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    },
    {
      title: 'Community Posts',
      value: metrics.communityPosts.toLocaleString(),
      change: '+23%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    },
    {
      title: 'Support Tickets',
      value: metrics.supportTickets.toLocaleString(),
      change: '-5%',
      changeType: 'negative' as const,
      icon: HelpCircle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    },
    {
      title: 'Workout Plans',
      value: metrics.totalPlans.toLocaleString(),
      change: '+2%',
      changeType: 'positive' as const,
      icon: BookOpen,
      color: 'from-teal-500 to-green-500',
      bgColor: 'bg-gradient-to-br from-teal-50 to-green-50',
    },
    {
      title: 'Recipes',
      value: metrics.totalRecipes.toLocaleString(),
      change: '+7%',
      changeType: 'positive' as const,
      icon: ChefHat,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    },
    {
      title: 'New Users Today',
      value: metrics.newUsersToday.toLocaleString(),
      change: metrics.newUsersToday > 0 ? '+100%' : '0%',
      changeType:
        metrics.newUsersToday > 0
          ? ('positive' as const)
          : ('neutral' as const),
      icon: UserPlus,
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
    },
  ];

  const recentActivity = metrics.recentActivity.map((activity) => ({
    id: activity.id,
    type: activity.type,
    message: `${activity.title}: ${activity.description}`,
    time: formatTimeAgo(activity.timestamp),
    status: getActivityStatus(activity.status),
    icon: getActivityIcon(activity.type),
  }));

  function getActivityIcon(type: string) {
    switch (type) {
      case 'user_registration':
        return UserPlus;
      case 'support_ticket':
        return HelpCircle;
      case 'community_post':
        return MessageSquare;
      case 'workout_session':
        return Dumbbell;
      case 'system_event':
        return Shield;
      default:
        return Activity;
    }
  }

  function getActivityStatus(status?: string) {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'urgent':
        return 'error';
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'success';
    }
  }

  function formatTimeAgo(timestamp: string) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back! Here&apos;s what&apos;s happening with REBORN.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={loadDashboardData}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <div className="flex items-center gap-2">
              {(() => {
                const HealthIcon = getSystemHealthIcon(metrics.systemHealth);
                return (
                  <Badge className={getSystemHealthColor(metrics.systemHealth)}>
                    <HealthIcon className="h-3 w-3 mr-1" />
                    System {metrics.systemHealth}
                  </Badge>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-1">
                        {stat.changeType === 'positive' ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : stat.changeType === 'negative' ? (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        ) : (
                          <div className="h-3 w-3" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            stat.changeType === 'positive'
                              ? 'text-green-600'
                              : stat.changeType === 'negative'
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500">
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    recentActivity.map(activity => {
                      const ActivityIcon = activity.icon;
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              activity.status === 'success'
                                ? 'bg-green-100 text-green-600'
                                : activity.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : activity.status === 'error'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            <ActivityIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                          <Badge
                            variant={
                              activity.status === 'success'
                                ? 'default'
                                : activity.status === 'warning'
                                  ? 'secondary'
                                  : activity.status === 'error'
                                    ? 'destructive'
                                    : 'outline'
                            }
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                  onClick={() => window.open('/users', '_blank')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-purple-50 border-purple-200"
                  onClick={() => window.open('/community', '_blank')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Community Posts
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-orange-50 border-orange-200"
                  onClick={() => window.open('/support', '_blank')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Support Tickets
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-green-50 border-green-200"
                  onClick={() => window.open('/workouts', '_blank')}
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Workout Plans
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-green-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Health</span>
                  <Badge className={getSystemHealthColor(metrics.systemHealth)}>
                    {metrics.systemHealth}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium">
                    {metrics.activeUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Open Tickets</span>
                  <span className="text-sm font-medium">
                    {metrics.supportTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Pending Moderation
                  </span>
                  <span className="text-sm font-medium">
                    {metrics.pendingModeration}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
