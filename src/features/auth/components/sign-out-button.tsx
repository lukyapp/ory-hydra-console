'use client';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export function SignOutButton() {
  const t = useTranslations('HomePage');

  const handleSignOut = async () => {
    return signOut();
  };

  return (
    <div className="mb-8 flex justify-end">
      <Button
        onClick={handleSignOut}
        variant="outline"
        className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {t('sign-out-button-label')}
      </Button>
    </div>
  );
}
