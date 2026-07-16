'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/schemas/auth';
import { FormError } from '@/components/ui/FormError';
import { FormSuccess } from '@/components/ui/FormSuccess';

export default function ChangePasswordPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSaving(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'same-origin',
      });

      if (response.status === 401) {
        setFormError('Current password is incorrect.');
        return;
      }

      if (response.status === 429) {
        setFormError('Too many attempts. Please try again later.');
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || 'An unexpected error occurred. Please try again.');
        return;
      }

      setFormSuccess('Password changed successfully.');
      toast.success('Password changed successfully.');
      reset();
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b border-black">
        CHANGE PASSWORD
      </h2>
      <p className="text-sm text-neutral-500 mb-6">
        Update your account password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formSuccess && <FormSuccess message={formSuccess} />}

        {/* Current Password */}
        <div className="space-y-1">
          <label className="text-sm font-semibold uppercase tracking-tighter">
            CURRENT PASSWORD <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              className="w-full bg-[#F3F3F3] border border-gray-300 p-3 pr-10 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
              placeholder="Enter current password"
              {...register('currentPassword')}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black focus:outline-none cursor-pointer"
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="text-sm font-semibold uppercase tracking-tighter">
            NEW PASSWORD <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              className="w-full bg-[#F3F3F3] border border-gray-300 p-3 pr-10 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
              placeholder="Enter new password"
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black focus:outline-none cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Min. 8 characters, must include at least one letter and one number.
          </p>
          {errors.newPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="text-sm font-semibold uppercase tracking-tighter">
            CONFIRM NEW PASSWORD <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full bg-[#F3F3F3] border border-gray-300 p-3 pr-10 text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
              placeholder="Confirm new password"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black focus:outline-none cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <FormError message={formError} />

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-black text-white border border-black py-4 uppercase font-bold text-sm tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
