import { UrlHelper } from '@/helpers/url.helper';
import { prisma } from '@/prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { AuthOptions } from 'next-auth';

const prismaAdapter = PrismaAdapter(prisma);

export const authOptions: AuthOptions = {
  adapter: prismaAdapter,

  callbacks: {
    async jwt({ account, profile, token }) {
      // On initial sign-in, persist provider tokens into the JWT token object.
      // NOTE: With database sessions, this token is NOT your session source of truth,
      // but it can still be useful for server-side calls in the same request lifecycle.
      if (account) {
        token['accessToken'] = account.access_token;
        token['idToken'] = account.id_token;
        token['refreshToken'] = account.refresh_token;
        token['expiresAt'] = account.expires_at;
        token['provider'] = account.provider;
      }

      // If you want the provider's OIDC subject, store it separately.
      // DO NOT overwrite token.sub (NextAuth uses it for the user id in JWT strategy).
      if (profile && 'sub' in profile && typeof profile.sub === 'string') {
        token['oidcSub'] = profile.sub;
      }

      return token;
    },
    async session({ session, user }) {
      // Database session strategy: user is available; token may be undefined.
      if (session.user) {
        (session.user as unknown as { id: unknown }).id = user.id;
      }
      return session;
    },
  },
  providers: [
    {
      authorization: { params: { scope: 'openid profile email offline_access' } },
      checks: ['pkce', 'state'],
      clientId: process.env.ORY_HYDRA_CLIENT_ID,
      clientSecret: process.env.ORY_HYDRA_CLIENT_SECRET,
      id: 'hydra',
      idToken: true,
      name: 'Hydra',
      profile(profile) {
        return {
          email: profile.email ?? null,
          id: profile.sub ?? null,
          image: (profile as unknown as { picture: string }).picture ?? null,
          name: profile.name ?? profile.preferred_username ?? null,
        };
      },
      type: 'oauth',
      wellKnown: UrlHelper.joinUrl(
        process.env.ORY_HYDRA_ISSUER,
        '/.well-known/openid-configuration',
      ),
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'database' },
};
