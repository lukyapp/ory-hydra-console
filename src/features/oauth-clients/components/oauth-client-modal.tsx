'use client';

import type { OAuth2Client } from '@/features/oauth-clients/services/hydra-admin.service';
import { OAuthClientForm } from './oauth-client-form';

interface OAuthClientModalProps {
  isOpen: boolean;
  client?: OAuth2Client | null;
  onClose: () => void;
  onSubmit: (client: OAuth2Client) => void;
  isSubmitting?: boolean;
}

export function OAuthClientModal({
  isOpen,
  client,
  onClose,
  onSubmit,
  isSubmitting,
}: OAuthClientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {client ? 'Edit OAuth Client' : 'Create OAuth Client'}
        </h2>
        <OAuthClientForm
          client={client}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
