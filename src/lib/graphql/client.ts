import { GraphQLClient } from "graphql-request";
import Cookies from 'js-cookie';

const getEndpoint = () => process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://jamesboogie.com/graphql";

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

// Export a proxy or function to ensure endpoint is fresh
// though for the browser it's set once, it's safer for server-side usage if this is ever imported there.
export const client = new GraphQLClient(getEndpoint(), {
  fetch: customFetch,
});
