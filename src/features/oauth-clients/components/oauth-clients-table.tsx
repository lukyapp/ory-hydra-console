'use client';

import { Button } from '@/components/ui/button';
import type { OAuth2Client } from '@/features/oauth-clients/services/hydra-admin.service';

interface OAuthClientsTableProps {
  clients: OAuth2Client[];
  onEdit: (client: OAuth2Client) => void;
  onDelete: (clientId: string) => void;
  isDeleting?: string | null;
}

export function OAuthClientsTable({
  clients,
  onEdit,
  onDelete,
  isDeleting,
}: OAuthClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">No OAuth clients found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-700 uppercase dark:bg-zinc-800 dark:text-zinc-300">
          <tr>
            <th className="px-4 py-3">Client ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Grant Types</th>
            <th className="px-4 py-3">Redirect URIs</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {clients.map((client) => (
            <tr
              key={client.client_id}
              className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3 font-mono text-xs">{client.client_id}</td>
              <td className="px-4 py-3 font-medium">{client.client_name || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {client.grant_types?.map((grant) => (
                    <span
                      key={grant}
                      className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {grant}
                    </span>
                  ))}
                </div>
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                {client.redirect_uris?.join(', ') || '-'}
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(client)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => client.client_id && onDelete(client.client_id)}
                    disabled={isDeleting === client.client_id}
                  >
                    {isDeleting === client.client_id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
