/**
 * Authentication & User types
 * Used across auth library, Route Handlers, and account pages
 */

import { WCAddress } from './woocommerce';

// ============================================
// JWT Claims (WordPress JWT Authentication Plugin)
// ============================================

export interface JWTClaims {
  iss: string;        // issuer (WordPress site URL)
  iat: number;        // issued at (Unix timestamp)
  nbf: number;        // not before (Unix timestamp)
  exp: number;        // expiry (Unix timestamp)
  data: {
    user: {
      id: string;     // WordPress user ID (string in JWT payload)
    };
  };
}

// ============================================
// Auth User (safe to expose to client)
// ============================================

/** Safe user object returned to the client — never includes tokens or passwords */
export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

// ============================================
// Auth Payloads
// ============================================

export interface LoginPayload {
  username: string;    // email or username
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ============================================
// WordPress JWT Plugin Response
// ============================================

export interface WPJWTResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface WPJWTError {
  code: string;
  message: string;
  data: {
    status: number;
  };
}

// ============================================
// WooCommerce Customer (REST API shape)
// ============================================

export interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: WCAddress;
  shipping: WCAddress;
  avatar_url?: string;
  date_created?: string;
  role?: string;
}

/** Payload for creating a new WooCommerce customer */
export interface WCCreateCustomerPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username?: string;
}

/** Payload for updating a WooCommerce customer */
export interface WCUpdateCustomerPayload {
  email?: string;
  first_name?: string;
  last_name?: string;
  billing?: Partial<WCAddress>;
  shipping?: Partial<WCAddress>;
}
