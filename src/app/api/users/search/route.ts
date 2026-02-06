import { isUserAdmin } from '@/app-utils/auth-utils';
import { authOptions } from '@/auth';
import {
  KratosAdminService,
  KratosIdentity,
} from '@/features/consents/services/kratos-admin.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface UserSuggestion {
  id: string;
  email: string;
}

function extractEmail(identity: KratosIdentity): string | null {
  const traits = identity.traits ?? {};
  const emailFromTraits = typeof traits.email === 'string' ? traits.email : null;
  if (emailFromTraits) return emailFromTraits;

  if (Array.isArray(traits.emails)) {
    const email = traits.emails.find((value) => typeof value === 'string');
    if (email) return email;
  }

  const recovery = identity.recovery_addresses?.find((item) => item.value);
  if (recovery?.value) return recovery.value;

  const verifiable = identity.verifiable_addresses?.find((item) => item.value);
  if (verifiable?.value) return verifiable.value;

  return null;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUserAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim().toLowerCase() ?? '';

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const identities = await KratosAdminService.listIdentities();

    const MAX_RESULT = 10;
    const suggestions: UserSuggestion[] = identities
      .map((identity) => ({
        id: identity.id,
        email: extractEmail(identity) ?? '',
      }))
      .filter(
        (suggestion) =>
          suggestion.email.toLowerCase().includes(query) ||
          suggestion.id.toLowerCase().includes(query),
      )
      .slice(0, MAX_RESULT);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search users' },
      { status: 500 },
    );
  }
}
