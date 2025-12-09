"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { randomBytes, scryptSync } from "crypto"

const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
})

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const buf = scryptSync(password, salt, 64)
  return `${salt}:${buf.toString("hex")}`
}

export type RegisterInput = z.infer<typeof registerSchema>

export async function registerUser(formData: FormData) {
  const data = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  }
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    redirect("/register?error=validation")
  }
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) {
    redirect("/register?error=exists")
  }
  const passwordHash = hashPassword(parsed.data.password)
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    },
  })
  const jar = await cookies()
  jar.set("session", user.id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 })
  redirect("/")
}
