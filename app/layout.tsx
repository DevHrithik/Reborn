import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AdminLayout } from '@/components/layout/admin-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'REBORN Admin Panel',
  description: 'Admin panel for REBORN fitness app management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
