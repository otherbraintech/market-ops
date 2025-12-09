"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Schema for validation (includes status optional, default handled by DB)
const businessSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["MARCA_PERSONAL", "EMPRESA", "ECOMMERCE", "AGENCIA"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  goals: z.string().optional(),
  valueProposition: z.string().optional(),
})

export type BusinessFormData = z.infer<typeof businessSchema>

/** Create a new business (status defaults to ACTIVE) */
export async function createBusiness(data: BusinessFormData) {
  const validated = businessSchema.safeParse(data)
  if (!validated.success) {
    return { error: "Invalid data" }
  }
  try {
    const session = await getServerSession(authOptions())
    const userId = (session?.user as any)?.id as string | undefined
    const business = await prisma.business.create({
      data: {
        ...validated.data,
        createdById: userId,
        members: userId
          ? {
              create: {
                userId,
                role: "ADMIN" as any,
              },
            }
          : undefined,
      },
    })
    revalidatePath("/negocio")
    return { success: true, business }
  } catch (error) {
    console.error("Failed to create business:", error)
    return { error: "Failed to create business" }
  }
}

/** Update an existing business */
export async function updateBusiness(id: string, data: BusinessFormData) {
  const validated = businessSchema.safeParse(data)
  if (!validated.success) {
    return { error: "Invalid data" }
  }
  try {
    const business = await prisma.business.update({
      where: { id },
      data: validated.data,
    })
    revalidatePath("/negocio")
    return { success: true, business }
  } catch (error) {
    console.error("Failed to update business:", error)
    return { error: "Failed to update business" }
  }
}

/** Soft‑delete a business. The caller must pass a confirmation string like "Eliminar_<nombre>" */
export async function deleteBusiness(id: string, confirmString: string) {
  try {
    const business = await prisma.business.findUnique({ where: { id } })
    if (!business) return { error: "Business not found" }
    const normalizeName = (input: string) =>
      input
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}+/gu, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_")
    const expected = `eliminar_${normalizeName(business.name)}`
    if (confirmString !== expected) {
      return { error: "Confirmación incorrecta" }
    }
    await prisma.business.update({
      where: { id },
      data: { status: "DELETED" as any }, // cast because enum type is string in TS
    })
    revalidatePath("/negocio")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete business:", error)
    return { error: "Failed to delete business" }
  }
}

/** Get ACTIVE businesses for the current user (soft‑deleted hidden). If no session, returns []. */
export const getBusinesses = cache(async () => {
  try {
    const session = await getServerSession(authOptions())
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return []
    const businesses = await prisma.business.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { createdById: userId } as any,
          { members: { some: { userId } } } as any,
        ],
      },
      orderBy: { createdAt: "desc" },
    })
    return businesses.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch businesses:", error)
    return []
  }
})

/** Get ACTIVE businesses for the current user (by membership or creator) */
export const getUserBusinesses = cache(async () => {
  try {
    const session = await getServerSession(authOptions())
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return []
    const businesses = await prisma.business.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { createdById: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
    })
    return businesses.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch user businesses:", error)
    return []
  }
})
