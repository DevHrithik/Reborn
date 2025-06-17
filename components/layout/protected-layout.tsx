'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { AdminLayout } from './admin-layout';
import { PageLoading } from '@/components/shared/loading';
import { usePathname } from 'next/navigation';

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't wrap auth pages with AdminLayout
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoading />;
  }

  // If user is authenticated, show AdminLayout
  if (user) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // If not authenticated, just render children (will be redirected by middleware)
  return <>{children}</>;
}
