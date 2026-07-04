import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const providers = [
  GithubProvider({
    clientId: process.env.GITHUB_ID as string,
    clientSecret: process.env.GITHUB_SECRET as string,
  }),
];

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    })
  );
}

const handler = NextAuth({
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Expose token sub (which is the provider ID) as user id if needed, or the token itself
        // to be able to send to the desktop app. 
        // For simplicity, we can pass the JWT token to the client to send to the desktop app.
        // In a real app, you might issue a specific short-lived desktop auth token.
        (session as any).accessToken = token.sub || token.jti;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
