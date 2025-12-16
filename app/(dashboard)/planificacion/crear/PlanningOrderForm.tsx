"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, differenceInCalendarMonths } from "date-fns"
import { CalendarIcon, Loader2, Info } from "lucide-react"
import { DateRange } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { createPlanningOrder } from "@/app/actions/planning"
import { planningOrderSchema, type PlanningOrderInput, PlanningObjective, ResourceLevel, ChannelType } from "@/lib/schemas/planning"

interface Product {
    id: string
    name: string
}

interface PlanningOrderFormProps {
    products: Product[]
    availableChannels: string[] // e.g. ["instagram", "tiktok"]
}

const OBJECTIVE_LABELS: Record<PlanningObjective, string> = {
    AUMENTAR_VENTAS: "Aumentar Ventas",
    GENERAR_AWARENESS: "Generar Awareness (Reconocimiento)",
    LANZAMIENTO_PRODUCTO: "Lanzamiento de Producto",
    FIDELIZACION_COMUNIDAD: "Fidelización de Comunidad",
    TRAFICO_WEB: "Tráfico Web",
    EDUCACION_TUTORIALES: "Educación / Tutoriales",
    OTRO: "Otro",
}

const RESOURCE_LEVEL_LABELS: Record<ResourceLevel, string> = {
    BAJO: "Bajo (Fotos rápidas, poco video)",
    MEDIO: "Medio (Reels/Videos simples, Carruseles)",
    ALTO: "Alto (Producción profesional, animaciones)",
}

const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
    ORIGINAL_EXCLUSIVO: "Original Exclusivo",
    REPOSTEO_CRUZADO: "Reposteo Cruzado",
    MIXTO: "Mixto",
}

