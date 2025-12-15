import { z } from "zod"
// Redefine Enums locally to safely use in Client Components
export const PlanningObjective = {
  AUMENTAR_VENTAS: "AUMENTAR_VENTAS",
  GENERAR_AWARENESS: "GENERAR_AWARENESS",
  LANZAMIENTO_PRODUCTO: "LANZAMIENTO_PRODUCTO",
  FIDELIZACION_COMUNIDAD: "FIDELIZACION_COMUNIDAD",
  TRAFICO_WEB: "TRAFICO_WEB",
  EDUCACION_TUTORIALES: "EDUCACION_TUTORIALES",
  OTRO: "OTRO",
} as const

export type PlanningObjective = keyof typeof PlanningObjective

export const ResourceLevel = {
  BAJO: "BAJO",
  MEDIO: "MEDIO",
  ALTO: "ALTO",
} as const

export type ResourceLevel = keyof typeof ResourceLevel

export const ChannelType = {
  ORIGINAL_EXCLUSIVO: "ORIGINAL_EXCLUSIVO",
  REPOSTEO_CRUZADO: "REPOSTEO_CRUZADO",
  MIXTO: "MIXTO",
} as const

export type ChannelType = keyof typeof ChannelType

export const channelRuleSchema = z.object({
  frecuencia_adicional: z.number().default(0),
  tipo: z.nativeEnum(ChannelType).default(ChannelType.ORIGINAL_EXCLUSIVO),
})

export type ChannelRule = z.infer<typeof channelRuleSchema>

export const planningOrderSchema = z.object({
  name: z.string().min(1, "El nombre de la orden es obligatorio"),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  objective: z.nativeEnum(PlanningObjective),
  priorityProductIds: z.array(z.string()).default([]),
  additionalFocus: z.string().optional(),
  frequencyBase: z.number().min(0),
  channelRules: z.record(z.string(), channelRuleSchema),
  resourceLevel: z.nativeEnum(ResourceLevel),
  productionNotes: z.string().optional(),
})

export type PlanningOrderInput = z.infer<typeof planningOrderSchema>
