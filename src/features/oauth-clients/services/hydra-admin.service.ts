import { UrlHelper } from '@/helpers/url.helper';

const HYDRA_ADMIN_URL = process.env.ORY_HYDRA_ADMIN_URL!;

export interface OAuth2Client {
  client_id?: string;
  client_name?: string;
  client_secret?: string;
  client_secret_expires_at?: number;
  client_uri?: string;
  contacts?: string[];
  created_at?: string;
  grant_types?: string[];
  allowed_cors_origins?: string[];
  audience?: string[];
  backchannel_logout_callback?: string;
  backchannel_logout_session_required?: boolean;
  frontchannel_logout_callback?: string;
  frontchannel_logout_session_required?: boolean;
  jwks?: Record<string, unknown>;
  jwks_uri?: string;
  logo_uri?: string;
  metadata?: Record<string, unknown>;
  owner?: string;
  policy_uri?: string;
  post_logout_redirect_uris?: string[];
  redirect_uris?: string[];
  response_types?: string[];
  request_object_signing_alg?: string;
  request_uris?: string[];
  scope?: string;
  sector_identifier_uri?: string;
  subject_type?: string;
  token_endpoint_auth_method?: string;
  tos_uri?: string;
  updated_at?: string;
  skip_consent?: boolean;
  skip_logout_consent?: boolean;
  access_token_strategy?: string;
}

export interface ListClientsParams {
  page_size?: number;
  page_token?: string;
  client_name?: string;
  owner?: string;
}

export class HydraAdminService {
  private static buildUrl(path: string): string {
    return UrlHelper.joinUrl(HYDRA_ADMIN_URL, path);
  }

  static async listClients(params?: ListClientsParams): Promise<OAuth2Client[]> {
    const url = new URL(this.buildUrl('/admin/clients'));
    if (params?.page_size) url.searchParams.set('page_size', params.page_size.toString());
    if (params?.page_token) url.searchParams.set('page_token', params.page_token);
    if (params?.client_name) url.searchParams.set('client_name', params.client_name);
    if (params?.owner) url.searchParams.set('owner', params.owner);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list clients: ${response.status} ${error}`);
    }

    return response.json();
  }

  static async getClient(clientId: string): Promise<OAuth2Client> {
    const response = await fetch(this.buildUrl(`/admin/clients/${encodeURIComponent(clientId)}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get client: ${response.status} ${error}`);
    }

    return response.json();
  }

  static async createClient(client: OAuth2Client): Promise<OAuth2Client> {
    const response = await fetch(this.buildUrl('/admin/clients'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create client: ${response.status} ${error}`);
    }

    return response.json();
  }

  static async updateClient(clientId: string, client: OAuth2Client): Promise<OAuth2Client> {
    const response = await fetch(this.buildUrl(`/admin/clients/${encodeURIComponent(clientId)}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update client: ${response.status} ${error}`);
    }

    return response.json();
  }

  static async deleteClient(clientId: string): Promise<void> {
    const response = await fetch(this.buildUrl(`/admin/clients/${encodeURIComponent(clientId)}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete client: ${response.status} ${error}`);
    }
  }
}
