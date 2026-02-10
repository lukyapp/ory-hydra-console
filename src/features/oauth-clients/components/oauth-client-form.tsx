'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OAuth2Client } from '@/features/oauth-clients/services/hydra-admin.service';
import { useMemo, useState } from 'react';

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

const ACCESS_TOKEN_STRATEGY_OPTIONS = ['opaque', 'jwt'];

const SUBJECT_TYPE_OPTIONS = ['public', 'pairwise'];

export function OAuthClientForm({
  client,
  onSubmit,
  onCancel,
  isSubmitting,
}: OAuthClientFormProps) {
  const [formData, setFormData] = useState<OAuth2Client>({
    client_id: client?.client_id || '',
    client_secret: client?.client_secret || '',
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
    owner: client?.owner || '',
    jwks_uri: client?.jwks_uri || '',
    sector_identifier_uri: client?.sector_identifier_uri || '',
    subject_type: client?.subject_type || 'public',
    request_object_signing_alg: client?.request_object_signing_alg || 'RS256',
    request_uris: client?.request_uris || [],
    post_logout_redirect_uris: client?.post_logout_redirect_uris || [],
    allowed_cors_origins: client?.allowed_cors_origins || [],
    audience: client?.audience || [],
    access_token_strategy: client?.access_token_strategy || 'opaque',
    backchannel_logout_callback: client?.backchannel_logout_callback || '',
    backchannel_logout_session_required: client?.backchannel_logout_session_required || false,
    frontchannel_logout_callback: client?.frontchannel_logout_callback || '',
    frontchannel_logout_session_required: client?.frontchannel_logout_session_required || false,
    skip_consent: client?.skip_consent || false,
    skip_logout_consent: client?.skip_logout_consent || false,
  });
  const [metadataJson, setMetadataJson] = useState(
    client?.metadata ? JSON.stringify(client.metadata, null, 2) : '',
  );
  const [jwksJson, setJwksJson] = useState(
    client?.jwks ? JSON.stringify(client.jwks, null, 2) : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requireRedirectUris = useMemo(() => {
    const grantTypes = formData.grant_types || [];
    const responseTypes = formData.response_types || [];
    if (grantTypes.length === 1 && grantTypes[0] === 'client_credentials') {
      return false;
    }
    return (
      grantTypes.includes('authorization_code') ||
      grantTypes.includes('implicit') ||
      responseTypes.includes('code') ||
      responseTypes.includes('token') ||
      responseTypes.includes('id_token')
    );
  }, [formData.grant_types, formData.response_types]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    const validateUrl = (value: string, label: string) => {
      if (!value.trim()) return null;
      try {
        const url = new URL(value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return `${label} must start with http:// or https://.`;
        }
        return null;
      } catch {
        return `${label} must be a valid URL.`;
      }
    };

    const validateUrlList = (
      values: string[] | undefined,
      label: string,
      key: string,
      requireAtLeastOne = false,
    ) => {
      const cleaned = (values || []).map((value) => value.trim()).filter(Boolean);
      if (requireAtLeastOne && cleaned.length === 0) {
        validationErrors[key] = `${label} requires at least one URL.`;
        return;
      }
      for (let i = 0; i < cleaned.length; i += 1) {
        const error = validateUrl(cleaned[i], `${label} ${i + 1}`);
        if (error) {
          validationErrors[key] = error;
          return;
        }
      }
    };

    if (!formData.client_name?.trim()) {
      validationErrors.client_name = 'Client name is required.';
    }

    if (!formData.grant_types || formData.grant_types.length === 0) {
      validationErrors.grant_types = 'Select at least one grant type.';
    }

    const responseTypesRequired = !(
      (formData.grant_types || []).length === 1 &&
      formData.grant_types?.[0] === 'client_credentials'
    );
    if (
      responseTypesRequired &&
      (!formData.response_types || formData.response_types.length === 0)
    ) {
      validationErrors.response_types = 'Select at least one response type.';
    }

    validateUrlList(formData.redirect_uris, 'Redirect URI', 'redirect_uris', requireRedirectUris);
    const clientUriError = validateUrl(formData.client_uri || '', 'Client URI');
    if (clientUriError) validationErrors.client_uri = clientUriError;

    const logoUriError = validateUrl(formData.logo_uri || '', 'Logo URI');
    if (logoUriError) validationErrors.logo_uri = logoUriError;

    const tosUriError = validateUrl(formData.tos_uri || '', 'Terms of Service URI');
    if (tosUriError) validationErrors.tos_uri = tosUriError;

    const policyUriError = validateUrl(formData.policy_uri || '', 'Privacy Policy URI');
    if (policyUriError) validationErrors.policy_uri = policyUriError;

    const jwksUriError = validateUrl(formData.jwks_uri || '', 'JWKS URI');
    if (jwksUriError) validationErrors.jwks_uri = jwksUriError;

    const sectorIdentifierUriError = validateUrl(
      formData.sector_identifier_uri || '',
      'Sector Identifier URI',
    );
    if (sectorIdentifierUriError) validationErrors.sector_identifier_uri = sectorIdentifierUriError;

    const backchannelLogoutCallbackError = validateUrl(
      formData.backchannel_logout_callback || '',
      'Backchannel Logout Callback',
    );
    if (backchannelLogoutCallbackError) {
      validationErrors.backchannel_logout_callback = backchannelLogoutCallbackError;
    }

    const frontchannelLogoutCallbackError = validateUrl(
      formData.frontchannel_logout_callback || '',
      'Frontchannel Logout Callback',
    );
    if (frontchannelLogoutCallbackError) {
      validationErrors.frontchannel_logout_callback = frontchannelLogoutCallbackError;
    }

    validateUrlList(
      formData.post_logout_redirect_uris,
      'Post Logout Redirect URI',
      'post_logout_redirect_uris',
    );
    validateUrlList(formData.request_uris, 'Request URI', 'request_uris');
    validateUrlList(formData.allowed_cors_origins, 'Allowed CORS Origin', 'allowed_cors_origins');

    if (metadataJson.trim()) {
      try {
        JSON.parse(metadataJson);
      } catch {
        validationErrors.metadata = 'Metadata must be valid JSON.';
      }
    }

    if (jwksJson.trim()) {
      try {
        JSON.parse(jwksJson);
      } catch {
        validationErrors.jwks = 'JWKS must be valid JSON.';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const cleanedData = {
      ...formData,
      client_id: formData.client_id?.trim() ? formData.client_id.trim() : undefined,
      client_secret: formData.client_secret?.trim() ? formData.client_secret.trim() : undefined,
      owner: formData.owner?.trim() ? formData.owner.trim() : undefined,
      redirect_uris: formData.redirect_uris?.filter((uri) => uri.trim() !== ''),
      contacts: formData.contacts?.filter((c) => c.trim() !== ''),
      request_uris: formData.request_uris?.filter((uri) => uri.trim() !== ''),
      post_logout_redirect_uris: formData.post_logout_redirect_uris?.filter(
        (uri) => uri.trim() !== '',
      ),
      allowed_cors_origins: formData.allowed_cors_origins?.filter((origin) => origin.trim() !== ''),
      audience: formData.audience?.filter((aud) => aud.trim() !== ''),
      metadata: metadataJson.trim() ? JSON.parse(metadataJson) : undefined,
      jwks: jwksJson.trim() ? JSON.parse(jwksJson) : undefined,
    };
    setErrors({});
    onSubmit(cleanedData);
  };

  const handleRedirectUriChange = (index: number, value: string) => {
    const newUris = [...(formData.redirect_uris || [])];
    newUris[index] = value;
    setFormData({ ...formData, redirect_uris: newUris });
  };

  const updateListValue = (key: keyof OAuth2Client, index: number, value: string) => {
    const current = [...((formData[key] as string[]) || [])];
    current[index] = value;
    setFormData({ ...formData, [key]: current });
  };

  const addListValue = (key: keyof OAuth2Client, fallback: string[] = []) => {
    const current = [...((formData[key] as string[]) || fallback)];
    setFormData({ ...formData, [key]: [...current, ''] });
  };

  const removeListValue = (key: keyof OAuth2Client, index: number, emptyValue: string[] = []) => {
    const current = ((formData[key] as string[]) || []).filter((_, i) => i !== index);
    setFormData({ ...formData, [key]: current.length ? current : emptyValue });
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Client ID
            </label>
            <Input
              value={formData.client_id || ''}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              placeholder="my-client-id"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Client Secret
            </label>
            <Input
              type="password"
              value={formData.client_secret || ''}
              onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Client Name *
          </label>
          <Input
            value={formData.client_name || ''}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            placeholder="My OAuth Application"
            required
            aria-invalid={Boolean(errors.client_name)}
          />
          {errors.client_name && <p className="mt-1 text-xs text-red-600">{errors.client_name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Redirect URIs {requireRedirectUris ? '*' : ''}
          </label>
          <div className="space-y-2">
            {(formData.redirect_uris || ['']).map((uri, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={uri}
                  onChange={(e) => handleRedirectUriChange(index, e.target.value)}
                  placeholder="https://example.com/callback"
                  aria-invalid={Boolean(errors.redirect_uris)}
                />
                {(formData.redirect_uris?.length || 0) > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListValue('redirect_uris', index, [''])}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListValue('redirect_uris', [''])}
            >
              + Add Redirect URI
            </Button>
            {errors.redirect_uris && <p className="text-xs text-red-600">{errors.redirect_uris}</p>}
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
          {errors.grant_types && <p className="mt-1 text-xs text-red-600">{errors.grant_types}</p>}
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
          {errors.response_types && (
            <p className="mt-1 text-xs text-red-600">{errors.response_types}</p>
          )}
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
              Access Token Strategy
            </label>
            <select
              value={formData.access_token_strategy || 'opaque'}
              onChange={(e) => setFormData({ ...formData, access_token_strategy: e.target.value })}
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            >
              {ACCESS_TOKEN_STRATEGY_OPTIONS.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Subject Type
            </label>
            <select
              value={formData.subject_type || 'public'}
              onChange={(e) => setFormData({ ...formData, subject_type: e.target.value })}
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            >
              {SUBJECT_TYPE_OPTIONS.map((subjectType) => (
                <option key={subjectType} value={subjectType}>
                  {subjectType}
                </option>
              ))}
            </select>
          </div>
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
              aria-invalid={Boolean(errors.client_uri)}
            />
            {errors.client_uri && <p className="mt-1 text-xs text-red-600">{errors.client_uri}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Logo URI
            </label>
            <Input
              value={formData.logo_uri || ''}
              onChange={(e) => setFormData({ ...formData, logo_uri: e.target.value })}
              placeholder="https://example.com/logo.png"
              aria-invalid={Boolean(errors.logo_uri)}
            />
            {errors.logo_uri && <p className="mt-1 text-xs text-red-600">{errors.logo_uri}</p>}
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
              aria-invalid={Boolean(errors.tos_uri)}
            />
            {errors.tos_uri && <p className="mt-1 text-xs text-red-600">{errors.tos_uri}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Privacy Policy URI
            </label>
            <Input
              value={formData.policy_uri || ''}
              onChange={(e) => setFormData({ ...formData, policy_uri: e.target.value })}
              placeholder="https://example.com/privacy"
              aria-invalid={Boolean(errors.policy_uri)}
            />
            {errors.policy_uri && <p className="mt-1 text-xs text-red-600">{errors.policy_uri}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Owner
            </label>
            <Input
              value={formData.owner || ''}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="owner@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              JWKS URI
            </label>
            <Input
              value={formData.jwks_uri || ''}
              onChange={(e) => setFormData({ ...formData, jwks_uri: e.target.value })}
              placeholder="https://example.com/.well-known/jwks.json"
              aria-invalid={Boolean(errors.jwks_uri)}
            />
            {errors.jwks_uri && <p className="mt-1 text-xs text-red-600">{errors.jwks_uri}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Sector Identifier URI
            </label>
            <Input
              value={formData.sector_identifier_uri || ''}
              onChange={(e) => setFormData({ ...formData, sector_identifier_uri: e.target.value })}
              placeholder="https://example.com/sector.json"
              aria-invalid={Boolean(errors.sector_identifier_uri)}
            />
            {errors.sector_identifier_uri && (
              <p className="mt-1 text-xs text-red-600">{errors.sector_identifier_uri}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Request Object Signing Alg
            </label>
            <Input
              value={formData.request_object_signing_alg || ''}
              onChange={(e) =>
                setFormData({ ...formData, request_object_signing_alg: e.target.value })
              }
              placeholder="RS256"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Contacts
          </label>
          <div className="space-y-2">
            {(formData.contacts?.length ? formData.contacts : ['']).map((contact, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={contact}
                  onChange={(e) => updateListValue('contacts', index, e.target.value)}
                  placeholder="team@example.com"
                />
                {(formData.contacts?.length || 0) > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListValue('contacts', index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListValue('contacts', [''])}
            >
              + Add Contact
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Allowed CORS Origins
          </label>
          <div className="space-y-2">
            {(formData.allowed_cors_origins?.length ? formData.allowed_cors_origins : ['']).map(
              (origin, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={origin}
                    onChange={(e) => updateListValue('allowed_cors_origins', index, e.target.value)}
                    placeholder="https://app.example.com"
                    aria-invalid={Boolean(errors.allowed_cors_origins)}
                  />
                  {(formData.allowed_cors_origins?.length || 0) > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeListValue('allowed_cors_origins', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListValue('allowed_cors_origins', [''])}
            >
              + Add Allowed Origin
            </Button>
            {errors.allowed_cors_origins && (
              <p className="text-xs text-red-600">{errors.allowed_cors_origins}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Audience
          </label>
          <div className="space-y-2">
            {(formData.audience?.length ? formData.audience : ['']).map((audience, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={audience}
                  onChange={(e) => updateListValue('audience', index, e.target.value)}
                  placeholder="api://default"
                />
                {(formData.audience?.length || 0) > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListValue('audience', index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListValue('audience', [''])}
            >
              + Add Audience
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Request URIs
          </label>
          <div className="space-y-2">
            {(formData.request_uris?.length ? formData.request_uris : ['']).map((uri, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={uri}
                  onChange={(e) => updateListValue('request_uris', index, e.target.value)}
                  placeholder="https://example.com/requests.json"
                  aria-invalid={Boolean(errors.request_uris)}
                />
                {(formData.request_uris?.length || 0) > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListValue('request_uris', index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListValue('request_uris', [''])}
            >
              + Add Request URI
            </Button>
            {errors.request_uris && <p className="text-xs text-red-600">{errors.request_uris}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Post Logout Redirect URIs
          </label>
          <div className="space-y-2">
            {(formData.post_logout_redirect_uris?.length
              ? formData.post_logout_redirect_uris
              : ['']
            ).map((uri, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={uri}
                  onChange={(e) =>
                    updateListValue('post_logout_redirect_uris', index, e.target.value)
                  }
                  placeholder="https://example.com/logout-callback"
                  aria-invalid={Boolean(errors.post_logout_redirect_uris)}
                />
                {(formData.post_logout_redirect_uris?.length || 0) > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListValue('post_logout_redirect_uris', index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListValue('post_logout_redirect_uris', [''])}
            >
              + Add Post Logout URI
            </Button>
            {errors.post_logout_redirect_uris && (
              <p className="text-xs text-red-600">{errors.post_logout_redirect_uris}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Backchannel Logout Callback
            </label>
            <Input
              value={formData.backchannel_logout_callback || ''}
              onChange={(e) =>
                setFormData({ ...formData, backchannel_logout_callback: e.target.value })
              }
              placeholder="https://example.com/backchannel-logout"
              aria-invalid={Boolean(errors.backchannel_logout_callback)}
            />
            {errors.backchannel_logout_callback && (
              <p className="mt-1 text-xs text-red-600">{errors.backchannel_logout_callback}</p>
            )}
            <label className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.backchannel_logout_session_required || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    backchannel_logout_session_required: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Backchannel Logout Session Required
              </span>
            </label>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Frontchannel Logout Callback
            </label>
            <Input
              value={formData.frontchannel_logout_callback || ''}
              onChange={(e) =>
                setFormData({ ...formData, frontchannel_logout_callback: e.target.value })
              }
              placeholder="https://example.com/frontchannel-logout"
              aria-invalid={Boolean(errors.frontchannel_logout_callback)}
            />
            {errors.frontchannel_logout_callback && (
              <p className="mt-1 text-xs text-red-600">{errors.frontchannel_logout_callback}</p>
            )}
            <label className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.frontchannel_logout_session_required || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frontchannel_logout_session_required: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Frontchannel Logout Session Required
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Metadata (JSON)
            </label>
            <textarea
              value={metadataJson}
              onChange={(e) => setMetadataJson(e.target.value)}
              placeholder='{"tier":"gold"}'
              className="min-h-[96px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              aria-invalid={Boolean(errors.metadata)}
            />
            {errors.metadata && <p className="mt-1 text-xs text-red-600">{errors.metadata}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              JWKS (JSON)
            </label>
            <textarea
              value={jwksJson}
              onChange={(e) => setJwksJson(e.target.value)}
              placeholder='{"keys":[...]}'
              className="min-h-[96px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              aria-invalid={Boolean(errors.jwks)}
            />
            {errors.jwks && <p className="mt-1 text-xs text-red-600">{errors.jwks}</p>}
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
