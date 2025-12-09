"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { createBusiness } from "@/app/actions/business"
import { useToast } from "@/hooks/use-toast"

const businessTypes = [
    { value: "MARCA_PERSONAL", label: "Marca Personal" },
    { value: "EMPRESA", label: "Empresa" },
    { value: "ECOMMERCE", label: "E-commerce" },
    { value: "AGENCIA", label: "Agencia" },
] as const

const formSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    type: z.enum(["MARCA_PERSONAL", "EMPRESA", "ECOMMERCE", "AGENCIA"]),
    imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
    description: z.string().optional(),
    goals: z.string().optional(),
    valueProposition: z.string().optional(),
})

// Componente para label con tooltip
function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span>{label}</span>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        <p className="text-sm">{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export function NegocioForm() {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "EMPRESA",
            imageUrl: "",
            description: "",
            goals: "",
            valueProposition: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await createBusiness(values)

        if (result.error) {
            toast({
                title: "Error",
                description: "No se pudo crear el negocio.",
            })
        } else {
            toast({
                title: "Éxito",
                description: "Negocio creado correctamente.",
            })
            setOpen(false)
            form.reset()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Crear Negocio</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Negocio</DialogTitle>
                    <DialogDescription>
                        Configura la identidad de tu negocio, objetivos y propuesta de valor.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Nombre y Tipo en la misma fila */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Negocio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Acme Corp" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <LabelWithTooltip
                                                label="Tipo de Negocio"
                                                tooltip="Marca Personal: Freelancers, influencers. Empresa: Compañías, PyMEs. E-commerce: Tiendas online. Agencia: Agencias de marketing o publicidad."
                                            />
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {businessTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* URL del Logo */}
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <LabelWithTooltip
                                            label="URL del Logo/Imagen"
                                            tooltip="Ingresa la URL directa de una imagen para el logo de tu negocio. Debe ser una URL pública accesible."
                                        />
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://ejemplo.com/logo.png" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Descripción */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <LabelWithTooltip
                                            label="Descripción del Servicio/Producto"
                                            tooltip="Breve resumen de la actividad principal de tu negocio, el sector en el que opera y tu público objetivo."
                                        />
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Software SaaS de gestión de inventarios para PyMEs de retail en Latam."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Objetivos */}
                        <FormField
                            control={form.control}
                            name="goals"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <LabelWithTooltip
                                            label="Objetivos Comerciales"
                                            tooltip="Define metas SMART (Específicas, Medibles, Alcanzables, Relevantes, Temporales). Incluye métricas como MRR, cantidad de clientes, tasa de conversión, etc."
                                        />
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Aumentar MRR 20% en Q1; Adquirir 50 clientes B2B."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Propuesta de Valor */}
                        <FormField
                            control={form.control}
                            name="valueProposition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <LabelWithTooltip
                                            label="Propuesta de Valor Única (PVU)"
                                            tooltip="Tu diferenciador único. Responde: ¿A quién ayudas? ¿Qué problema resuelves? ¿Cómo lo haces diferente a la competencia?"
                                        />
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Ayudamos a [cliente] a [resolver problema] con [solución única]."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Guardar Negocio
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}