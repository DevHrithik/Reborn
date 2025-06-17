'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Menu, Settings, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-lg px-6 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden hover:bg-gray-100 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative w-96 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users, workouts, posts..."
            className="pl-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-300 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative hover:bg-gray-100 transition-colors p-2"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white animate-pulse"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 shadow-xl border-0 bg-white/95 backdrop-blur-lg"
          >
            <DropdownMenuLabel className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 w-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    New support ticket
                  </div>
                  <div className="text-sm text-gray-500">
                    User reported login issue
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    2 minutes ago
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 w-full">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Community post flagged
                  </div>
                  <div className="text-sm text-gray-500">
                    Inappropriate content detected
                  </div>
                  <div className="text-xs text-gray-400 mt-1">1 hour ago</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 w-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    New user registration
                  </div>
                  <div className="text-sm text-gray-500">
                    50 new users today
                  </div>
                  <div className="text-xs text-gray-400 mt-1">3 hours ago</div>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors p-0"
            >
              <Avatar className="h-10 w-10 shadow-lg border-2 border-white">
                <AvatarImage src="/avatars/admin.png" alt="Admin" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 shadow-xl border-0 bg-white/95 backdrop-blur-lg"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2 p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs leading-none text-gray-500 mt-1">
                      admin@reborn.com
                    </p>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-gray-50 transition-colors cursor-pointer">
              <User className="h-4 w-4 mr-3 text-gray-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-50 transition-colors cursor-pointer">
              <Settings className="h-4 w-4 mr-3 text-gray-500" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-red-50 text-red-600 transition-colors cursor-pointer">
              <LogOut className="h-4 w-4 mr-3" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
