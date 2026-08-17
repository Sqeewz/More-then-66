import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'ac.th';

const googleClientId = (process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '').trim();
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '').trim();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'mt66-cs67-default-secret-key-fallback-32chars',
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email || '';
      if (!email.endsWith(`.${ALLOWED_DOMAIN}`) && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        return false;
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email;
      }
      return token;
    },
  },
  pages: {
    error: '/',
  },
});
