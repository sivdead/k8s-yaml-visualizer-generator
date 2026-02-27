import { track as vercelTrack } from '@vercel/analytics';

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackEvent = (name: string, properties: AnalyticsProperties = {}): void => {
  try {
    vercelTrack(name, properties);
  } catch (error) {
    console.warn('Vercel analytics tracking failed:', error);
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', name, properties);
    } catch (error) {
      console.warn('gtag tracking failed:', error);
    }
  }
};
