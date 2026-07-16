'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { ProfileFormData } from '@/lib/schemas/auth';
import { FormError } from '@/components/ui/FormError';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>();

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/account/profile', {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const data = await response.json();
          reset(data.profile);
        } else if (response.status === 401) {
          window.location.href = '/account/login?expired=true';
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    setFormError(null);
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'same-origin',
      });

      if (response.status === 401) {
        window.location.href = '/account/login?expired=true';
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || 'Failed to update profile');
        return;
      }

      reset(result.profile);
      toast.success('Profile updated successfully');
    } catch {
      setFormError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-neutral-100 animate-pulse w-32" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b border-black">
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold uppercase tracking-tighter">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoComplete="given-name"
              className="w-full bg-[#F3F3F3] border border-gray-300 p-3 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
              {...register('firstName', { required: 'First name is required' })}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold uppercase tracking-tighter">
              Last Name
            </label>
            <input
              type="text"
              autoComplete="family-name"
              className="w-full bg-[#F3F3F3] border border-gray-300 p-3 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
              {...register('lastName')}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold uppercase tracking-tighter">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            autoComplete="email"
            className="w-full bg-[#F3F3F3] border border-gray-300 p-3 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email',
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold uppercase tracking-tighter">
            Phone
          </label>
          <input
            type="tel"
            autoComplete="tel"
            className="w-full bg-[#F3F3F3] border border-gray-300 p-3 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
            {...register('phone')}
          />
        </div>

        <FormError message={formError} />

        <button
          type="submit"
          disabled={isSaving || !isDirty}
          className="w-full bg-black text-white border border-black py-4 uppercase font-bold text-sm tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
