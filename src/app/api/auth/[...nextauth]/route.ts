import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from "next-auth/providers/google"
import { auth } from '@/lib/firebase'
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth'

// Extend the next-auth session type to include user id
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async signIn({ account }) {
      if (!account) return false;

      try {
        if (account.provider === 'google' && account.id_token) {
          const credential = GoogleAuthProvider.credential(account.id_token);
          await signInWithCredential(auth, credential);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error signing in with Firebase:', error);
        return false;
      }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 