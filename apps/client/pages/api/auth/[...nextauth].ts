import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const providers = [] as NextAuthOptions["providers"];

// Add configured OAuth providers when env vars are present
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// In development, provide a safe Credentials fallback if no OAuth providers are configured
if (providers.length === 0 && process.env.NODE_ENV !== "production") {
  providers.push(
    CredentialsProvider({
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.name || credentials.email,
        } as any;
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  trustHost: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      const previewBase = process.env.NEXTAUTH_URL || baseUrl;
      try {
        const target = new URL(url, previewBase);
        const enforced = new URL(previewBase);
        target.protocol = enforced.protocol;
        target.host = enforced.host;
        return target.toString();
      } catch {
        return previewBase;
      }
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
};

export default NextAuth(authOptions);
