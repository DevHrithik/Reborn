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
    let query = supabase
      .from('support_tickets')
      .select(
        `
        *,
        user:users!user_id (
          id,
          name,
          email,
          avatar_url
        ),
        assigned_agent:users!assigned_to (
          id,
          name,
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

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.assigned_to && filters.assigned_to !== 'all') {
      query = query.eq('assigned_to', filters.assigned_to);
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
      console.error('Error fetching support tickets:', error);
      throw error;
    }

    return data || [];
  }

  static async getTicketById(id: number): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(
        `
        *,
        user:users!user_id (
          id,
          name,
          email,
          avatar_url
        ),
        assigned_agent:users!assigned_to (
          id,
          name,
          email,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }

    return data;
  }

  static async createTicket(
    ticket: Partial<SupportTicket>
  ): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }

    return data;
  }

  static async updateTicket(
    id: number,
    updates: Partial<SupportTicket>
  ): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }

    return data;
  }

  static async assignTicket(
    ticketId: number,
    agentId: string,
    assignedBy: string
  ): Promise<void> {
    const updates: any = {
      assigned_to: agentId,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    };

    // Set first response time if not already set
    const ticket = await this.getTicketById(ticketId);
    if (ticket && !ticket.first_response_at) {
      updates.first_response_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
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
  }

  static async resolveTicket(
    ticketId: number,
    agentId: string,
    resolutionNotes?: string
  ): Promise<void> {
    const updates: any = {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
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
  }

  // Message Management
  static async getTicketMessages(ticketId: number): Promise<SupportMessage[]> {
    const { data, error } = await supabase
      .from('support_messages')
      .select(
        `
        *,
        sender:users!sender_id (
          id,
          name,
          email,
          avatar_url
        )
      `
      )
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data || [];
  }

  static async addMessage(
    ticketId: number,
    senderId: string,
    senderType: 'user' | 'agent',
    message: Partial<SupportMessage>
  ): Promise<SupportMessage> {
    const messageData = {
      ticket_id: ticketId,
      sender_id: senderId,
      sender_type: senderType,
      content: message.content || '',
      message_type: message.message_type || 'text',
      attachments: message.attachments || null,
      is_internal: message.is_internal || false,
    };

    const { data, error } = await supabase
      .from('support_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      throw error;
    }

    // Update ticket's last activity
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return data;
  }

  // Knowledge Base Management
  static async getKnowledgeBaseArticles(
    limit: number = 20,
    offset: number = 0,
    filters?: {
      category?: string;
      status?: string;
      search?: string;
    }
  ): Promise<KnowledgeBaseArticle[]> {
    let query = supabase
      .from('knowledge_base_articles')
      .select(
        `
        *,
        author:users!created_by (
          name,
          email
        )
      `
      )
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching knowledge base articles:', error);
      throw error;
    }

    return data || [];
  }

  static async createKnowledgeBaseArticle(
    article: Partial<KnowledgeBaseArticle>
  ): Promise<KnowledgeBaseArticle> {
    const { data, error } = await supabase
      .from('knowledge_base_articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Error creating knowledge base article:', error);
      throw error;
    }

    return data;
  }

  // Response Templates
  static async getResponseTemplates(
    category?: string
  ): Promise<ResponseTemplate[]> {
    let query = supabase
      .from('response_templates')
      .select('*')
      .order('usage_count', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching response templates:', error);
      throw error;
    }

    return data || [];
  }

  static async useResponseTemplate(templateId: number): Promise<void> {
    const { error } = await supabase
      .from('response_templates')
      .update({ usage_count: supabase.raw('usage_count + 1') })
      .eq('id', templateId);

    if (error) {
      console.error('Error updating template usage:', error);
    }
  }

  // Agent Management
  static async getAvailableAgents(): Promise<SupportAgent[]> {
    const { data, error } = await supabase
      .from('support_agents')
      .select('*')
      .in('status', ['available', 'busy'])
      .order('current_ticket_count', { ascending: true });

    if (error) {
      console.error('Error fetching available agents:', error);
      throw error;
    }

    return data || [];
  }

  static async getAgentWorkload(agentId: string): Promise<{
    assigned: number;
    resolved_today: number;
    avg_response_time: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [assignedResult, resolvedResult] = await Promise.all([
      supabase
        .from('support_tickets')
        .select('id', { count: 'exact' })
        .eq('assigned_to', agentId)
        .in('status', ['open', 'in_progress', 'waiting_user']),
      supabase
        .from('support_tickets')
        .select('id', { count: 'exact' })
        .eq('assigned_to', agentId)
        .eq('status', 'resolved')
        .gte('resolved_at', today),
    ]);

    return {
      assigned: assignedResult.count || 0,
      resolved_today: resolvedResult.count || 0,
      avg_response_time: 45, // TODO: Calculate actual response time
    };
  }

  // Analytics and Stats
  static async getSupportStats(): Promise<SupportStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Get basic counts
      const [
        totalResult,
        openResult,
        inProgressResult,
        resolvedTodayResult,
        ticketsThisWeekResult,
        ticketsLastWeekResult,
      ] = await Promise.all([
        supabase.from('support_tickets').select('id', { count: 'exact' }),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .eq('status', 'open'),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .eq('status', 'in_progress'),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .eq('status', 'resolved')
          .gte('resolved_at', today),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .gte('created_at', weekAgo),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .gte(
            'created_at',
            new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          )
          .lt('created_at', weekAgo),
      ]);

      // Get tickets by priority, category, and status
      const { data: ticketData } = await supabase
        .from('support_tickets')
        .select('priority, category, status, satisfaction_rating');

      const ticketsByPriority = this.groupBy(ticketData || [], 'priority');
      const ticketsByCategory = this.groupBy(ticketData || [], 'category');
      const ticketsByStatus = this.groupBy(ticketData || [], 'status');

      // Calculate average satisfaction rating
      const ratingsData =
        ticketData?.filter(t => t.satisfaction_rating !== null) || [];
      const avgSatisfaction =
        ratingsData.length > 0
          ? ratingsData.reduce((sum, t) => sum + t.satisfaction_rating, 0) /
            ratingsData.length
          : 0;

      // Get agent performance (mock data for now)
      const agentPerformance = [
        {
          agent_id: 'agent1',
          agent_name: 'John Smith',
          assigned_tickets: 15,
          resolved_tickets: 12,
          avg_response_time: 25,
          satisfaction_rating: 4.2,
        },
        {
          agent_id: 'agent2',
          agent_name: 'Sarah Johnson',
          assigned_tickets: 18,
          resolved_tickets: 16,
          avg_response_time: 18,
          satisfaction_rating: 4.5,
        },
      ];

      return {
        totalTickets: totalResult.count || 0,
        openTickets: openResult.count || 0,
        inProgressTickets: inProgressResult.count || 0,
        resolvedToday: resolvedTodayResult.count || 0,
        averageResponseTime: 30, // TODO: Calculate actual
        averageResolutionTime: 4.5, // TODO: Calculate actual
        satisfactionRating: Math.round(avgSatisfaction * 10) / 10,
        ticketsByPriority: Object.entries(ticketsByPriority).map(
          ([priority, count]) => ({
            priority,
            count,
          })
        ),
        ticketsByCategory: Object.entries(ticketsByCategory).map(
          ([category, count]) => ({
            category,
            count,
          })
        ),
        ticketsByStatus: Object.entries(ticketsByStatus).map(
          ([status, count]) => ({
            status,
            count,
          })
        ),
        agentPerformance,
        trends: {
          ticketsThisWeek: ticketsThisWeekResult.count || 0,
          ticketsLastWeek: ticketsLastWeekResult.count || 0,
          responseTimeImprovement: 12, // TODO: Calculate actual
          satisfactionTrend: 5, // TODO: Calculate actual
        },
      };
    } catch (error) {
      console.error('Error fetching support stats:', error);
      throw error;
    }
  }

  // Auto-assignment
  static async autoAssignTicket(ticketId: number): Promise<void> {
    const agents = await this.getAvailableAgents();

    if (agents.length === 0) {
      throw new Error('No available agents for assignment');
    }

    // Find agent with lowest current workload
    const bestAgent = agents.reduce((prev, current) =>
      current.current_ticket_count < prev.current_ticket_count ? current : prev
    );

    await this.assignTicket(ticketId, bestAgent.id, 'system');
  }

  // Utility methods
  static groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce(
      (acc, item) => {
        const value = String(item[key]);
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  // Real-time subscriptions
  static subscribeToNewTickets(callback: (ticket: SupportTicket) => void) {
    return supabase
      .channel('support_tickets')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_tickets' },
        payload => callback(payload.new as SupportTicket)
      )
      .subscribe();
  }

  static subscribeToTicketUpdates(
    ticketId: number,
    callback: (ticket: SupportTicket) => void
  ) {
    return supabase
      .channel(`ticket_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticketId}`,
        },
        payload => callback(payload.new as SupportTicket)
      )
      .subscribe();
  }

  static subscribeToTicketMessages(
    ticketId: number,
    callback: (message: SupportMessage) => void
  ) {
    return supabase
      .channel(`messages_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        payload => callback(payload.new as SupportMessage)
      )
      .subscribe();
  }
}
