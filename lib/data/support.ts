import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface SupportTicket {
  id: number;
  user_id: string;
  assigned_to: string | null;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category:
    | 'technical'
    | 'billing'
    | 'account'
    | 'feature_request'
    | 'bug_report'
    | 'general';
  tags: string[] | null;
  satisfaction_rating: number | null; // 1-5
  satisfaction_feedback: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  assigned_agent?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  messages_count?: number;
  last_message_at?: string;
}

export interface SupportMessage {
  id: number;
  ticket_id: number;
  sender_id: string;
  sender_type: 'user' | 'agent';
  content: string;
  message_type: 'text' | 'system' | 'file_attachment';
  attachments: string[] | null;
  is_internal: boolean; // Internal notes between agents
  created_at: string;
  // Joined fields
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface KnowledgeBaseArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  status: 'draft' | 'published' | 'archived';
  views_count: number;
  helpful_votes: number;
  unhelpful_votes: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: {
    name: string;
    email: string;
  };
}

export interface ResponseTemplate {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  averageResponseTime: number; // in minutes
  averageResolutionTime: number; // in hours
  satisfactionRating: number; // average 1-5
  ticketsByPriority: Array<{ priority: string; count: number }>;
  ticketsByCategory: Array<{ category: string; count: number }>;
  ticketsByStatus: Array<{ status: string; count: number }>;
  agentPerformance: Array<{
    agent_id: string;
    agent_name: string;
    assigned_tickets: number;
    resolved_tickets: number;
    avg_response_time: number;
    satisfaction_rating: number;
  }>;
  trends: {
    ticketsThisWeek: number;
    ticketsLastWeek: number;
    responseTimeImprovement: number; // percentage
    satisfactionTrend: number; // percentage
  };
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'agent' | 'senior_agent' | 'supervisor';
  status: 'available' | 'busy' | 'away' | 'offline';
  max_concurrent_tickets: number;
  current_ticket_count: number;
  specialties: string[] | null;
  created_at: string;
}

