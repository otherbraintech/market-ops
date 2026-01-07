"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { type BaseConfigFormState } from "./BaseConfigForm"

const BaseConfigForm = dynamic(
    () => import("./BaseConfigForm").then((mod) => mod.BaseConfigForm),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Cargando formulario...</p>
                </div>
            </div>
        ),
    }
)

export function BaseConfigFormWrapper({ initialForm }: { initialForm: BaseConfigFormState }) {
    return <BaseConfigForm initialForm={initialForm} />
}
