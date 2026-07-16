/**
 * Zod schemas for auth & account forms.
 * Shared between client (react-hook-form resolver) and server (Route Handler re-validation).
 * Never trust client validation alone — always re-validate server-side.
 */

import { z } from 'zod/v4';

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  username: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Shared password strength validator
// Rule: min 8 chars, at least 1 letter, at least 1 number
// Rationale: NIST 2024 guidelines favor length over complexity;
// symbol requirement is omitted to avoid predictable substitutions (P@ssw0rd!)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  email: z.email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional().default(''),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phone: z.string().min(1, 'Phone number is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ============================================
// Profile Schemas
// ============================================

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional().default(''),
  email: z.email('Please enter a valid email address'),
  phone: z.string().optional().default(''),
});

// ============================================
// Address Schemas
// ============================================

export const addressSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional().default(''),
  address_1: z.string().min(1, 'Address is required'),
  address_2: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional().default(''),
  postcode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  email: z.union([z.email(), z.literal('')]).optional(),
  phone: z.string().min(1, 'Phone number is required'),
});

export const addressUpdateSchema = z.object({
  billing: addressSchema.optional(),
  shipping: addressSchema.optional(),
});

// ============================================
// Inferred Types
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type AddressUpdateFormData = z.infer<typeof addressUpdateSchema>;
