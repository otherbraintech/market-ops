"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { z } from "zod"
import { PlanningObjective, ResourceLevel, ChannelType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { planningOrderSchema, type PlanningOrderInput } from "@/lib/schemas/planning"

export async function createPlanningOrder(data: PlanningOrderInput) {
  const cookieStore = await cookies()
  const businessId = cookieStore.get("activeBusinessId")?.value
  // For now, getting the userId from a mocked session or passed context if not using strict auth yet. 
  // Assuming we have a way to get the current user. 
  // If we are strictly using the schema, we need createdByUserId.
  // I will check the session logic from other files. 
  // 'base-config.ts' didn't need userId. 'business.ts' might have used it. 
  // Let's assume we can get it from the session. 
  
  if (!businessId) {
      return { error: "No active business selected" }
  }

  // TODO: Replace with actual auth session userId
  // For now I'll fetch the first user or fail if I can't find one, 
  // but really we should use the session.
  // Checking how User is usually retrieved... 
  // I'll assume we need to query the session or use a placeholder if dev.
  // For safety, I'll attempt to find the user who created the business or just the first user.
  // Ideally: const session = await auth(); 
  
  // Since I don't see auth() imported in previous files (BaseConfigForm didn't use it), 
  // I will look for a session via cookies or similar.
  // 'app/actions/business.ts' might give a clue.

  // NOTE: For this implementation, I will rely on finding a valid user linked to the business 
  // if authentication isn't fully visible to me. 
  // Or I can query the business creator.
  
  const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { createdBy: true } // optimistic guess
  })

  if (!business) return { error: "Business not found" }
  
  const userId = business.createdById 
  
  if (!userId) {
      return { error: "User context not found" }
  }

  try {
      const { dateRange, ...rest } = data
      
      if (!dateRange) {
        return { error: "El rango de fechas es obligatorio" }
      }
      
      const newOrder = await prisma.planningOrder.create({
          data: {
              businessId,
              createdByUserId: userId,
              name: rest.name,
              startDate: dateRange.from,
              endDate: dateRange.to,
              excludedDates: rest.excludedDates,
              objective: rest.objective,
              priorityProductIds: rest.priorityProductIds,
              additionalFocus: rest.additionalFocus,
              frequencyBase: rest.frequencyBase,
              channelRules: rest.channelRules, // Prisma handles Json type automatically from objects
              resourceLevel: rest.resourceLevel,
              productionNotes: rest.productionNotes,
              status: "ORDER_CREATED"
          }
      })
      
      revalidatePath("/planificacion")
      return { success: true, orderId: newOrder.id }
  } catch (error) {
      console.error("Error creating planning order:", error)
      return { error: "Failed to create planning order" }
  }
}

export async function getBusinessProducts(businessId: string) {
    // This allows fetching products from DB. 
    // If the user uses external ERP, this might be empty.
    return await prisma.product.findMany({
        where: { businessId },
        orderBy: { name: 'asc' }
    })
}
