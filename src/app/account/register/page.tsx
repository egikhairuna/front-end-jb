'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import type { RegisterFormData } from '@/lib/schemas/auth';
import { FormError } from '@/components/ui/FormError';
import { useAuth } from '@/hooks/useAuth';

const countryCodes = [
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+62');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setFormError(null);

    // Combine country code with local phone number
    const fullPhone = `${countryCode}${data.phone.replace(/^0+/, '')}`;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phone: fullPhone,
        }),
        credentials: 'same-origin',
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          response.status === 409 ||
          (result.error && (
            result.error.toLowerCase().includes('already registered') ||
            result.error.toLowerCase().includes('exists') ||
            result.error.toLowerCase().includes('taken')
          ))
        ) {
          setFormError('An account with this email already exists.');
        } else {
          setFormError(result.error || 'Registration failed. Please try again.');
        }
        return;
      }

      if (result.requiresLogin) {
        toast.success('Account created! Please log in.');
        router.push('/account/login');
      } else {
        setUser(result.user);
        toast.success('Welcome! Your account has been created.');
        router.push('/account');
        router.refresh();
      }
    } catch {
      setFormError('Registration failed. Please try again.');
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
          alt="Register Teaser"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right side: Register Form */}
      <div className="flex flex-col justify-center items-center w-full min-h-[calc(100vh-80px)] px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-[500px] space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-3xl font-medium uppercase tracking-widest text-black text-left leading-tight">
              Create an account
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="given-name"
                  className="w-full bg-white border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="Enter first name"
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
                  Last Name
                </label>
                <input
                  type="text"
                  autoComplete="family-name"
                  className="w-full bg-white border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="Enter last name"
                  {...register('lastName')}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
                Email Address <span className="text-red-500">*</span>
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
                    message: 'Please enter a valid email',
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex border border-neutral-300 bg-white focus-within:border-black transition-colors">
                <div className="relative flex items-center bg-[#F9F9F9] border-r border-neutral-300 px-3 py-2 cursor-pointer select-none">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.name})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-black">
                    <span>{countryCodes.find((c) => c.code === countryCode)?.flag}</span>
                    <span className="text-[10px] text-neutral-500">▼</span>
                    <span>{countryCode}</span>
                  </div>
                </div>
                <input
                  type="tel"
                  className="w-full p-3 text-sm focus:outline-none bg-transparent"
                  placeholder="812-345-678"
                  {...register('phone', {
                    required: 'Phone number is required',
                  })}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-black/80">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full bg-white border border-neutral-300 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                {...register('birthDate', { required: 'Date of birth is required' })}
              />
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide mt-1">
                Example: dd/mm/yyyy
              </p>
              {errors.birthDate && (
                <p className="text-xs text-red-500 mt-1">{errors.birthDate.message}</p>
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
                  autoComplete="new-password"
                  className="w-full bg-white border border-neutral-300 p-3 pr-10 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="Minimum 8 characters"
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
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full bg-white border border-neutral-300 p-3 pr-10 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="Re-enter your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white border border-black py-4 uppercase font-bold text-sm tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-neutral-200 my-8"></div>

          {/* Login Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Already have an account?
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Log in to access your personal dashboard, track shipping status, and update your personal profiles.
            </p>
            <Link
              href="/account/login"
              className="inline-block border border-black px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
