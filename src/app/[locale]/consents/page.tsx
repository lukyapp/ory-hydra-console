import { ConsentsPanel } from '@/features/consents/components/consents-panel';

export default function ConsentsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ConsentsPanel />
      </div>
    </div>
  );
}
