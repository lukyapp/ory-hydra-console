import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';

export async function extractParams<TParams extends { locale?: string }>(params: Promise<TParams>) {
  const extractedParams = await params;
  console.log('[extractParams] extractedParams : ', extractedParams);

  const { locale } = extractedParams;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return { ...extractedParams, locale };
}
