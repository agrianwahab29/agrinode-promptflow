import { track } from '@vercel/analytics';

export const ANALYTICS_EVENTS = {
  CTA_HERO_CLICK: 'cta_hero_click',
  CTA_FINAL_CLICK: 'cta_final_click',
  FAQ_EXPAND: 'faq_expand',
  SCROLL_75: 'scroll_75',
  LANGUAGE_TOGGLE: 'language_toggle',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export function trackEvent(eventName: AnalyticsEventName, properties?: Record<string, string>) {
  if (typeof window === 'undefined') return;
  track(eventName, properties);
}
