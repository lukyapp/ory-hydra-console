import { UrlHelper } from '@/helpers/url.helper';

const KRATOS_ADMIN_URL = process.env.ORY_KRATOS_ADMIN_URL;

export interface KratosIdentity {
  id: string;
  traits?: Record<string, unknown>;
  recovery_addresses?: Array<{ value?: string | null }>;
  verifiable_addresses?: Array<{ value?: string | null }>;
}

export interface KratosIdentityListParams {
  perPage?: number;
  page?: number;
}

export class KratosAdminService {
  private static buildUrl(path: string): string {
    return UrlHelper.joinUrl(KRATOS_ADMIN_URL, path);
  }

  static async listIdentities(): Promise<KratosIdentity[]> {
    const url = new URL(this.buildUrl('/admin/identities'));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list identities: ${response.status} ${error}`);
    }

    return response.json();
  }
}
