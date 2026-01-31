import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { use } from 'react';

export function useExtractParams<TParams extends { locale?: string }>(params: Promise<TParams>) {
  const extractedParams = use(params);
  console.log('[useExtractParams] extractedParams : ', extractedParams);

  const { locale } = extractedParams;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return { locale };
}
