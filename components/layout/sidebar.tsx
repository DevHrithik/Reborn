'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ROUTES } from '@/utils/constants';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Apple,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'User Management',
    href: ROUTES.USERS,
    icon: Users,
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Workouts',
    href: ROUTES.WORKOUTS,
    icon: Dumbbell,
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Nutrition',
    href: ROUTES.NUTRITION,
    icon: Apple,
    color: 'from-green-400 to-lime-500',
  },
  {
    name: 'Community',
    href: ROUTES.COMMUNITY,
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Support',
    href: ROUTES.SUPPORT,
    icon: HelpCircle,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    name: 'Analytics',
    href: ROUTES.ANALYTICS,
    icon: BarChart3,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
    color: 'from-gray-500 to-slate-600',
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-700 relative">
        <div
          className={cn(
            'flex items-center transition-all duration-300',
            collapsed ? 'px-2 justify-center' : 'px-6 gap-3'
          )}
        >
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              REBORN Admin
            </h1>
          )}
        </div>

        {/* Toggle button */}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-700 border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600 z-10 shadow-lg"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-6">
        <nav className="space-y-2">
          {navigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full transition-all duration-300 group relative',
                    collapsed
                      ? 'justify-center px-0 py-3'
                      : 'justify-start gap-3 px-4 py-3 text-left',
                    'font-medium',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  <div
                    className={cn(
                      'p-1.5 rounded-lg transition-all duration-300',
                      isActive
                        ? 'bg-white/20 shadow-inner'
                        : `bg-gradient-to-r ${item.color} opacity-80 group-hover:opacity-100`
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isActive ? 'text-white' : 'text-white'
                      )}
                    />
                  </div>
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-slate-700/50 p-2 bg-slate-800/50">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 p-3 mb-3 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-300 truncate">
                  admin@reborn.com
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-red-600/20 transition-all duration-300 group"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity">
                <LogOut className="h-4 w-4 text-white" />
              </div>
              Sign out
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">AD</span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-center p-2 text-slate-300 hover:text-white hover:bg-red-600/20 transition-all duration-300 group relative"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity">
                <LogOut className="h-4 w-4 text-white" />
              </div>
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Sign out
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
