'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComponentLoading, TableLoading } from '@/components/shared/loading';
import { userService, User, UserFilters } from '@/lib/data/users';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [currentPage, filters]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        user =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      const { users: userData, total } = await userService.getUsers(filters, {
        page: currentPage,
        limit: itemsPerPage,
      });
      setUsers(userData);
      setFilteredUsers(userData);
      setTotalUsers(total);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);

    try {
      const activity = await userService.getUserActivity(user.id);
      setUserActivity(activity);
    } catch (error) {
      console.error('Error loading user activity:', error);
      setUserActivity([]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      await userService.bulkAction(selectedUsers, action);
      await loadUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          await userService.activateUser(userId);
          break;
        case 'deactivate':
          await userService.deactivateUser(userId);
          break;
        case 'reset_password':
          await userService.resetUserPassword(userId);
          break;
        case 'send_notification':
          await userService.sendNotification(userId, 'Admin notification');
          break;
        case 'export_data':
          const data = await userService.exportUserData(userId);
          // In a real app, this would trigger a download
          console.log('Export data:', data);
          break;
      }
      await loadUsers();
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const getStatusBadge = (user: User) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full border';

    switch (user.status) {
      case 'active':
        return (
          <Badge
            className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge
            className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}
          >
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1" />
            Inactive
          </Badge>
        );
      case 'suspended':
        return (
          <Badge
            className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 80) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          High
        </Badge>
      );
    } else if (score >= 50) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Medium
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">Low</Badge>
      );
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <TableLoading />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor user accounts, activity, and engagement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or location..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-300"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.fitnessLevel?.[0] || 'all'}
                onValueChange={value =>
                  setFilters(prev => ({
                    ...prev,
                    fitnessLevel: value === 'all' ? undefined : [value],
                  }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Fitness Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.isActive === undefined
                    ? 'all'
                    : filters.isActive.toString()
                }
                onValueChange={value =>
                  setFilters(prev => ({
                    ...prev,
                    isActive: value === 'all' ? undefined : value === 'true',
                  }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('activate')}
                    className="text-green-700 border-green-300 hover:bg-green-50"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('deactivate')}
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('reset_password')}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset Passwords
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onCheckedChange={checked => {
                      if (checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fitness Level</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedUsers(prev => [...prev, user.id]);
                        } else {
                          setSelectedUsers(prev =>
                            prev.filter(id => id !== user.id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleUserClick(user)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.avatar_url || ''}
                          alt={user.full_name || ''}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.full_name || 'Unnamed User'}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.fitness_level || 'Not set'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEngagementBadge(user.engagementScore)}
                      <span className="text-sm text-gray-500">
                        {user.engagementScore}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(user.lastActiveDate)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.membershipDuration}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUserClick(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleUserAction(
                            user.id,
                            user.status === 'active' ? 'deactivate' : 'activate'
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        {user.status === 'active' ? (
                          <UserX className="h-4 w-4 text-red-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers}{' '}
              users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedUser.avatar_url || ''}
                      alt={selectedUser.full_name || ''}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg">
                      {getInitials(selectedUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedUser.full_name || 'Unnamed User'}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                      {selectedUser.email}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(selectedUser)}
                      {getEngagementBadge(selectedUser.engagementScore)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="profile" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Email
                          </label>
                          <p className="text-gray-900">{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Full Name
                          </label>
                          <p className="text-gray-900">
                            {selectedUser.full_name || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Age
                          </label>
                          <p className="text-gray-900">
                            {selectedUser.age || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Gender
                          </label>
                          <p className="text-gray-900 capitalize">
                            {selectedUser.gender || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Location
                          </label>
                          <p className="text-gray-900">
                            {selectedUser.location || 'Not provided'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Fitness Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Fitness Level
                          </label>
                          <p className="text-gray-900 capitalize">
                            {selectedUser.fitness_level || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Activity Level
                          </label>
                          <p className="text-gray-900 capitalize">
                            {selectedUser.activity_level || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Height
                          </label>
                          <p className="text-gray-900">
                            {selectedUser.height_cm
                              ? `${selectedUser.height_cm} cm`
                              : 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Weight
                          </label>
                          <p className="text-gray-900">
                            {selectedUser.weight_kg
                              ? `${selectedUser.weight_kg} kg`
                              : 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Goals
                          </label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedUser.fitness_goals?.map((goal, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {goal}
                              </Badge>
                            )) || (
                              <span className="text-gray-500">
                                No goals set
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Member Since
                        </label>
                        <p className="text-gray-900">
                          {selectedUser.membershipDuration}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Last Active
                        </label>
                        <p className="text-gray-900">
                          {formatDate(selectedUser.lastActiveDate)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Engagement Score
                        </label>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900">
                            {selectedUser.engagementScore}%
                          </p>
                          {getEngagementBadge(selectedUser.engagementScore)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userActivity.length > 0 ? (
                        <div className="space-y-3">
                          {userActivity.map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Activity className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {activity.title}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatDate(activity.timestamp)}
                                </p>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {activity.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            No recent activity found
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Progress Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Progress tracking will be available soon
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleUserAction(
                              selectedUser.id,
                              selectedUser.status === 'active'
                                ? 'deactivate'
                                : 'activate'
                            )
                          }
                          className={
                            selectedUser.status === 'active'
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }
                        >
                          {selectedUser.status === 'active' ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate User
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate User
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            handleUserAction(selectedUser.id, 'reset_password')
                          }
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset Password
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            handleUserAction(
                              selectedUser.id,
                              'send_notification'
                            )
                          }
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Notification
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            handleUserAction(selectedUser.id, 'export_data')
                          }
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
