import { isUserAdmin } from '@/app-utils/auth-utils';
import { authOptions } from '@/auth';
import { HydraConsentsService } from '@/features/consents/services/hydra-consents.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface RevokeConsentPayload {
  subject?: string;
  client?: string;
  all?: boolean;
}

async function resolveSubject(payload: RevokeConsentPayload) {
  if (payload.subject) {
    return { subject: payload.subject };
  }
  return { subject: null, error: 'No user found for this email.' };
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUserAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as RevokeConsentPayload;
    const { subject, error } = await resolveSubject(payload);
    if (!subject) {
      return NextResponse.json({ error: error ?? 'Subject is required.' }, { status: 400 });
    }

    const client = payload.client?.trim() || undefined;
    if (!client && !payload.all) {
      return NextResponse.json({ error: 'Specify a client or set all=true.' }, { status: 400 });
    }

    const revokeAll = !!payload.all && !client;

    await HydraConsentsService.revokeConsent({
      subject,
      client,
      all: revokeAll,
    });

    return NextResponse.json({
      success: true,
      subject,
      client: client ?? null,
      all: revokeAll,
    });
  } catch (error) {
    console.error('Error revoking consent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revoke consent' },
      { status: 500 },
    );
  }
}
