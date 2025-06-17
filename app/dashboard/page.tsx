'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    },
    {
      title: 'Active Workouts',
      value: '8,392',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    },
    {
      title: 'Community Posts',
      value: '2,847',
      change: '-3%',
      changeType: 'negative' as const,
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    },
    {
      title: 'Support Tickets',
      value: '147',
      change: '+24%',
      changeType: 'negative' as const,
      icon: HelpCircle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'user_registration',
      message: 'New user registered: John Doe',
      time: '2 minutes ago',
      status: 'success',
      icon: UserPlus,
    },
    {
      id: 2,
      type: 'support_ticket',
      message: 'Support ticket #1234 opened',
      time: '5 minutes ago',
      status: 'warning',
      icon: HelpCircle,
    },
    {
      id: 3,
      type: 'community_post',
      message: 'Community post flagged for review',
      time: '12 minutes ago',
      status: 'error',
      icon: Shield,
    },
    {
      id: 4,
      type: 'workout_completed',
      message: '500+ users completed workouts today',
      time: '1 hour ago',
      status: 'success',
      icon: Zap,
    },
  ];

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
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    Storage
                  </p>
                  <p className="text-xs text-yellow-600">85% capacity</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
