import { isUserAdmin } from '@/app-utils/auth-utils';
import { authOptions } from '@/auth';
import { HydraAdminService } from '@/features/oauth-clients/services/hydra-admin.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ clientId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUserAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { clientId } = await context.params;
    const client = await HydraAdminService.getClient(clientId);
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error getting OAuth client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get client' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUserAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { clientId } = await context.params;
    const body = await request.json();
    const client = await HydraAdminService.updateClient(clientId, body);
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating OAuth client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update client' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isUserAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { clientId } = await context.params;
    await HydraAdminService.deleteClient(clientId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting OAuth client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete client' },
      { status: 500 },
    );
  }
}
