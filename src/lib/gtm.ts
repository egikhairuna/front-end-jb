/**
 * Google Tag Manager utility for dataLayer pushes.
 * This helper provides a type-safe way to interact with GTM's dataLayer.
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Pushes a custom event or data to the Google Tag Manager dataLayer.
 * Safely checks for window and dataLayer existence to prevent SSR or runtime errors.
 * 
 * @param event - The object to push to the dataLayer.
 */
export const pushToDataLayer = (event: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    return;
  }

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];

  try {
    window.dataLayer.push(event);
  } catch (error) {
    console.error('[GTM Utility] Error pushing to dataLayer:', error);
  }
};
