import { createClient } from './supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
  permissions: Record<string, boolean>;
}

export class AuthService {
  private static instance: AuthService;
  private supabase = createClient();

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Simple hardcoded authentication
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: AdminUser; session_token: string } | null> {
    // Hardcoded admin credentials
    if (email === 'admin@reborn.com' && password === 'admin123') {
      const { data: adminUser, error } = await this.supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !adminUser || !adminUser.id) {
        return null;
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.supabase.from('admin_sessions').insert({
        admin_id: adminUser.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

      // Log activity
      await this.logActivity(adminUser.id, 'login', 'auth', null, {
        email,
      });

      return {
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role || 'admin',
          full_name: adminUser.full_name || 'Admin User',
          permissions: adminUser.permissions as Record<string, boolean>,
        },
        session_token: sessionToken,
      };
    }

    return null;
  }

  async signOut(sessionToken: string): Promise<void> {
    const { data: session } = await this.supabase
      .from('admin_sessions')
      .select('admin_id')
      .eq('session_token', sessionToken)
      .single();

    if (session && session.admin_id) {
      await this.logActivity(session.admin_id, 'logout', 'auth', null, {});

      await this.supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken);
    }
  }

  async validateSession(sessionToken: string): Promise<AdminUser | null> {
    const { data: session, error } = await this.supabase
      .from('admin_sessions')
      .select(
        `
        admin_id,
        expires_at,
        admin_users (
          id,
          email,
          role,
          full_name,
          permissions,
          is_active
        )
      `
      )
      .eq('session_token', sessionToken)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !session || !session.admin_users) {
      return null;
    }

    const adminUser = Array.isArray(session.admin_users)
      ? session.admin_users[0]
      : session.admin_users;

    if (!adminUser.is_active) {
      return null;
    }

    return {
      id: adminUser.id || '',
      email: adminUser.email || '',
      role: adminUser.role || 'admin',
      full_name: adminUser.full_name || 'Admin User',
      permissions: adminUser.permissions as Record<string, boolean>,
    };
  }

  async logActivity(
    adminId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    details: Record<string, any>
  ): Promise<void> {
    await this.supabase.from('admin_activity_logs').insert({
      admin_id: adminId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
    });
  }

  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const authService = AuthService.getInstance();
