import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { PlanningOrderForm } from "./PlanningOrderForm"

export default async function CrearPlanificacionPage() {
    const cookieStore = await cookies()
    const businessId = cookieStore.get("activeBusinessId")?.value

    if (!businessId) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <p className="text-muted-foreground">Por favor, selecciona un negocio para continuar.</p>
            </div>
        )
    }

    const [baseConfig, products] = await Promise.all([
        prisma.businessBaseConfig.findUnique({
            where: { businessId },
            select: { activeChannels: true },
        }),
        prisma.product.findMany({
            where: { businessId },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ])

    const activeChannels = baseConfig?.activeChannels
        ? baseConfig.activeChannels.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
        : []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Nueva Orden de Planificación</h2>
                    <p className="text-muted-foreground">
                        Define el objetivo, fechas y recursos para generar una estrategia de contenido con IA.
                    </p>
                </div>
            </div>
            <div className="border-t pt-4">
                <PlanningOrderForm products={products} availableChannels={activeChannels} />
            </div>
        </div>
    )
}
