'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OAuth2Client } from '@/features/oauth-clients/services/hydra-admin.service';
import { useCallback, useEffect, useState } from 'react';
import { ClientSecretDisplay } from './client-secret-display';
import { OAuthClientModal } from './oauth-client-modal';
import { OAuthClientsTable } from './oauth-clients-table';

export function OAuthClientsPanel() {
  const [clients, setClients] = useState<OAuth2Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<OAuth2Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const [newClientCredentials, setNewClientCredentials] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery) params.set('client_name', searchQuery);
      const response = await fetch(`/api/oauth-clients?${params.toString()}`);
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
  }, [searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: OAuth2Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    if (
      !confirm('Are you sure you want to delete this OAuth client? This action cannot be undone.')
    ) {
      return;
    }

    try {
      setDeletingClientId(clientId);
      const response = await fetch(`/api/oauth-clients/${encodeURIComponent(clientId)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete client');
      }
      await fetchClients();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleSubmit = async (clientData: OAuth2Client) => {
    try {
      setIsSubmitting(true);
      const isEditing = !!editingClient;
      const url = isEditing
        ? `/api/oauth-clients/${encodeURIComponent(editingClient.client_id!)}`
        : '/api/oauth-clients';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} client`);
      }

      const result = await response.json();

      if (!isEditing && result.client_secret) {
        setNewClientCredentials({
          clientId: result.client_id,
          clientSecret: result.client_secret,
        });
      }

      setIsModalOpen(false);
      setEditingClient(null);
      await fetchClients();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">OAuth Clients</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage OAuth 2.0 clients for your Ory Hydra instance
          </p>
        </div>
        <Button onClick={handleCreate}>+ Create Client</Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by client name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={fetchClients} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && clients.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-500">Loading clients...</div>
        </div>
      ) : (
        <OAuthClientsTable
          clients={clients}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deletingClientId}
        />
      )}

      <OAuthClientModal
        isOpen={isModalOpen}
        client={editingClient}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {newClientCredentials && (
        <ClientSecretDisplay
          clientId={newClientCredentials.clientId}
          clientSecret={newClientCredentials.clientSecret}
          onClose={() => setNewClientCredentials(null)}
        />
      )}
    </div>
  );
}
