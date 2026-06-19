import { getRequestConfig } from 'next-intl/server';

const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'id';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (locales as readonly string[]).includes(requested ?? '') ? (requested as Locale) : defaultLocale;
  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
