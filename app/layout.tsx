import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { ProtectedLayout } from '@/components/layout/protected-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'REBORN Admin Panel',
  description:
    'Admin panel for REBORN fitness app - manage users, workouts, nutrition, and community',
  keywords: ['admin', 'fitness', 'reborn', 'management', 'dashboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <ProtectedLayout>{children}</ProtectedLayout>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
