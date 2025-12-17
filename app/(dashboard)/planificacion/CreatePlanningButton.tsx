"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createDraftPlanningOrder } from "@/app/actions/planning"
import { toast } from "sonner"

interface CreatePlanningButtonProps {
    businessId: string
}

export function CreatePlanningButton({ businessId }: CreatePlanningButtonProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleCreate = () => {
        startTransition(async () => {
            try {
                const order = await createDraftPlanningOrder(businessId)
                toast.success("Borrador creado", {
                    description: `Orden ${order.name} iniciada.`
                })
                // Redirect to the edit page for this new order
                router.push(`/planificacion/${order.id}`)
            } catch (error) {
                console.error(error)
                toast.error("Error al crear la orden")
            }
        })
    }

    return (
        <Button onClick={handleCreate} size="lg" className="gap-2" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Nueva Orden
        </Button>
    )
}
