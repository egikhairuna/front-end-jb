'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import type { LoginFormData } from '@/lib/schemas/auth';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired') === 'true';
  const resetSuccess = searchParams.get('reset') === 'success';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Show session expired message
  useEffect(() => {
    if (expired) {
      toast.error('Your session has expired. Please log in again.');
    }
  }, [expired]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'same-origin',
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError('Invalid email or password. Please try again.');
        return;
      }

      setUser(result.user);
      toast.success('Welcome back!');
      router.push('/account');
      router.refresh();
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)] w-full bg-white font-sans">
      {/* Left side: Image */}
      <div className="hidden lg:block relative w-full h-full min-h-[calc(100vh-80px)]">
        <img
          src="https://vps.jamesboogie.com/wp-content/uploads/2026/07/Lofty-Thumb-Teaser-Potrait-1-of-1.jpg"
          alt="Lofty"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right side: Login Form */}
      <div className="flex flex-col justify-center items-center w-full min-h-[calc(100vh-80px)] px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-[500px] space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-3xl font-medium uppercase tracking-widest text-black text-left leading-tight">
              Log in to your account
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {resetSuccess && (
              <FormSuccess message="Your password has been reset successfully. Please log in." />
            )}

            {/* Email/Username */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoComplete="username"
                className="w-full bg-white border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Enter email address"
                {...register('username', { required: 'Email or username is required' })}
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full bg-white border border-neutral-300 p-3 pr-10 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="Enter password"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs tracking-wider">
              <label className="flex items-center space-x-2 text-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 border border-neutral-300 rounded-none accent-black cursor-pointer"
                />
                <span className="text-[13px] font-regular text-neutral-700">Remember me</span>
              </label>

              <Link
                href="/account/forgot-password"
                className="font-bold underline uppercase hover:text-neutral-500 transition-colors"
              >
                FORGOT PASSWORD?
              </Link>
            </div>

            <FormError message={formError} />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white border border-black py-4 uppercase font-bold text-sm tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-neutral-200 my-8"></div>

          {/* Register Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Do not have an account?
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              By creating a personal account, you will be able to checkout faster, save your shipping addresses, view and track your orders in your account and more.
            </p>
            <Link
              href="/account/register"
              className="w-full border border-black bg-white text-black py-4 uppercase font-bold text-xs tracking-widest hover:bg-black hover:text-white transition-all text-center block"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-white">
        <div className="w-full max-w-md text-center py-12">
          <p className="text-sm text-neutral-500 animate-pulse uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
