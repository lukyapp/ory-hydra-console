import { isUserAdmin } from '@/app-utils/auth-utils';
import { authOptions } from '@/auth';
import { HydraAdminService } from '@/features/oauth-clients/services/hydra-admin.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUserAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const clients = await HydraAdminService.listClients({
      page_size: searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : 100,
      page_token: searchParams.get('page_token') || undefined,
      client_name: searchParams.get('client_name') || undefined,
      owner: searchParams.get('owner') || undefined,
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error listing OAuth clients:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list clients' },
      { status: 500 },
    );
  }
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
    const body = await request.json();
    const client = await HydraAdminService.createClient(body);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating OAuth client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create client' },
      { status: 500 },
    );
  }
}
