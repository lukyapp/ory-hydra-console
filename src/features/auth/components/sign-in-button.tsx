'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export function SignInButton({ callbackUrl, locale }: { locale: string; callbackUrl?: string }) {
  const t = useTranslations('SignInPage');

  const handleSignIn = () => {
    return signIn(
      'hydra',
      {
        callbackUrl: callbackUrl ?? `/${locale}`,
      },
      { prompt: 'login' },
    );
  };

  return (
    <Button
      onClick={handleSignIn}
      className="h-14 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/40"
    >
      {t('sign-in-button-label')}
    </Button>
  );
}
