import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("[NextAuth] signIn callback", { user, account, profile, email, credentials });
      // Allow OAuth sign in if account already exists for this provider
      if (account?.provider === "google") {
        // Find user by email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        if (existingUser) {
          // Check if Google account is already linked
          const linkedAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          });
          if (!linkedAccount) {
            // Link Google account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
          // Update the user object with the ID
          user.id = existingUser.id;
        } else {
          // Create new user if not exists
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
            }
          });
          // Update the user object with the ID
          user.id = newUser.id;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      console.log("[NextAuth] jwt callback", { token, user, account, profile });
      
      if (user) {
        // When signing in, update the token with user data
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      } else if (token) {
        // On subsequent requests, verify the user still exists
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string }
        });
        
        if (!dbUser) {
          // If user no longer exists, return a new token with null values
          return {
            ...token,
            id: null,
            email: null,
            name: null,
            picture: null
          };
        }
        
        // Update token with latest user data
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.picture = dbUser.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] session callback", { session, token });
      
      if (token) {
        // Update session with user data from token
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] redirect callback", { url, baseUrl });
      if (url.includes("/api/auth/callback")) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith("/auth/signin") || url.startsWith("/auth/signup") ) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  events: {
    async createUser({ user }) {
     // console.log("User created:", user);
    },
    async signIn({ user, account, profile }) {
      //console.log("User signed in:", { user, account, profile });
    },
    async session({ session, token }) {
      //console.log("Session event:", { session, token });
    }
  },
  debug: true,
}; 