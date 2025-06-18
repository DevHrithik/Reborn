'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  TrendingUp,
  Filter,
  Search,
  Send,
  Paperclip,
  Star,
  UserCheck,
  Timer,
  BarChart3,
  Users,
  Headphones,
  FileText,
  Settings,
  Archive,
  Zap,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

// Mock data for demonstration
const mockTickets = [
  {
    id: 1001,
    title: 'Unable to sync workout data',
    description:
      "My workout data from yesterday isn't showing up in the app. I completed a full workout but it's not reflected in my progress.",
    status: 'open',
    priority: 'high',
    category: 'technical',
    user: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar_url: null,
    },
    assigned_agent: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 1002,
    title: 'Billing question about subscription',
    description:
      'I was charged twice for my monthly subscription. Can you help me understand why this happened?',
    status: 'in_progress',
    priority: 'medium',
    category: 'billing',
    user: { name: 'Mike Chen', email: 'mike@example.com', avatar_url: null },
    assigned_agent: { name: 'John Smith', email: 'john@reborn.com' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 1003,
    title: 'Feature request: Dark mode',
    description:
      'It would be great if the app had a dark mode option for better viewing in low light conditions.',
    status: 'resolved',
    priority: 'low',
    category: 'feature_request',
    user: { name: 'Emily Davis', email: 'emily@example.com', avatar_url: null },
    assigned_agent: { name: 'Sarah Johnson', email: 'sarah@reborn.com' },
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const mockMessages = [
  {
    id: 1,
    ticket_id: 1001,
    sender_type: 'user',
    content:
      "Hi, I'm having trouble with my workout data not syncing. Can you help?",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    sender: { name: 'Sarah Johnson', avatar_url: null },
  },
  {
    id: 2,
    ticket_id: 1001,
    sender_type: 'agent',
    content:
      "Hello Sarah! I'd be happy to help you with the sync issue. Can you tell me what device you're using and when you last tried to sync?",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    sender: { name: 'Support Agent', avatar_url: null },
  },
];

const mockStats = {
  totalTickets: 1247,
  openTickets: 23,
  inProgressTickets: 45,
  resolvedToday: 12,
  averageResponseTime: 25,
  satisfactionRating: 4.2,
  agentPerformance: [
    {
      agent_name: 'John Smith',
      assigned_tickets: 15,
      resolved_tickets: 12,
      avg_response_time: 25,
      satisfaction_rating: 4.2,
    },
    {
      agent_name: 'Sarah Johnson',
      assigned_tickets: 18,
      resolved_tickets: 16,
      avg_response_time: 18,
      satisfaction_rating: 4.5,
    },
  ],
};

export default function SupportDashboard() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assigned_to: 'all',
    search: '',
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_user':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTickets = mockTickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status)
      return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority)
      return false;
    if (filters.category !== 'all' && ticket.category !== filters.category)
      return false;
    if (
      filters.search &&
      !ticket.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message via API
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.resolvedToday} resolved today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.inProgressTickets} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.averageResponseTime}m
            </div>
            <p className="text-xs text-muted-foreground">
              ↓ 12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.satisfactionRating}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Select
                      value={filters.status}
                      onValueChange={value =>
                        setFilters(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_user">
                          Waiting User
                        </SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.priority}
                      onValueChange={value =>
                        setFilters(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.category}
                      onValueChange={value =>
                        setFilters(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="feature_request">
                          Feature Request
                        </SelectItem>
                        <SelectItem value="bug_report">Bug Report</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.assigned_to}
                      onValueChange={value =>
                        setFilters(prev => ({ ...prev, assigned_to: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        <SelectItem value="agent1">John Smith</SelectItem>
                        <SelectItem value="agent2">Sarah Johnson</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search tickets..."
                        className="pl-8"
                        value={filters.search}
                        onChange={e =>
                          setFilters(prev => ({
                            ...prev,
                            search: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tickets List */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedTicket?.id === ticket.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">#{ticket.id}</span>
                              <Badge
                                className={getPriorityColor(ticket.priority)}
                              >
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {ticket.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {ticket.user?.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(ticket.created_at)}
                              </div>
                              {ticket.assigned_agent && (
                                <div className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />
                                  {ticket.assigned_agent.name}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                ticket.status === 'resolved' ||
                                ticket.status === 'closed'
                              }
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredTickets.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No tickets found matching your criteria
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {selectedTicket
                      ? `Ticket #${selectedTicket.id}`
                      : 'Select a Ticket'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedTicket ? (
                    <div className="flex flex-col h-[600px]">
                      {/* Ticket Header */}
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {selectedTicket.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                className={getPriorityColor(
                                  selectedTicket.priority
                                )}
                              >
                                {selectedTicket.priority}
                              </Badge>
                              <Badge
                                className={getStatusColor(
                                  selectedTicket.status
                                )}
                              >
                                {selectedTicket.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                #{selectedTicket.id}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  selectedTicket.user?.avatar_url || undefined
                                }
                              />
                              <AvatarFallback>
                                {selectedTicket.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {selectedTicket.user?.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {selectedTicket.user?.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {mockMessages.map(message => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                            >
                              {message.sender_type === 'user' && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={
                                      message.sender?.avatar_url || undefined
                                    }
                                  />
                                  <AvatarFallback>
                                    {message.sender?.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              )}

                              <div
                                className={`max-w-[70%] ${
                                  message.sender_type === 'agent'
                                    ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
                                    : 'bg-gray-100 rounded-r-lg rounded-tl-lg'
                                } p-3`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs opacity-70">
                                    {new Date(
                                      message.created_at
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>

                              {message.sender_type === 'agent' && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 border-t bg-white">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            className="flex-1 min-h-[60px] max-h-[120px]"
                          />
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Select a ticket to start chatting
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-red-100 text-red-800">urgent</Badge>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-100 text-orange-800">
                      high
                    </Badge>
                    <span className="font-medium">34</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      medium
                    </Badge>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800">low</Badge>
                    <span className="font-medium">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Technical</span>
                    <span className="font-medium">145</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Billing</span>
                    <span className="font-medium">67</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Account</span>
                    <span className="font-medium">43</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Feature Request</span>
                    <span className="font-medium">28</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Avg Response</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStats.agentPerformance.map((agent, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {agent.agent_name}
                      </TableCell>
                      <TableCell>{agent.assigned_tickets}</TableCell>
                      <TableCell>{agent.resolved_tickets}</TableCell>
                      <TableCell>{agent.avg_response_time}m</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          {agent.satisfaction_rating}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Knowledge base management features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Support Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Agent management features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
