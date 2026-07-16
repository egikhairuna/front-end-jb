'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || 'Failed to request password reset. Please try again.');
        return;
      }

      setFormSuccess('If an account exists with this email, you will receive a reset link shortly. Please check your inbox.');
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-80px)] w-full bg-white font-sans px-6 py-12 md:px-16 lg:px-24">
      <div className="w-full max-w-[500px] space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-3xl font-medium uppercase tracking-widest text-black text-left leading-tight">
            FORGOT YOUR PASSWORD?
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-wide">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
              EMAIL ADDRESS <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              autoComplete="email"
              className="w-full bg-white border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="Enter email address"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                }
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <FormError message={formError} />
          <FormSuccess message={formSuccess} />

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white border border-black py-4 uppercase font-bold text-sm tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Sending link...' : 'SEND RESET LINK'}
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
