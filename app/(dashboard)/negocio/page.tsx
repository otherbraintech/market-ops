
import { NegocioTable } from "./components/negocio-table"
import { getBusinesses } from "@/app/actions/business"
import { NegocioForm } from "./components/negocio-form"

export default async function NegocioPage() {
    const negocios = await getBusinesses()

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Negocios</h1>
                    <p className="text-sm text-muted-foreground">Gestiona y crea tus negocios</p>
                </div>
                <NegocioForm />
            </div>
            <NegocioTable negocios={negocios} />
        </div>
    )
}

