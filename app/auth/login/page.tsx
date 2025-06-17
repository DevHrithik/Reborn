'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@reborn.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.signIn(email, password);

      if (result) {
        // Store session token in localStorage (simple approach)
        localStorage.setItem('admin_session_token', result.session_token);
        localStorage.setItem('admin_user', JSON.stringify(result.user));

        router.push(ROUTES.DASHBOARD);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 p-4 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/20 shadow-2xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              REBORN Admin
            </h1>
          </div>
          <p className="text-blue-200/80 mt-4 text-lg">
            Fitness App Management Portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-blue-200/80 text-base">
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-500/30 bg-red-500/10 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-100 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@reborn.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:bg-white/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-100 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:bg-white/20 transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1 h-8 w-8 p-0 text-blue-300 hover:text-white hover:bg-white/10"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo credentials info */}
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
              <h4 className="text-sm font-medium text-blue-200 mb-2">
                Demo Credentials:
              </h4>
              <div className="text-xs space-y-1 text-blue-300/80">
                <div>Email: admin@reborn.com</div>
                <div>Password: admin123</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200/60 text-sm">
            © 2024 REBORN. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
