import { GraphQLClient } from "graphql-request";
import Cookies from 'js-cookie';

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://jamesboogie.com/graphql";

// Custom fetch to handle woocommerce-session
const customFetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  // Capture session from cookie (Client side)
  let session = Cookies.get('woo-session');
  
  const headers = new Headers(options.headers);
  if (session) {
    headers.set('woocommerce-session', `Session ${session}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    // Capture new session from header and save to cookie
    const newSession = response.headers.get('woocommerce-session');
    if (newSession) {
      // Set cookie with security flags
      // Note: For HttpOnly, we'd need to set it via an API route or middleware.
      // But we can at least set Secure and SameSite here for now.
      Cookies.set('woo-session', newSession, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }

    return response;
  } catch (error) {
    console.error('🌐 GraphQL Fetch Error:', error);
    throw error;
  }
};

export const client = new GraphQLClient(endpoint, {
  fetch: customFetch,
});
