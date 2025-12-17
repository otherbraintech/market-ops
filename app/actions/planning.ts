"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { z } from "zod"

import { PlanningObjective, PlanningStatus, AssetSource } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { planningOrderSchema, type PlanningOrderInput } from "@/lib/schemas/planning"

export async function createPlanningOrder(data: PlanningOrderInput) {
  const cookieStore = await cookies()
  const businessId = cookieStore.get("activeBusinessId")?.value

  if (!businessId) {
      return { error: "No active business selected" }
  }

  // Fetch business to get the creator or owner
  const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { createdBy: true }
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
              references: rest.references,
              frequencyBase: rest.frequencyBase,
              channelRules: rest.channelRules,
              assetSource: rest.assetSource,
              productionNotes: rest.productionNotes,
              status: PlanningStatus.ORDER_CREATED,
              contentStrategy: rest.contentStrategy,
              emotionalTone: rest.emotionalTone,
              contentPillars: rest.contentPillars,
          }
      })
      
      revalidatePath("/planificacion")
      return { success: true, orderId: newOrder.id }
  } catch (error) {
      console.error("Error creating planning order:", error)
      return { error: "Failed to create planning order" }
  }
}

export async function updatePlanningOrder(orderId: string, data: PlanningOrderInput) {
    try {
        const { dateRange, ...rest } = data
        
        if (!dateRange) return { error: "El rango de fechas es obligatorio" }

        await prisma.planningOrder.update({
            where: { id: orderId },
            data: {
                name: rest.name,
                startDate: dateRange.from,
                endDate: dateRange.to,
                excludedDates: rest.excludedDates,
                objective: rest.objective,
                priorityProductIds: rest.priorityProductIds,
                additionalFocus: rest.additionalFocus,
                references: rest.references,
                frequencyBase: rest.frequencyBase,
                channelRules: rest.channelRules,
                assetSource: rest.assetSource,
                productionNotes: rest.productionNotes,
                status: PlanningStatus.ORDER_CREATED, // Updates status from DRAFT if needed
                contentStrategy: rest.contentStrategy,
                emotionalTone: rest.emotionalTone,
                contentPillars: rest.contentPillars,
            }
        })
        
        revalidatePath("/planificacion")
        return { success: true, orderId }
    } catch (error) {
        console.error("Error updating planning order:", error)
        return { error: "Failed to update planning order" }
    }
}

export async function getBusinessProducts(businessId: string) {
    return await prisma.product.findMany({
        where: { businessId },
        orderBy: { name: 'asc' }
    })
}

export async function createDraftPlanningOrder(businessId: string) {
    const business = await prisma.business.findUnique({
        where: { id: businessId },
    })

    if (!business || !business.createdById) {
        throw new Error("Business or Creator not found")
    }

    const count = await prisma.planningOrder.count({
        where: { businessId }
    })
    
    // Generate a simple code: PLAN-{Year}-{Count+1}
    const code = `PLAN-${new Date().getFullYear().toString().slice(-2)}${(count + 1).toString().padStart(3, '0')}`

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return await prisma.planningOrder.create({
        data: {
            businessId,
            createdByUserId: business.createdById,
            name: code,
            status: PlanningStatus.DRAFT,
            startDate: now,
            endDate: tomorrow,
            objective: PlanningObjective.GENERAR_AWARENESS,
            channelRules: {}, 
            assetSource: AssetSource.MIXED,
            frequencyBase: 1,
            priorityProductIds: [],
        }
    })
}
