'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { FormError } from '@/components/ui/FormError';

interface LocalResetFormData {
  password: string;
  confirmPassword: string;
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isLinkInvalid = !email || !code;

  useEffect(() => {
    if (isLinkInvalid) {
      setFormError('Invalid reset link. Please request a new one.');
    }
  }, [isLinkInvalid]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LocalResetFormData>();

  const password = watch('password');

  const onSubmit = async (data: LocalResetFormData) => {
    if (isLinkInvalid) return;
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || 'Failed to reset password. Please try again.');
        return;
      }

      router.push('/account/login?reset=success');
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || isLinkInvalid;

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-80px)] w-full bg-white font-sans px-6 py-12 md:px-16 lg:px-24">
      <div className="w-full max-w-[500px] space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-3xl font-medium uppercase tracking-widest text-black text-left leading-tight">
            SET NEW PASSWORD
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-wide">
            Enter your new password below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
              NEW PASSWORD <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full bg-white border border-neutral-300 p-3 pr-10 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="Enter new password"
                disabled={isDisabled}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  validate: {
                    hasLetter: (v) => /[a-zA-Z]/.test(v) || 'Password must contain at least one letter',
                    hasNumber: (v) => /[0-9]/.test(v) || 'Password must contain at least one number',
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black focus:outline-none cursor-pointer"
                disabled={isDisabled}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min. 8 characters, must include at least one letter and one number.
            </p>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
              CONFIRM PASSWORD <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full bg-white border border-neutral-300 p-3 pr-10 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="Confirm new password"
                disabled={isDisabled}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black focus:outline-none cursor-pointer"
                disabled={isDisabled}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <FormError message={formError} />

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-black text-white border border-black py-4 uppercase font-bold text-sm tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Resetting password...' : 'RESET PASSWORD'}
          </button>
        </form>

        {/* Back link */}
        <div className="text-center pt-2">
          <Link
            href="/account/login"
            className="text-xs font-bold uppercase tracking-widest text-black hover:text-neutral-500 transition-colors underline"
          >
            &larr; BACK TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-white">
          <div className="w-full max-w-md text-center py-12">
            <p className="text-sm text-neutral-500 animate-pulse uppercase tracking-widest">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
