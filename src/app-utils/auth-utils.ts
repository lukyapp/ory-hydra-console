import { Session } from 'next-auth';

export function isUserAdmin(session: Session) {
  if (!session?.user?.email) return false;
  return process.env.ADMIN_EMAILS.includes(session.user.email);
}