export class SupportService {
  // Ticket Management
  static async getAllTickets(
    limit: number = 20,
    offset: number = 0,
    filters?: {
      status?: string;
      priority?: string;
      category?: string;
      assigned_to?: string;
      user_id?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<SupportTicket[]> {
    try {
      let query = supabase
        .from('support_chat_sessions')
        .select(
          `
          *,
          user:users!user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.assigned_to && filters.assigned_to !== 'all') {
        query = query.eq('assigned_agent_id', filters.assigned_to);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }

      // Transform database records to SupportTicket interface
      return (data || []).map((session: any) => ({
        id: session.id,
        user_id: session.user_id,
        assigned_to: session.assigned_agent_id,
        title: session.subject || 'Support Request',
        description: session.subject || 'Support Request',
        status: session.status,
        priority: session.priority,
        category: 'general' as const, // Default category since it's not in the DB
        tags: null,
        satisfaction_rating: null,
        satisfaction_feedback: null,
        first_response_at: null,
        resolved_at: session.status === 'resolved' ? session.updated_at : null,
        created_at: session.created_at,
        updated_at: session.updated_at,
        user: session.user
          ? {
              id: session.user.id,
              name: session.user.full_name || session.user.email,
              email: session.user.email,
              avatar_url: session.user.avatar_url,
            }
          : undefined,
        assigned_agent: undefined, // Will be populated separately if needed
        messages_count: 0, // Will be populated separately if needed
        last_message_at: session.last_message_at,
      })) as SupportTicket[];
    } catch (error) {
      console.error('Error in getAllTickets:', error);
      throw error;
    }
  }

  static async getTicketById(id: number): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_chat_sessions')
        .select(
          `
          *,
          user:users!user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching ticket:', error);
        return null;
      }

      if (!data) return null;

      // Get message count
      const { count: messageCount } = await supabase
        .from('support_chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', id);

      return {
        id: data.id,
        user_id: data.user_id,
        assigned_to: data.assigned_agent_id,
        title: data.subject || 'Support Request',
        description: data.subject || 'Support Request',
        status: data.status,
        priority: data.priority,
        category: 'general' as const,
        tags: null,
        satisfaction_rating: null,
        satisfaction_feedback: null,
        first_response_at: null,
        resolved_at: data.status === 'resolved' ? data.updated_at : null,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user: data.user
          ? {
              id: data.user.id,
              name: data.user.full_name || data.user.email,
              email: data.user.email,
              avatar_url: data.user.avatar_url,
            }
          : undefined,
        assigned_agent: undefined,
        messages_count: messageCount || 0,
        last_message_at: data.last_message_at,
      } as SupportTicket;
    } catch (error) {
      console.error('Error in getTicketById:', error);
      return null;
    }
  }

  static async createTicket(
    ticket: Partial<SupportTicket>
  ): Promise<SupportTicket> {
    try {
      const { data, error } = await supabase
        .from('support_chat_sessions')
        .insert({
          user_id: ticket.user_id,
          subject: ticket.title,
          status: ticket.status || 'open',
          priority: ticket.priority || 'medium',
          assigned_agent_id: ticket.assigned_to,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        throw error;
      }

      return this.getTicketById(data.id) as Promise<SupportTicket>;
    } catch (error) {
      console.error('Error in createTicket:', error);
      throw error;
    }
  }

  static async updateTicket(
    id: number,
    updates: Partial<SupportTicket>
  ): Promise<SupportTicket> {
    try {
      const updateData: any = {};

      if (updates.title) updateData.subject = updates.title;
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.assigned_to !== undefined)
        updateData.assigned_agent_id = updates.assigned_to;

      const { error } = await supabase
        .from('support_chat_sessions')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating ticket:', error);
        throw error;
      }

      return this.getTicketById(id) as Promise<SupportTicket>;
    } catch (error) {
      console.error('Error in updateTicket:', error);
      throw error;
    }
  }

  static async assignTicket(
    ticketId: number,
    agentId: string,
    assignedBy: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_chat_sessions')
        .update({
          assigned_agent_id: agentId,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error assigning ticket:', error);
        throw error;
      }

      // Add system message
      await this.addMessage(ticketId, assignedBy, 'agent', {
        content: `Ticket assigned to agent`,
        message_type: 'system',
      });
    } catch (error) {
      console.error('Error in assignTicket:', error);
      throw error;
    }
  }

  static async resolveTicket(
    ticketId: number,
    agentId: string,
    resolutionNotes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_chat_sessions')
        .update({
          status: 'resolved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error resolving ticket:', error);
        throw error;
      }

      if (resolutionNotes) {
        await this.addMessage(ticketId, agentId, 'agent', {
          content: resolutionNotes,
          message_type: 'text',
        });
      }

      // Add system message
      await this.addMessage(ticketId, agentId, 'agent', {
        content: 'Ticket marked as resolved',
        message_type: 'system',
      });
    } catch (error) {
      console.error('Error in resolveTicket:', error);
      throw error;
    }
  }

