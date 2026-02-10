'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OAuth2Client } from '@/features/oauth-clients/services/hydra-admin.service';
import { useMemo, useState } from 'react';

interface OAuthClientQuickFormProps {
  onSubmit: (client: OAuth2Client) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type AppType = 'spa' | 'bff' | 'api' | 'native' | 'service';

const APP_TYPE_OPTIONS: { value: AppType; label: string; description: string }[] = [
  {
    value: 'spa',
    label: 'SPA',
    description: 'Browser app using authorization code + PKCE with public client.',
  },
  {
    value: 'bff',
    label: 'BFF / Web',
    description: 'Server-rendered web app with confidential client secret.',
  },
  {
    value: 'api',
    label: 'API',
    description: 'Machine-to-machine client using client credentials.',
  },
  {
    value: 'native',
    label: 'Native',
    description: 'Mobile/desktop app using public client with authorization code + PKCE.',
  },
  {
    value: 'service',
    label: 'Service',
    description: 'Background service using client credentials.',
  },
];

const parseList = (value: string) =>
  value
    .split(/[\n,]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

export function OAuthClientQuickForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: OAuthClientQuickFormProps) {
  const [appType, setAppType] = useState<AppType>('spa');
  const [clientName, setClientName] = useState('');
  const [redirectUrisRaw, setRedirectUrisRaw] = useState('');
  const [allowedCorsRaw, setAllowedCorsRaw] = useState('');
  const [audienceRaw, setAudienceRaw] = useState('');
  const [scope, setScope] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requiresRedirectUris = useMemo(() => !['api', 'service'].includes(appType), [appType]);

  const validateUrlList = (values: string[], label: string) => {
    for (let i = 0; i < values.length; i += 1) {
      try {
        const url = new URL(values[i]);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return `${label} must start with http:// or https://.`;
        }
      } catch {
        return `${label} must be valid URLs.`;
      }
    }
    return null;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors: Record<string, string> = {};
    const redirectUris = parseList(redirectUrisRaw);
    const corsOrigins = parseList(allowedCorsRaw);
    const audience = parseList(audienceRaw);

    if (!clientName.trim()) {
      validationErrors.client_name = 'Client name is required.';
    }

    if (requiresRedirectUris && redirectUris.length === 0) {
      validationErrors.redirect_uris = 'Provide at least one redirect URI.';
    }

    if (requiresRedirectUris && redirectUris.length > 0) {
      const redirectError = validateUrlList(redirectUris, 'Redirect URIs');
      if (redirectError) validationErrors.redirect_uris = redirectError;
    }

    if (corsOrigins.length > 0) {
      const corsError = validateUrlList(corsOrigins, 'Allowed CORS origins');
      if (corsError) validationErrors.allowed_cors_origins = corsError;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const base: OAuth2Client = {
      client_name: clientName.trim(),
      scope: scope.trim() || undefined,
    };

    let payload: OAuth2Client;

    switch (appType) {
      case 'spa':
        payload = {
          ...base,
          grant_types: ['authorization_code'],
          response_types: ['code'],
          token_endpoint_auth_method: 'none',
          redirect_uris: redirectUris,
          allowed_cors_origins: corsOrigins,
        };
        break;
      case 'bff':
        payload = {
          ...base,
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_basic',
          redirect_uris: redirectUris,
        };
        break;
      case 'native':
        payload = {
          ...base,
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
          token_endpoint_auth_method: 'none',
          redirect_uris: redirectUris,
        };
        break;
      case 'service':
      case 'api':
      default:
        payload = {
          ...base,
          grant_types: ['client_credentials'],
          response_types: [],
          token_endpoint_auth_method: 'client_secret_basic',
          audience: audience,
        };
        break;
    }

    setErrors({});
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            App Type
          </label>
          <div className="grid gap-3">
            {APP_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  appType === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  className="mr-2"
                  checked={appType === option.value}
                  onChange={() => setAppType(option.value)}
                />
                <span className="font-medium">{option.label}</span>
                <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {option.description}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Client Name *
          </label>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="My App"
            aria-invalid={Boolean(errors.client_name)}
            required
          />
          {errors.client_name && <p className="mt-1 text-xs text-red-600">{errors.client_name}</p>}
        </div>

        {requiresRedirectUris && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Redirect URIs *
            </label>
            <textarea
              value={redirectUrisRaw}
              onChange={(e) => setRedirectUrisRaw(e.target.value)}
              placeholder="https://app.example.com/callback"
              className="min-h-[96px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              aria-invalid={Boolean(errors.redirect_uris)}
            />
            <p className="mt-1 text-xs text-zinc-500">One per line or comma-separated.</p>
            {errors.redirect_uris && (
              <p className="mt-1 text-xs text-red-600">{errors.redirect_uris}</p>
            )}
          </div>
        )}

        {appType === 'spa' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Allowed CORS Origins
            </label>
            <textarea
              value={allowedCorsRaw}
              onChange={(e) => setAllowedCorsRaw(e.target.value)}
              placeholder="https://app.example.com"
              className="min-h-[96px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              aria-invalid={Boolean(errors.allowed_cors_origins)}
            />
            <p className="mt-1 text-xs text-zinc-500">Required only if CORS is enabled in Hydra.</p>
            {errors.allowed_cors_origins && (
              <p className="mt-1 text-xs text-red-600">{errors.allowed_cors_origins}</p>
            )}
          </div>
        )}

        {(appType === 'api' || appType === 'service') && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Audience
            </label>
            <textarea
              value={audienceRaw}
              onChange={(e) => setAudienceRaw(e.target.value)}
              placeholder="api://default"
              className="min-h-[72px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
            <p className="mt-1 text-xs text-zinc-500">One per line or comma-separated.</p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Scope (optional)
          </label>
          <Input
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="openid profile email"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}
