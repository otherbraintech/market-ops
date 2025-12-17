"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, differenceInCalendarMonths } from "date-fns"
import {
    CalendarIcon,
    Loader2,
    Info,
    Sparkles,
    Target,
    BarChart3,
    Zap,
    Lightbulb,
    Users
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { createPlanningOrder, updatePlanningOrder } from "@/app/actions/planning"
import {
    planningOrderSchema,
    type PlanningOrderInput,
    PlanningObjective,
    AssetSource,
    ContentStrategy,
    EmotionalTone,
    ContentPillar
} from "@/lib/schemas/planning"

interface Product {
    id: string
    name: string
}

interface BusinessConfig {
    id: string
    name: string
    tone: string
    channels: string[]
    buyerPersona: {
        ageRange: string
        pains: string[]
        desires: string[]
    }
}

interface PlanningOrderFormProps {
    products: Product[]
    businessConfig?: BusinessConfig
    orderId?: string
    initialData?: Partial<PlanningOrderInput>
}

// Constantes para UI
const OBJECTIVE_CONFIG: Record<PlanningObjective, { label: string; description: string }> = {
    AUMENTAR_VENTAS: {
        label: "Aumentar Ventas",
        description: "Contenido enfocado en conversión directa"
    },
    GENERAR_AWARENESS: {
        label: "Dar a Conocer la Marca",
        description: "Contenido viral y de alto alcance"
    },
    LANZAMIENTO_PRODUCTO: {
        label: "Lanzar Producto",
        description: "Contenido educativo y de expectativa"
    },
    FIDELIZACION_COMUNIDAD: {
        label: "Fidelizar Comunidad",
        description: "Contenido de valor para clientes actuales"
    },
    TRAFICO_WEB: {
        label: "Llevar Tráfico al Sitio",
        description: "Contenido con llamado claro a visitar web"
    },
    EDUCACION_TUTORIALES: {
        label: "Educar Audiencia",
        description: "Tutoriales, tips, cómo-usar"
    },
    OTRO: {
        label: "Otro",
        description: "Objetivo personalizado"
    }
}

const STRATEGY_CONFIG: Record<ContentStrategy, { label: string; shortDesc: string }> = {
    PROBLEM_SOLUTION: { label: "Problema → Solución", shortDesc: "Identificar dolor y presentar solución" },
    SOCIAL_PROOF: { label: "Prueba Social", shortDesc: "Testimonios y casos de éxito" },
    EDUCATIONAL: { label: "Educacional", shortDesc: "Tutoriales y tips" },
    BEHIND_SCENES: { label: "Detrás de Escenas", shortDesc: "Proceso y equipo" },
    ENTERTAINMENT: { label: "Entretenimiento", shortDesc: "Trends y contenido viral" },
    URGENCY_SCARCITY: { label: "Urgencia/Escasez", shortDesc: "Ofertas por tiempo limitado" }
}

const TONE_CONFIG: Record<EmotionalTone, string> = {
    INSPIRATIONAL: "Inspiracional",
    URGENT: "Urgente",
    EDUCATIONAL: "Educativo",
    PLAYFUL: "Divertido",
    AUTHORITATIVE: "Autoritativo",
    EMPATHETIC: "Empático"
}

const PILLAR_CONFIG: Record<ContentPillar, string> = {
    QUALITY: "Calidad",
    INNOVATION: "Innovación",
    SUSTAINABILITY: "Sostenibilidad",
    COMMUNITY: "Comunidad",
    EDUCATION: "Educación",
    PROMOTION: "Promoción",
    STORYTELLING: "Storytelling"
}

export function EnhancedPlanningOrderForm({ products, businessConfig }: PlanningOrderFormProps) {
    const { toast } = useToast()
    const [isPending, startTransition] = React.useTransition()
    const [showExceptions, setShowExceptions] = React.useState(false)

    // Configuración inicial de channelRules (vacía para que la IA decida)
    const defaultChannelRules: Record<string, { formats: any[] }> = {}
    businessConfig?.channels.forEach(ch => {
        defaultChannelRules[ch] = { formats: [] }
    })

    const form = useForm<PlanningOrderInput>({
        resolver: zodResolver(planningOrderSchema),
        defaultValues: {
            name: "",
            objective: PlanningObjective.AUMENTAR_VENTAS,
            priorityProductIds: [],
            additionalFocus: "",
            references: "",
            frequencyBase: 1.0,
            channelRules: defaultChannelRules,
            assetSource: AssetSource.MIXED,
            productionNotes: "",
            // Valores por defecto de los nuevos campos
            contentStrategy: ContentStrategy.PROBLEM_SOLUTION,
            contentPillars: [ContentPillar.QUALITY],
            emotionalTone: EmotionalTone.INSPIRATIONAL,
            customObjective: "",
            focusOnBuyerPains: true,
            useCompetitorInsights: true,
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
                    title: "✅ Orden de planificación creada",
                    description: "La IA está generando las ideas estratégicas.",
                })
            }
        })
    }

    return (
        <div className="space-y-8">
            {/* Header con contexto del negocio */}
            {businessConfig && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Configuración base activa</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{businessConfig.buyerPersona.ageRange}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {businessConfig.channels.map(ch => (
                                            <Badge key={ch} variant="secondary" className="text-xs">
                                                {ch}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline">{businessConfig.name}</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* SECCIÓN 1: Información Básica */}
                    <div className="space-y-6 rounded-lg border p-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            1. Período y Objetivo
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de la campaña *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Plan Q1 - Campaña de Verano" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateRange.from"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Fecha inicio *</FormLabel>
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
                                                            <span>Seleccionar fecha</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date < new Date()}
                                                        locale={es}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="objective"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Objetivo principal *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un objetivo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(OBJECTIVE_CONFIG).map(([key, config]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <div>
                                                                <div className="font-medium">{config.label}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {config.description}
                                                                </div>
                                                            </div>
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
                                    name="dateRange.to"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Fecha fin *</FormLabel>
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
                                                            <span>Seleccionar fecha</span>
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
                                                            (form.getValues("dateRange.from") ? date <= form.getValues("dateRange.from")! : false)
                                                        }
                                                        locale={es}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: Estrategia de Contenido */}
                    <div className="space-y-6 rounded-lg border p-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            2. Estrategia y Enfoque
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="contentStrategy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estrategia narrativa</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona estrategia" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(STRATEGY_CONFIG).map(([key, config]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <div>
                                                                <div className="font-medium">{config.label}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {config.shortDesc}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Estructura principal para el contenido
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="emotionalTone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tono emocional</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona tono" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(TONE_CONFIG).map(([key, label]) => (
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
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="frequencyBase"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Publicaciones por día</FormLabel>
                                                <Badge variant="outline">{field.value}</Badge>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    min={0.5}
                                                    max={3}
                                                    step={0.5}
                                                    defaultValue={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="mt-2"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Promedio diario distribuido entre canales
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="focusOnBuyerPains"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Enfocar en dolores del cliente</FormLabel>
                                                    <FormDescription className="text-xs">
                                                        Contenido que resuelva problemas específicos
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="useCompetitorInsights"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Usar insights competitivos</FormLabel>
                                                    <FormDescription className="text-xs">
                                                        Diferenciarse de la competencia
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pilares Temáticos */}
                        <FormField
                            control={form.control}
                            name="contentPillars"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pilares temáticos *</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                        {Object.entries(PILLAR_CONFIG).map(([key, label]) => (
                                            <div
                                                key={key}
                                                className={cn(
                                                    "flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors",
                                                    field.value?.includes(key as ContentPillar)
                                                        ? "border-primary bg-primary/10"
                                                        : "border-gray-200 hover:bg-gray-50"
                                                )}
                                                onClick={() => {
                                                    const current = field.value || []
                                                    if (current.includes(key as ContentPillar)) {
                                                        field.onChange(current.filter(v => v !== key))
                                                    } else {
                                                        field.onChange([...current, key as ContentPillar])
                                                    }
                                                }}
                                            >
                                                <Checkbox
                                                    checked={field.value?.includes(key as ContentPillar)}
                                                    onCheckedChange={() => { }}
                                                />
                                                <Label className="cursor-pointer text-sm">{label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <FormDescription>
                                        Selecciona los temas principales para esta campaña
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* SECCIÓN 3: Productos y Material */}
                    <div className="space-y-6 rounded-lg border p-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            3. Productos y Material
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="priorityProductIds"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Productos a destacar</FormLabel>
                                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                                                {products.map((product) => (
                                                    <FormField
                                                        key={product.id}
                                                        control={form.control}
                                                        name="priorityProductIds"
                                                        render={({ field }) => (
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`product-${product.id}`}
                                                                    checked={field.value?.includes(product.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            field.onChange([...(field.value || []), product.id])
                                                                        } else {
                                                                            field.onChange(
                                                                                field.value?.filter((value: string) => value !== product.id)
                                                                            )
                                                                        }
                                                                    }}
                                                                />
                                                                <Label htmlFor={`product-${product.id}`} className="cursor-pointer">
                                                                    {product.name}
                                                                </Label>
                                                            </div>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <FormDescription>
                                                Si no seleccionas ninguno, la IA cubrirá todos los productos
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="assetSource"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fuente de material visual</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona fuente" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={AssetSource.CLIENT_PROVIDED}>
                                                        Tengo fotos/videos propios
                                                    </SelectItem>
                                                    <SelectItem value={AssetSource.AI_GENERATED}>
                                                        Usar Stock o IA (no tengo material)
                                                    </SelectItem>
                                                    <SelectItem value={AssetSource.MIXED}>
                                                        Mezclar (tengo algo, complementar)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.watch("objective") === PlanningObjective.OTRO && (
                                    <FormField
                                        control={form.control}
                                        name="customObjective"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Objetivo personalizado</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Describe tu objetivo específico..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="references"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Referencias e inspiración</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Links a posts, perfiles, carpetas..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Opcional</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="productionNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notas de producción</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Restricciones, horarios, equipamiento..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Opcional</FormDescription>
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
                                    <FormLabel>Eje temático adicional</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Sostenibilidad, innovación local, etc."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Opcional - Para enfatizar un tema específico</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* SECCIÓN 4: Excepciones */}
                    {form.watch("dateRange")?.from && form.watch("dateRange")?.to && (
                        <div className="space-y-6 rounded-lg border p-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                4. Personalización del Calendario
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="enable-exceptions"
                                        checked={showExceptions}
                                        onCheckedChange={setShowExceptions}
                                    />
                                    <Label htmlFor="enable-exceptions" className="text-base">
                                        Definir días sin publicación
                                    </Label>
                                </div>

                                {showExceptions && (
                                    <FormField
                                        control={form.control}
                                        name="excludedDates"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormDescription>
                                                    Selecciona los días específicos donde NO deseas publicar contenido.
                                                </FormDescription>
                                                <div className="mt-4 border rounded-lg p-4">
                                                    <Calendar
                                                        mode="multiple"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        fromDate={form.watch("dateRange.from")}
                                                        toDate={form.watch("dateRange.to")}
                                                        disabled={(date) =>
                                                            !form.watch("dateRange.from") ||
                                                            !form.watch("dateRange.to") ||
                                                            date < form.watch("dateRange.from")! ||
                                                            date > form.watch("dateRange.to")!
                                                        }
                                                        defaultMonth={form.watch("dateRange.from")}
                                                        numberOfMonths={Math.min(
                                                            differenceInCalendarMonths(
                                                                form.watch("dateRange.to")!,
                                                                form.watch("dateRange.from")!
                                                            ) + 1,
                                                            3
                                                        )}
                                                        locale={es}
                                                    />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* BOTÓN SUBMIT */}
                    <div className="flex justify-end pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={isPending}
                            size="lg"
                            className="gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generando planificación...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generar Plan de Ideas Base con IA
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}