  // Message Management
  static async getTicketMessages(ticketId: number): Promise<SupportMessage[]> {
    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select(
          `
          *,
          sender:users!sender_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .eq('session_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return (data || []).map((msg: any) => ({
        id: msg.id,
        ticket_id: ticketId,
        sender_id: msg.sender_id,
        sender_type: msg.is_agent_message ? 'agent' : 'user',
        content: msg.message_text,
        message_type: 'text' as const,
        attachments: msg.attachments,
        is_internal: false,
        created_at: msg.created_at,
        sender: msg.sender
          ? {
              id: msg.sender.id,
              name: msg.sender.full_name || msg.sender.email,
              email: msg.sender.email,
              avatar_url: msg.sender.avatar_url,
            }
          : undefined,
      })) as SupportMessage[];
    } catch (error) {
      console.error('Error in getTicketMessages:', error);
      throw error;
    }
  }

  static async addMessage(
    ticketId: number,
    senderId: string,
    senderType: 'user' | 'agent',
    message: Partial<SupportMessage>
  ): Promise<SupportMessage> {
    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .insert({
          session_id: ticketId,
          sender_id: senderId,
          message_text: message.content,
          is_agent_message: senderType === 'agent',
          attachments: message.attachments,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding message:', error);
        throw error;
      }

      // Update session's last_message_at
      await supabase
        .from('support_chat_sessions')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      return {
        id: data.id,
        ticket_id: ticketId,
        sender_id: senderId,
        sender_type: senderType,
        content: data.message_text,
        message_type: 'text',
        attachments: data.attachments,
        is_internal: false,
        created_at: data.created_at,
      } as SupportMessage;
    } catch (error) {
      console.error('Error in addMessage:', error);
      throw error;
    }
  }

  // Mock implementations for features not yet in database
  static async getKnowledgeBaseArticles(
    limit: number = 20,
    offset: number = 0,
    filters?: {
      category?: string;
      status?: string;
      search?: string;
    }
  ): Promise<KnowledgeBaseArticle[]> {
    // Mock data for now
    return [
      {
        id: 1,
        title: 'How to sync workout data',
        content:
          'To sync your workout data, go to Settings > Sync and tap "Sync Now"...',
        category: 'Technical',
        tags: ['sync', 'workout', 'data'],
        status: 'published',
        views_count: 245,
        helpful_votes: 23,
        unhelpful_votes: 2,
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Billing and subscription FAQ',
        content: 'Common questions about billing and subscriptions...',
        category: 'Billing',
        tags: ['billing', 'subscription', 'payment'],
        status: 'published',
        views_count: 189,
        helpful_votes: 18,
        unhelpful_votes: 1,
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  static async createKnowledgeBaseArticle(
    article: Partial<KnowledgeBaseArticle>
  ): Promise<KnowledgeBaseArticle> {
    // Mock implementation
    return {
      id: Math.floor(Math.random() * 1000),
      title: article.title || '',
      content: article.content || '',
      category: article.category || 'General',
      tags: article.tags || [],
      status: article.status || 'draft',
      views_count: 0,
      helpful_votes: 0,
      unhelpful_votes: 0,
      created_by: article.created_by || 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  static async getResponseTemplates(
    category?: string
  ): Promise<ResponseTemplate[]> {
    // Mock data for now
    return [
      {
        id: 1,
        title: 'Welcome Message',
        content:
          'Hello! Thank you for contacting support. How can I help you today?',
        category: 'General',
        tags: ['welcome', 'greeting'],
        usage_count: 156,
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Billing Issue Response',
        content:
          'I understand you have a billing concern. Let me check your account details...',
        category: 'Billing',
        tags: ['billing', 'payment'],
        usage_count: 89,
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  static async useResponseTemplate(templateId: number): Promise<void> {
    // Mock implementation - would increment usage_count in real app
    console.log(`Used template ${templateId}`);
  }

  static async getAvailableAgents(): Promise<SupportAgent[]> {
    // Mock data for now - would query actual agents
    return [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@reborn.com',
        role: 'agent',
        status: 'available',
        max_concurrent_tickets: 10,
        current_ticket_count: 3,
        specialties: ['technical', 'billing'],
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@reborn.com',
        role: 'senior_agent',
        status: 'busy',
        max_concurrent_tickets: 15,
        current_ticket_count: 8,
        specialties: ['technical', 'account'],
        created_at: new Date().toISOString(),
      },
    ];
  }

  static async getAgentWorkload(agentId: string): Promise<{
    assigned: number;
    resolved_today: number;
    avg_response_time: number;
  }> {
    // Mock implementation
    return {
      assigned: 5,
      resolved_today: 3,
      avg_response_time: 25,
    };
  }

  // Analytics & Stats
  static async getSupportStats(): Promise<SupportStats> {
    try {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedToday,
        ticketsByStatus,
        ticketsByPriority,
      ] = await Promise.all([
        this.getTotalTicketsCount(),
        this.getTicketsByStatus('open'),
        this.getTicketsByStatus('in_progress'),
        this.getResolvedTodayCount(),
        this.getTicketsByStatusStats(),
        this.getTicketsByPriorityStats(),
      ]);

      return {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedToday,
        averageResponseTime: 25, // Mock data
        averageResolutionTime: 4.5, // Mock data
        satisfactionRating: 4.2, // Mock data
        ticketsByPriority,
        ticketsByCategory: [
          { category: 'technical', count: 15 },
          { category: 'billing', count: 8 },
          { category: 'general', count: 12 },
        ],
        ticketsByStatus,
        agentPerformance: [
          {
            agent_id: '1',
            agent_name: 'John Smith',
            assigned_tickets: 15,
            resolved_tickets: 12,
            avg_response_time: 25,
            satisfaction_rating: 4.2,
          },
          {
            agent_id: '2',
            agent_name: 'Sarah Johnson',
            assigned_tickets: 18,
            resolved_tickets: 16,
            avg_response_time: 18,
            satisfaction_rating: 4.5,
          },
        ],
        trends: {
          ticketsThisWeek: 45,
          ticketsLastWeek: 38,
          responseTimeImprovement: 12,
          satisfactionTrend: 5,
        },
      };
    } catch (error) {
      console.error('Error getting support stats:', error);
      throw error;
    }
  }

  private static async getTotalTicketsCount(): Promise<number> {
    const { count } = await supabase
      .from('support_chat_sessions')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private static async getTicketsByStatus(status: string): Promise<number> {
    const { count } = await supabase
      .from('support_chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    return count || 0;
  }

  private static async getResolvedTodayCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('support_chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('updated_at', `${today}T00:00:00.000Z`)
      .lte('updated_at', `${today}T23:59:59.999Z`);
    return count || 0;
  }

  private static async getTicketsByStatusStats(): Promise<
    Array<{ status: string; count: number }>
  > {
    const { data } = await supabase
      .from('support_chat_sessions')
      .select('status');

    if (!data) return [];

    const statusStats: Record<string, number> = {};
    data.forEach((ticket: any) => {
      statusStats[ticket.status] = (statusStats[ticket.status] || 0) + 1;
    });

    return Object.entries(statusStats).map(([status, count]) => ({
      status,
      count,
    }));
  }

  private static async getTicketsByPriorityStats(): Promise<
    Array<{ priority: string; count: number }>
  > {
    const { data } = await supabase
      .from('support_chat_sessions')
      .select('priority');

    if (!data) return [];

    const priorityStats: Record<string, number> = {};
    data.forEach((ticket: any) => {
      priorityStats[ticket.priority] =
        (priorityStats[ticket.priority] || 0) + 1;
    });

    return Object.entries(priorityStats).map(([priority, count]) => ({
      priority,
      count,
    }));
  }

  static async autoAssignTicket(ticketId: number): Promise<void> {
    // Mock implementation - would implement load balancing logic
    const agents = await this.getAvailableAgents();
    const availableAgent = agents.find(
      agent =>
        agent.status === 'available' &&
        agent.current_ticket_count < agent.max_concurrent_tickets
    );

    if (availableAgent) {
      await this.assignTicket(ticketId, availableAgent.id, 'system');
    }
  }

  static groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce(
      (result, item) => {
        const group = String(item[key]);
        result[group] = (result[group] || 0) + 1;
        return result;
      },
      {} as Record<string, number>
    );
  }

  // Real-time subscriptions
  static subscribeToNewTickets(callback: (ticket: SupportTicket) => void) {
    return supabase
      .channel('new-tickets')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_chat_sessions' },
        async payload => {
          const ticket = await this.getTicketById(payload.new.id);
          if (ticket) {
            callback(ticket);
          }
        }
      )
      .subscribe();
  }

  static subscribeToTicketUpdates(
    ticketId: number,
    callback: (ticket: SupportTicket) => void
  ) {
    return supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_chat_sessions',
          filter: `id=eq.${ticketId}`,
        },
        async payload => {
          const ticket = await this.getTicketById(payload.new.id);
          if (ticket) {
            callback(ticket);
          }
        }
      )
      .subscribe();
  }

  static subscribeToTicketMessages(
    ticketId: number,
    callback: (message: SupportMessage) => void
  ) {
    return supabase
      .channel(`messages-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `session_id=eq.${ticketId}`,
        },
        payload => {
          const message: SupportMessage = {
            id: payload.new.id,
            ticket_id: ticketId,
            sender_id: payload.new.sender_id,
            sender_type: payload.new.is_agent_message ? 'agent' : 'user',
            content: payload.new.message_text,
            message_type: 'text',
            attachments: payload.new.attachments,
            is_internal: false,
            created_at: payload.new.created_at,
          };
          callback(message);
        }
      )
      .subscribe();
  }
}
