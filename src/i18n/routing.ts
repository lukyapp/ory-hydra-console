import { defineRouting } from 'next-intl/routing';

// see https://github.com/AmuraDesign/Next.js-16-Next-Intl-Boilerplate/blob/master/src/i18n/routing.ts

export const routing = defineRouting({
  defaultLocale: 'en-US',
  locales: ['en-US', 'fr-FR'],
});

export type Locale = (typeof routing.locales)[number];