export function PlanningOrderForm({ products, availableChannels }: PlanningOrderFormProps) {
    const { toast } = useToast()
    const [isPending, startTransition] = React.useTransition()
    const [showExceptions, setShowExceptions] = React.useState(false)

    // Default values
    const defaultChannelRules: Record<string, { frecuencia_adicional: number; tipo: ChannelType }> = {}
    availableChannels.forEach((ch) => {
        defaultChannelRules[ch] = {
            frecuencia_adicional: 0,
            tipo: ChannelType.ORIGINAL_EXCLUSIVO,
        }
    })

    const form = useForm({
        resolver: zodResolver(planningOrderSchema),
        defaultValues: {
            name: "",
            objective: PlanningObjective.AUMENTAR_VENTAS as PlanningObjective,
            priorityProductIds: [],
            additionalFocus: "",
            frequencyBase: 1.0,
            channelRules: defaultChannelRules,
            resourceLevel: ResourceLevel.MEDIO as ResourceLevel,
            productionNotes: "",
        },
    })

    function onSubmit(data: PlanningOrderInput) {
        startTransition(async () => {
            const result = await createPlanningOrder(data)
            if (result.error) {
                toast({
                    title: "Error al crear la orden",
                    description: result.error,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Orden creada exitosamente",
                    description: "La planificación ha sido iniciada.",
                })
                // Redirect or reset? The action revalidates.
                // Maybe redirect to the list?
                // For now, just show toast.
            }
        })
    }

    // Helper for Date Range
    const dateRange = form.watch("dateRange")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* 1. Título y Contexto */}
                <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        1. Título y Contexto
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Orden</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Planificación Enero: Foco en Rebajas" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Replacement for old DatePicker */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="dateRange.from"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha Inicio</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: es })
                                                    ) : (
                                                        <span>Selecciona inicio</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    locale={es}
                                                    defaultMonth={field.value}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dateRange.to"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha Fin</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: es })
                                                    ) : (
                                                        <span>Selecciona fin</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        (form.getValues("dateRange.from") ? date < form.getValues("dateRange.from")! : false)
                                                    }
                                                    locale={es}
                                                    defaultMonth={field.value}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Excluded Dates Selection */}
                        {form.watch("dateRange.from") && form.watch("dateRange.to") && (
                            <div className="mt-4 border rounded-md p-4 bg-muted/20 space-y-4 md:col-span-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="enable-exceptions"
                                        checked={showExceptions}
                                        onCheckedChange={setShowExceptions}
                                    />
                                    <Label htmlFor="enable-exceptions" className="text-base font-semibold">
                                        Personalizar excepciones (feriados, días sin post)
                                    </Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Si no activas esto, la IA decidirá los mejores días por ti.
                                </p>

                                {showExceptions && (
                                    <FormField
                                        control={form.control}
                                        name="excludedDates"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormDescription>
                                                    Selecciona los días específicos dentro del rango en los que <strong>NO</strong> deseas publicar contenido.
                                                </FormDescription>
                                                <div className="mt-2 bg-card rounded-md border p-4">
                                                    <Calendar
                                                        mode="multiple"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        fromDate={form.watch("dateRange.from")}
                                                        toDate={form.watch("dateRange.to")}
                                                        disabled={(date) =>
                                                            date < form.watch("dateRange.from")! ||
                                                            date > form.watch("dateRange.to")!
                                                        }
                                                        defaultMonth={form.watch("dateRange.from")}
                                                        numberOfMonths={
                                                            form.watch("dateRange.from") && form.watch("dateRange.to")
                                                                ? Math.max(differenceInCalendarMonths(form.watch("dateRange.to")!, form.watch("dateRange.from")!) + 1, 1)
                                                                : 1
                                                        }
                                                        locale={es}
                                                        className="w-full"
                                                        style={{ "--cell-size": "28px" } as React.CSSProperties}
                                                        classNames={{
                                                            months: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10",
                                                            week: "grid grid-cols-7 gap-2 w-full mt-2",
                                                            weekdays: "grid grid-cols-7 gap-2 w-full",
                                                            weekday: "text-muted-foreground rounded-md font-normal text-[0.8rem] select-none w-full flex items-center justify-center",
                                                            today: "font-bold text-foreground"
                                                        }}
                                                    />
                                                </div>
                                                {field.value && field.value.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium mb-1">Días excluidos seleccionados:</p>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            {(() => {
                                                                const sorted = [...field.value].sort((a: Date, b: Date) => a.getTime() - b.getTime())
                                                                const grouped: Record<string, string[]> = {}
                                                                sorted.forEach((date) => {
                                                                    const monthKey = format(date, "MMMM yyyy", { locale: es })
                                                                    const capKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1)
                                                                    if (!grouped[capKey]) grouped[capKey] = []
                                                                    grouped[capKey].push(format(date, "d"))
                                                                })
                                                                return Object.entries(grouped).map(([month, days]) => (
                                                                    <div key={month}>
                                                                        <span className="font-semibold text-foreground/80">{month}:</span> {days.join(", ")}
                                                                    </div>
                                                                ))
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}
                        {/* End Replacement */}
                    </div>
                </div>

                {/* 2. Enfoque Estratégico */}
                <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        2. Enfoque Estratégico
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="objective"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objetivo Estratégico</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un objetivo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(OBJECTIVE_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="priorityProductIds"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Productos Prioritarios</FormLabel>
                                        <FormDescription>
                                            Selecciona los productos que quieres destacar en esta planificación.
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                                        {products.length === 0 && <p className="text-sm text-muted-foreground p-2">No hay productos registrados.</p>}
                                        {products.map((product) => (
                                            <FormField
                                                key={product.id}
                                                control={form.control}
                                                name="priorityProductIds"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={product.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(product.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), product.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value: string) => value !== product.id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {product.name}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="additionalFocus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Eje Temático Adicional (Opcional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ej. Destacar el uso de ingredientes orgánicos, o foco en sostenibilidad..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* 3. Canales y Frecuencia */}
                <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        3. Canales y Frecuencia
                    </h2>

                    <FormField
                        control={form.control}
                        name="frequencyBase"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Frecuencia Mínima Diaria (Global): {field.value}</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Slider
                                            min={0}
                                            max={5}
                                            step={0.5}
                                            defaultValue={[field.value]}
                                            onValueChange={(vals) => field.onChange(vals[0])}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-center font-mono border rounded p-1">{field.value}</span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="border rounded-md divide-y">
                        <div className="grid grid-cols-12 bg-muted/50 p-2 text-sm font-medium">
                            <div className="col-span-3">Canal</div>
                            <div className="col-span-3">Frecuencia Adicional (Not impl yet)</div>
                            <div className="col-span-6">Tipo de Contenido</div>
                        </div>
                        {availableChannels.length === 0 && <div className="p-4 text-sm text-center">No hay canales activos configurados.</div>}
                        {availableChannels.map((channel) => (
                            <div key={channel} className="grid grid-cols-12 p-4 items-center gap-4">
                                <div className="col-span-3 capitalize font-medium">{channel}</div>
                                <div className="col-span-3">
                                    <FormField
                                        control={form.control}
                                        name={`channelRules.${channel}.frecuencia_adicional`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                                            step={0.1}
                                                            className="h-8 w-20"
                                                        />
                                                        <span className="text-xs text-muted-foreground">/día</span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name={`channelRules.${channel}.tipo`}
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        {Object.entries(CHANNEL_TYPE_LABELS).map(([typeVal, label]) => (
                                                            <FormItem key={typeVal} className="flex items-center space-x-2 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value={typeVal} />
                                                                </FormControl>
                                                                <FormLabel className="font-normal text-xs cursor-pointer">
                                                                    {label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Restricciones Operacionales */}
                <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        4. Restricciones Operacionales
                    </h2>

                    <FormField
                        control={form.control}
                        name="resourceLevel"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Nivel de Recursos</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        {Object.entries(RESOURCE_LEVEL_LABELS).map(([val, label]) => (
                                            <FormItem key={val} className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={val} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer text-sm">
                                                    {label}
                                                </FormLabel>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="productionNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notas de Producción (Opcional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ej. Solo grabamos fines de semana, no tenemos dron..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isPending} size="lg">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creando Orden...
                            </>
                        ) : (
                            "Generar Plan de Ideas Base"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
