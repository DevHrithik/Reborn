'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComponentLoading } from '@/components/shared/loading';
import { dashboardService } from '@/lib/data/dashboard';
import {
  Users,
  Activity,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  Zap,
  Star,
  Shield,
  RefreshCw,
} from 'lucide-react';

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

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ComponentLoading />;
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
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
      title: 'Active Workouts',
      value: metrics.activeUsers.toLocaleString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    },
    {
      title: 'Community Posts',
      value: metrics.communityPosts.toLocaleString(),
      change: '+23%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
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
  ];

  const recentActivity = metrics.recentActivity.map((activity, index) => ({
    id: index + 1,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back! Here's what's happening with REBORN.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={loadDashboardData}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => {
            const Icon = stat.icon;
            const isPositive = stat.changeType === 'positive';

            return (
              <Card
                key={stat.title}
                className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                <div
                  className={`absolute inset-0 ${stat.bgColor} opacity-50`}
                ></div>
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="flex items-center mt-2">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change} from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {recentActivity.map(activity => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        activity.status === 'success'
                          ? 'bg-green-100 text-green-600'
                          : activity.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.status === 'success'
                          ? 'default'
                          : activity.status === 'warning'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="capitalize"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                <Users className="h-5 w-5 mr-3" />
                Manage Users
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                <MessageSquare className="h-5 w-5 mr-3" />
                Review Community Posts
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                <HelpCircle className="h-5 w-5 mr-3" />
                Handle Support Tickets
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
                <Activity className="h-5 w-5 mr-3" />
                Add New Workout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 border-b">
            <CardTitle className="text-xl text-gray-900">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    API Status
                  </p>
                  <p className="text-xs text-green-600">
                    All systems operational
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Star className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Database
                  </p>
                  <p className="text-xs text-green-600">Connected & Healthy</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Star className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div
                className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${
                  metrics.systemHealth === 'healthy'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                    : metrics.systemHealth === 'warning'
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      metrics.systemHealth === 'healthy'
                        ? 'text-green-800'
                        : metrics.systemHealth === 'warning'
                          ? 'text-yellow-800'
                          : 'text-red-800'
                    }`}
                  >
                    System Health
                  </p>
                  <p
                    className={`text-xs ${
                      metrics.systemHealth === 'healthy'
                        ? 'text-green-600'
                        : metrics.systemHealth === 'warning'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    Status: {metrics.systemHealth}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full animate-pulse ${
                      metrics.systemHealth === 'healthy'
                        ? 'bg-green-500'
                        : metrics.systemHealth === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  ></div>
                  {metrics.systemHealth === 'healthy' ? (
                    <Star className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp
                      className={`h-4 w-4 ${
                        metrics.systemHealth === 'warning'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
