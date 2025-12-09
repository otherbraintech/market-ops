"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { scryptSync, timingSafeEqual } from "crypto"

function hashPassword(password: string, salt: string) {
  const buf = scryptSync(password, salt, 64)
  return `${salt}:${buf.toString("hex")}`
}

function verifyPassword(password: string, stored: string) {
  const [salt, keyHex] = stored.split(":")
  if (!salt || !keyHex) return false
  const key = Buffer.from(keyHex, "hex")
  const derived = scryptSync(password, salt, 64)
  return timingSafeEqual(key, derived)
}

export async function signInCredentials(formData: FormData) {
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")
  if (!email || !password) redirect("/login?error=missing")
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=invalid")
  }
  const jar = await cookies()
  jar.set("session", user.id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 })
  redirect("/")
}

export async function signOut() {
  const jar = await cookies()
  jar.delete("session")
  redirect("/login")
}

export { signInCredentials as signInDev }
