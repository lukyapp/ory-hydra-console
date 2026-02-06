import { UrlHelper } from '@/helpers/url.helper';

const HYDRA_ADMIN_URL = process.env.ORY_HYDRA_ADMIN_URL!;

export interface RevokeConsentParams {
  subject: string;
  client?: string;
  all?: boolean;
}

export class HydraConsentsService {
  private static buildUrl(path: string): string {
    return UrlHelper.joinUrl(HYDRA_ADMIN_URL, path);
  }

  static async revokeConsent(params: RevokeConsentParams): Promise<void> {
    const url = new URL(this.buildUrl('/admin/oauth2/auth/sessions/consent'));
    url.searchParams.set('subject', params.subject);

    if (params.client) {
      url.searchParams.set('client', params.client);
    }

    if (params.all) {
      url.searchParams.set('all', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to revoke consent: ${response.status} ${error}`);
    }
  }
}
