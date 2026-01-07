import { cookies } from "next/headers"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PlanningStatus } from "@prisma/client"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PlanningList } from "./PlanningList"
import { CreatePlanningButton } from "./CreatePlanningButton"

export default async function PlanningListPage() {
    const cookieStore = await cookies()
    const businessId = cookieStore.get("activeBusinessId")?.value

    if (!businessId) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Selecciona un negocio para ver sus planificaciones.</p>
            </div>
        )
    }

    const orders = await prisma.planningOrder.findMany({
        where: {
            businessId,
            status: { not: PlanningStatus.DELETED }
        },
        orderBy: { createdAt: "desc" },
    })

    // We need to serialize dates/decimals for Client Components if Prisma returns them as objects
    // But standard Prisma Date objects are fine in Server Components -> Client props usually if simplistic.
    // Although sometimes passing Date objects to client components warns in Next.js.
    // PlanningList takes `any` for now, but safer to serialize or ensure PlanningList handles Dates strings if passed as JSON.
    // For now let's pass directly, Next.js 15+ is better at this, but usually we need to convert to clean POJOs.

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mis Planificaciones</h2>
                    <p className="text-muted-foreground">
                        Gestiona tus órdenes de contenido y revisa el estado de tus estrategias.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <CreatePlanningButton businessId={businessId} />
                </div>
            </div>

            <PlanningList orders={orders} />
        </div>
    )
}
