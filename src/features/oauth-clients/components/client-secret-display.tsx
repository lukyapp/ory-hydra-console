'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ClientSecretDisplayProps {
  clientId: string;
  clientSecret: string;
  onClose: () => void;
}

export function ClientSecretDisplay({ clientId, clientSecret, onClose }: ClientSecretDisplayProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const copyToClipboard = async (text: string, type: 'id' | 'secret') => {
    await navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Client Created Successfully
        </h2>
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
          ⚠️ Save the client secret now. You won&apos;t be able to see it again!
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Client ID
            </label>
            <div className="flex gap-2">
              <code className="flex-1 rounded bg-zinc-100 px-3 py-2 font-mono text-sm dark:bg-zinc-800">
                {clientId}
              </code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(clientId, 'id')}>
                {copiedId ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Client Secret
            </label>
            <div className="flex gap-2">
              <code className="flex-1 rounded bg-zinc-100 px-3 py-2 font-mono text-sm break-all dark:bg-zinc-800">
                {clientSecret}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(clientSecret, 'secret')}
              >
                {copiedSecret ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
