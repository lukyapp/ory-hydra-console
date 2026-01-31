'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OAuth2Client } from '@/features/oauth-clients/services/hydra-admin.service';
import { useState } from 'react';

interface OAuthClientFormProps {
  client?: OAuth2Client | null;
  onSubmit: (client: OAuth2Client) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const GRANT_TYPE_OPTIONS = [
  'authorization_code',
  'client_credentials',
  'refresh_token',
  'implicit',
];

const RESPONSE_TYPE_OPTIONS = ['code', 'token', 'id_token'];

const TOKEN_AUTH_METHOD_OPTIONS = [
  'client_secret_basic',
  'client_secret_post',
  'private_key_jwt',
  'none',
];

export function OAuthClientForm({
  client,
  onSubmit,
  onCancel,
  isSubmitting,
}: OAuthClientFormProps) {
  const [formData, setFormData] = useState<OAuth2Client>({
    client_name: client?.client_name || '',
    redirect_uris: client?.redirect_uris || [''],
    grant_types: client?.grant_types || ['authorization_code'],
    response_types: client?.response_types || ['code'],
    scope: client?.scope || 'openid profile email',
    token_endpoint_auth_method: client?.token_endpoint_auth_method || 'client_secret_basic',
    client_uri: client?.client_uri || '',
    logo_uri: client?.logo_uri || '',
    contacts: client?.contacts || [],
    tos_uri: client?.tos_uri || '',
    policy_uri: client?.policy_uri || '',
    skip_consent: client?.skip_consent || false,
    skip_logout_consent: client?.skip_logout_consent || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      redirect_uris: formData.redirect_uris?.filter((uri) => uri.trim() !== ''),
      contacts: formData.contacts?.filter((c) => c.trim() !== ''),
    };
    onSubmit(cleanedData);
  };

  const handleRedirectUriChange = (index: number, value: string) => {
    const newUris = [...(formData.redirect_uris || [])];
    newUris[index] = value;
    setFormData({ ...formData, redirect_uris: newUris });
  };

  const addRedirectUri = () => {
    setFormData({ ...formData, redirect_uris: [...(formData.redirect_uris || []), ''] });
  };

  const removeRedirectUri = (index: number) => {
    const newUris = (formData.redirect_uris || []).filter((_, i) => i !== index);
    setFormData({ ...formData, redirect_uris: newUris.length ? newUris : [''] });
  };

  const toggleGrantType = (grantType: string) => {
    const current = formData.grant_types || [];
    const newGrants = current.includes(grantType)
      ? current.filter((g) => g !== grantType)
      : [...current, grantType];
    setFormData({ ...formData, grant_types: newGrants });
  };

  const toggleResponseType = (responseType: string) => {
    const current = formData.response_types || [];
    const newTypes = current.includes(responseType)
      ? current.filter((t) => t !== responseType)
      : [...current, responseType];
    setFormData({ ...formData, response_types: newTypes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Client Name *
          </label>
          <Input
            value={formData.client_name || ''}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            placeholder="My OAuth Application"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Redirect URIs *
          </label>
          <div className="space-y-2">
            {(formData.redirect_uris || ['']).map((uri, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={uri}
                  onChange={(e) => handleRedirectUriChange(index, e.target.value)}
                  placeholder="https://example.com/callback"
                />
                {(formData.redirect_uris?.length || 0) > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeRedirectUri(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRedirectUri}>
              + Add Redirect URI
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Grant Types
          </label>
          <div className="flex flex-wrap gap-2">
            {GRANT_TYPE_OPTIONS.map((grant) => (
              <button
                key={grant}
                type="button"
                onClick={() => toggleGrantType(grant)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  formData.grant_types?.includes(grant)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {grant}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Response Types
          </label>
          <div className="flex flex-wrap gap-2">
            {RESPONSE_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleResponseType(type)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  formData.response_types?.includes(type)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Scope
          </label>
          <Input
            value={formData.scope || ''}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
            placeholder="openid profile email"
          />
          <p className="mt-1 text-xs text-zinc-500">Space-separated list of scopes</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Token Endpoint Auth Method
          </label>
          <select
            value={formData.token_endpoint_auth_method || 'client_secret_basic'}
            onChange={(e) =>
              setFormData({ ...formData, token_endpoint_auth_method: e.target.value })
            }
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          >
            {TOKEN_AUTH_METHOD_OPTIONS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Client URI
            </label>
            <Input
              value={formData.client_uri || ''}
              onChange={(e) => setFormData({ ...formData, client_uri: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Logo URI
            </label>
            <Input
              value={formData.logo_uri || ''}
              onChange={(e) => setFormData({ ...formData, logo_uri: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Terms of Service URI
            </label>
            <Input
              value={formData.tos_uri || ''}
              onChange={(e) => setFormData({ ...formData, tos_uri: e.target.value })}
              placeholder="https://example.com/tos"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Privacy Policy URI
            </label>
            <Input
              value={formData.policy_uri || ''}
              onChange={(e) => setFormData({ ...formData, policy_uri: e.target.value })}
              placeholder="https://example.com/privacy"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.skip_consent || false}
              onChange={(e) => setFormData({ ...formData, skip_consent: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Skip Consent</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.skip_logout_consent || false}
              onChange={(e) => setFormData({ ...formData, skip_logout_consent: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Skip Logout Consent</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}
