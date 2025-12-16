"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfile(userId: string, data: { name: string; avatar?: string; email?: string }) {
    if (!userId) return { error: "User ID required" }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                image: data.avatar, // Mapping avatar to image in DB schema
                email: data.email, // Allow email update if provided
            }
        })
        revalidatePath("/cuenta")
        return { success: true }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { error: "Error al actualizar el perfil" }
    }
}
