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
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/ui/use-toast';
import {
  SupportService,
  type SupportTicket,
  type SupportMessage,
  type SupportStats,
} from '@/lib/data/support';

export default function SupportDashboard() {
  const { toast } = useToast();

  // State management
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assigned_to: 'all',
    search: '',
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, [filters]);

  // Set up real-time subscriptions
  useEffect(() => {
    const newTicketsSubscription = SupportService.subscribeToNewTickets(
      newTicket => {
        setTickets(prev => [newTicket, ...prev]);
        setStats(prev =>
          prev ? { ...prev, totalTickets: prev.totalTickets + 1 } : null
        );

        toast({
          title: 'New Support Ticket',
          description: `New ticket from ${newTicket.user?.name || 'Unknown User'}: ${newTicket.title}`,
        });
      }
    );

    return () => {
      newTicketsSubscription.unsubscribe();
    };
  }, [toast]);

  // Subscribe to selected ticket updates
  useEffect(() => {
    if (!selectedTicket) return;

    const ticketUpdatesSubscription = SupportService.subscribeToTicketUpdates(
      selectedTicket.id,
      updatedTicket => {
        setSelectedTicket(updatedTicket);
        setTickets(prev =>
          prev.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
        );
      }
    );

    const messagesSubscription = SupportService.subscribeToTicketMessages(
      selectedTicket.id,
      newMessage => {
        setTicketMessages(prev => [...prev, newMessage]);
      }
    );

    return () => {
      ticketUpdatesSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [selectedTicket]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        SupportService.getAllTickets(50, 0, filters),
        SupportService.getSupportStats(),
      ]);

      setTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading support data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTicketMessages = async (ticketId: number) => {
    try {
      setLoadingMessages(true);
      const messages = await SupportService.getTicketMessages(ticketId);
      setTicketMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleTicketSelect = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    await loadTicketMessages(ticket.id);
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      // Using a mock agent ID - in a real app, this would come from auth context
      const agentId = '9d57f6de-2f1a-4850-b50d-6c44dd3e2aa4';

      await SupportService.addMessage(selectedTicket.id, agentId, 'agent', {
        content: newMessage,
        message_type: 'text',
      });

      setNewMessage('');
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the user.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      await SupportService.updateTicket(ticketId, { status: newStatus as any });

      // Update local state
      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, status: newStatus as any } : t
        )
      );

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev =>
          prev ? { ...prev, status: newStatus as any } : null
        );
      }

      toast({
        title: 'Status Updated',
        description: `Ticket status changed to ${newStatus}`,
      });

      // Refresh stats
      const newStats = await SupportService.getSupportStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket status.',
        variant: 'destructive',
      });
    }
  };

  const handlePriorityChange = async (
    ticketId: number,
    newPriority: string
  ) => {
    try {
      await SupportService.updateTicket(ticketId, {
        priority: newPriority as any,
      });

      // Update local state
      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, priority: newPriority as any } : t
        )
      );

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev =>
          prev ? { ...prev, priority: newPriority as any } : null
        );
      }

      toast({
        title: 'Priority Updated',
        description: `Ticket priority changed to ${newPriority}`,
      });
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket priority.',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') {
      (newFilters as any)[key] = 'all';
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  };

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

  const filteredTickets = tickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status)
      return false;
    if (filters.priority !== 'all' && ticket.priority !== filters.priority)
      return false;
    if (
      filters.search &&
      !ticket.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

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
              <CardTitle className="text-sm font-medium">
                Total Tickets
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                {stats.openTickets} open
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.inProgressTickets}
              </div>
              <p className="text-xs text-muted-foreground">Being handled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resolved Today
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedToday}</div>
              <p className="text-xs text-muted-foreground">Completed today</p>
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
                {stats.averageResponseTime}m
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.satisfactionRating}/5 satisfaction
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search tickets..."
                    value={filters.search}
                    onChange={e => handleFilterChange('search', e.target.value)}
                    className="w-64"
                  />
                  <Button onClick={loadData} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <Select
                  onValueChange={value => handleFilterChange('status', value)}
                  defaultValue="all"
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_user">Waiting User</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={value => handleFilterChange('priority', value)}
                  defaultValue="all"
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map(ticket => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        #{ticket.id}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{ticket.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.user?.avatar_url} />
                            <AvatarFallback>
                              {ticket.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.user?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={value =>
                            handleStatusChange(ticket.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="waiting_user">
                              Waiting User
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.priority}
                          onValueChange={value =>
                            handlePriorityChange(ticket.id, value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <Badge
                              className={getPriorityColor(ticket.priority)}
                            >
                              {ticket.priority}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(ticket.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTicketSelect(ticket)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.agentPerformance.map(agent => (
                    <div key={agent.agent_id} className="border rounded p-3">
                      <div className="font-medium">{agent.agent_name}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Assigned: {agent.assigned_tickets}</div>
                        <div>Resolved: {agent.resolved_tickets}</div>
                        <div>Avg Response: {agent.avg_response_time}m</div>
                        <div>Rating: {agent.satisfaction_rating}/5</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Agent management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Details Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Ticket #{selectedTicket?.id} - {selectedTicket?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Ticket Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">User Information</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedTicket.user?.avatar_url} />
                      <AvatarFallback>
                        {selectedTicket.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {selectedTicket.user?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedTicket.user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ticket Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <Badge
                        className={getPriorityColor(selectedTicket.priority)}
                      >
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{formatDate(selectedTicket.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Messages:</span>
                      <span>{selectedTicket.messages_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-medium mb-2">Conversation</h4>
                  <ScrollArea className="h-96 border rounded p-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ticketMessages.map(message => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_type === 'agent'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                                message.sender_type === 'agent'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <div className="text-sm">{message.content}</div>
                              <div
                                className={`text-xs mt-1 ${
                                  message.sender_type === 'agent'
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatDate(message.created_at)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
