import set from 'lodash.set';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  console.log('[getRequestConfig] locale : ', locale);

  const messages = fromFlatStructure((await import(`../../messages/${locale}.json`)).default);
  return {
    locale,
    messages,
  };
});

function fromFlatStructure(input: object) {
  return Object.entries(input).reduce((acc, [key, value]) => set(acc, key, value), {});
}
