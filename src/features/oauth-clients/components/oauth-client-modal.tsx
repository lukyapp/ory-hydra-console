'use client';

import type { OAuth2Client } from '@/features/oauth-clients/services/hydra-admin.service';
import { useState } from 'react';
import { OAuthClientForm } from './oauth-client-form';
import { OAuthClientQuickForm } from './oauth-client-quick-form';

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
  const isEditing = Boolean(client);
  const [createMode, setCreateMode] = useState<'simple' | 'advanced'>('simple');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {client ? 'Edit OAuth Client' : 'Create OAuth Client'}
        </h2>
        {!isEditing && (
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setCreateMode('simple')}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                createMode === 'simple'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setCreateMode('advanced')}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                createMode === 'advanced'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              Advanced
            </button>
          </div>
        )}

        {isEditing || createMode === 'advanced' ? (
          <OAuthClientForm
            client={client}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        ) : (
          <OAuthClientQuickForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
