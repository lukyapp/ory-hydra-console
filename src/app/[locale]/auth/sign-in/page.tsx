import { extractParams } from '@/app-utils/extract-params';
import { getFirstSearchParam } from '@/app-utils/get-first-search-param';
import { authOptions } from '@/auth';
import { SignInButton } from '@/features/auth/components/sign-in-button';
import { redirect } from '@/i18n/navigation';
import { getServerSession } from 'next-auth';
import { getTranslations } from 'next-intl/server';

export default async function SignInPage({
  params,
  searchParams: _searchParams,
}: PageProps<'/[locale]/auth/sign-in'>) {
  const searchParams = await _searchParams;

  const { locale } = await extractParams(params);
  const callbackUrl = getFirstSearchParam(searchParams['callbackUrl']) ?? `/`;

  const session = await getServerSession(authOptions);
  if (session) {
    redirect({ href: callbackUrl, locale });
  }

  const t = await getTranslations('SignInPage');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-lg">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200 opacity-30 mix-blend-multiply blur-3xl filter" />
          <div className="animate-blob animation-delay-2000 absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-200 opacity-30 mix-blend-multiply blur-3xl filter" />
          <div className="animate-blob animation-delay-4000 absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-purple-200 opacity-30 mix-blend-multiply blur-3xl filter" />
        </div>

        <div className="relative rounded-3xl border border-white/20 bg-white/70 p-12 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-50 blur-lg" />
              <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
            <p className="text-lg text-slate-600">{t('subtitle')}</p>
          </div>

          <SignInButton locale={locale} callbackUrl={callbackUrl} />

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
