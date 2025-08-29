import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Prevent signin page redirecting to itself
      if (url.includes('/api/auth/signin')) {
        return baseUrl;
      }
      
      // Handle sign-out redirects
      if (url.includes('/api/auth/signout')) {
        return `${baseUrl}/api/auth/signin`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      // Default to home page for successful sign-ins
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
};

export default NextAuth(authOptions);
