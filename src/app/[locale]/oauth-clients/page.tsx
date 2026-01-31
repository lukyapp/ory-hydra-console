import { OAuthClientsPanel } from '@/features/oauth-clients/components/oauth-clients-panel';

export default function OAuthClientsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <OAuthClientsPanel />
      </div>
    </div>
  );
}
