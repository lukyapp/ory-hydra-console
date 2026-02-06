'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OAuth2Client } from '@/features/oauth-clients/services/hydra-admin.service';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConsentRevokeModal } from './consent-revoke-modal';

export function ConsentsPanel() {
  const [clients, setClients] = useState<OAuth2Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [revokeClientId, setRevokeClientId] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.trim().toLowerCase();
    return clients.filter((client) => {
      const name = client.client_name?.toLowerCase() || '';
      const id = client.client_id?.toLowerCase() || '';
      return name.includes(query) || id.includes(query);
    });
  }, [clients, searchQuery]);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/oauth-clients?page_size=200');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Consent Sessions</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Select a client to revoke remembered consent for a specific user.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by client ID or name..."
          className="max-w-md"
        />
        <Button variant="outline" onClick={fetchClients} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && clients.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          Loading clients...
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No clients found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-700 uppercase dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-3">Client ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredClients.map((client) => (
                <tr
                  key={client.client_id}
                  className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 font-mono text-xs">{client.client_id}</td>
                  <td className="px-4 py-3 font-medium">{client.client_name || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => client.client_id && setRevokeClientId(client.client_id)}
                    >
                      Revoke Consent
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConsentRevokeModal
        isOpen={!!revokeClientId}
        clientId={revokeClientId}
        onClose={() => setRevokeClientId(null)}
      />
    </div>
  );
}
