import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { scryptSync, timingSafeEqual } from "crypto"

function verifyPassword(password: string, stored?: string | null) {
  if (!stored) return false
  const [salt, keyHex] = stored.split(":")
  if (!salt || !keyHex) return false
  const key = Buffer.from(keyHex, "hex")
  const derived = scryptSync(password, salt, 64)
  return timingSafeEqual(key, derived)
}

export function authOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const email = String(credentials?.email || "")
          const password = String(credentials?.password || "")
          if (!email || !password) return null
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null
          if (!verifyPassword(password, user.passwordHash)) return null
          return { id: user.id, name: user.name ?? undefined, email: user.email, image: user.image ?? undefined }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          // First time (on sign in)
          token.id = (user as any).id
          ;(token as any).role = (user as any).role || "CLIENT"
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          ;(session.user as any).id = (token as any).id
          ;(session.user as any).role = (token as any).role || "CLIENT"
        }
        return session
      },
      async redirect({ url, baseUrl }) {
        try {
          if (url.startsWith("/")) return `${baseUrl}${url}`
          const u = new URL(url)
          const b = new URL(baseUrl)
          // Same-origin absolute URLs
          if (u.origin === b.origin) return url
        } catch {}
        return baseUrl
      },
    },
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
}
