"use client"

import * as React from "react"
import { HelpCircle, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useBusiness } from "@/contexts/business-context"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { saveBusinessBaseConfig } from "@/app/actions/base-config"
import { useToast } from "@/hooks/use-toast"

const SOCIAL_CHANNEL_OPTIONS = ["instagram", "tiktok", "facebook"]

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
            <p className="text-sm leading-snug text-balance">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

function normalizeHex(value: string) {
  const trimmed = value.trim()
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
  const isValid = /^#?[0-9A-Fa-f]{6}$/.test(trimmed) || /^#[0-9A-Fa-f]{6}$/.test(withHash)
  if (!isValid) return null
  return withHash.toLowerCase()
}

export interface BaseConfigFormState {
  years_in_market: string
  country: string
  city: string
  coverage_area: "" | "local" | "nacional" | "internacional"
  brand_tone:
  | ""
  | "formal"
  | "juvenil"
  | "profesional"
  | "premium"
  | "divertido"
  | "cercano"
  | "motivador"
  | "serio"
  | "emocional"
  | "informal"
  brand_personality: string
  brand_language_level: "" | "simple" | "medio" | "avanzado"
  allowed_emojis: boolean
  forbidden_words: string
  target_age_range: string
  target_gender: "" | "hombre" | "mujer" | "mixto"

  main_pain_point: string
  main_desire: string
  main_objection: string
  buying_motivation: string
  main_products: string
  average_ticket: "" | "bajo" | "medio" | "alto"
  purchase_frequency: "" | "ocasional" | "recurrente"
  active_channels: string
  main_channel: string
  visual_style: "" | "minimalista" | "moderno" | "elegante" | "colorido" | "oscuro"
  brand_colors: string

}

export function BaseConfigForm({ initialForm }: { initialForm: BaseConfigFormState }) {
  const [form, setForm] = React.useState<BaseConfigFormState>(initialForm)

  const [brandPersonalityInput, setBrandPersonalityInput] = React.useState("")
  const [forbiddenWordsInput, setForbiddenWordsInput] = React.useState("")
  const brandColorPickerRef = React.useRef<HTMLInputElement | null>(null)
  const brandColorTextRef = React.useRef<HTMLInputElement | null>(null)
  const [editingBrandColor, setEditingBrandColor] = React.useState<string | null>(null)
  const [ageMin, setAgeMin] = React.useState("")
  const [ageMax, setAgeMax] = React.useState("")

  const brandPersonalityTags = parseCommaList(form.brand_personality)
  const forbiddenWordsTags = parseCommaList(form.forbidden_words)
  const activeChannelsTags = parseCommaList(form.active_channels)
  const brandColorTags = parseCommaList(form.brand_colors)

  function setBrandColorEditorValue(value: string) {
    const normalized = normalizeHex(value)
    if (!normalized) return
    if (brandColorPickerRef.current) {
      brandColorPickerRef.current.value = normalized
    }
    if (brandColorTextRef.current) {
      brandColorTextRef.current.value = normalized
    }
  }

  function beginEditBrandColor(color: string) {
    setEditingBrandColor(color)
    setBrandColorEditorValue(color)
  }

  function cancelEditBrandColor() {
    setEditingBrandColor(null)
  }

  function upsertBrandColor(candidate: string) {
    const normalized = normalizeHex(candidate)
    if (!normalized) return

    if (editingBrandColor) {
      const from = editingBrandColor
      setForm((f) => {
        const parts = parseCommaList(f.brand_colors)
        const replaced = parts.map((p) => (p === from ? normalized : p))
        const deduped = replaced.filter((p, idx) => replaced.indexOf(p) === idx)
        return { ...f, brand_colors: deduped.join(", ") }
      })
      setEditingBrandColor(null)
      setBrandColorEditorValue(normalized)
      return
    }

    addTagToField("brand_colors", normalized)
    setBrandColorEditorValue(normalized)
  }

  function addBrandColorFromPicker() {
    const textValue = brandColorTextRef.current?.value?.trim()
    const pickerValue = brandColorPickerRef.current?.value?.trim()
    const candidate = textValue ? textValue : pickerValue
    if (!candidate) return
    upsertBrandColor(candidate)
  }

  function syncBrandColorText(value: string) {
    const next = value.toLowerCase()
    if (brandColorTextRef.current) {
      brandColorTextRef.current.value = next
    }
  }

  React.useEffect(() => {
    if (!form.target_age_range) {
      setAgeMin("")
      setAgeMax("")
      return
    }
    const [min, max] = form.target_age_range.split("-").map((v) => v.trim())
    setAgeMin(min || "")
    setAgeMax(max || "")
  }, [form.target_age_range])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  function addTagToField(
    field: "brand_personality" | "forbidden_words" | "active_channels" | "brand_colors",
    rawTag: string
  ) {
    const tag = field === "brand_colors" ? normalizeHex(rawTag) : rawTag.trim()
    if (!tag) return
    setForm((f) => {
      const current = (f[field] as string) || ""
      const parts = parseCommaList(current)
      if (parts.includes(tag)) return f
      const nextParts = [...parts, tag]
      const next: BaseConfigFormState = { ...f, [field]: nextParts.join(", ") }
      if (field === "active_channels" && nextParts.length > 0) {
        if (!next.main_channel || !nextParts.includes(next.main_channel)) {
          next.main_channel = nextParts[0]
        }
      }
      return next
    })
  }

  function removeTagFromField(
    field: "brand_personality" | "forbidden_words" | "active_channels" | "brand_colors",
    tag: string
  ) {
    setForm((f) => {
      const current = (f[field] as string) || ""
      const parts = parseCommaList(current)
      const nextParts = parts.filter((p) => p !== tag)
      const next: BaseConfigFormState = { ...f, [field]: nextParts.join(", ") }
      if (field === "active_channels") {
        if (nextParts.length === 0) {
          next.main_channel = ""
        } else if (!nextParts.includes(next.main_channel)) {
          next.main_channel = nextParts[0]
        }
      }
      return next
    })
  }

  function handleTagInputKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "brand_personality" | "forbidden_words" | "brand_colors",
    inputValue: string,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (!inputValue.trim()) return
      addTagToField(field, inputValue)
      setInput("")
    }
  }

  function toggleChannel(channel: string) {
    const exists = activeChannelsTags.includes(channel)
    if (exists) {
      removeTagFromField("active_channels", channel)
    } else {
      addTagToField("active_channels", channel)
    }
  }

  const [isPending, startTransition] = React.useTransition()
  const { toast } = useToast()

  function handleAction(formData: FormData) {
    startTransition(async () => {
      const result = await saveBusinessBaseConfig(formData)
      if (result.error) {
        toast({
          title: "Error al guardar",
          description: "Hubo un problema al guardar la configuración. Intenta nuevamente.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Configuración guardada",
          description: "Los cambios se han guardado correctamente.",
        })
      }
    })
  }

  const { isBusinessSwitching } = useBusiness()

  if (isBusinessSwitching) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Cargando información del negocio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Configuración base</h1>
          <p className="text-sm text-muted-foreground">
            Define parámetros estándar de marca para la planificación de contenido.
          </p>
        </div>
      </div>
      <form action={handleAction} className="space-y-8 max-w-3xl">
        {/* Sections... */}

        {/* 1.1 Identidad del negocio */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Identidad del negocio
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="years_in_market" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Años en el mercado"
                  tooltip="Cuánto tiempo llevas operando con este negocio o marca."
                />
              </label>
              <Input
                id="years_in_market"
                name="years_in_market"
                type="number"
                min={0}
                value={form.years_in_market}
                onChange={handleChange}
                placeholder="Ej. 3"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">
                <LabelWithTooltip
                  label="País"
                  tooltip="País principal donde opera el negocio."
                />
              </label>
              <Input
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Ej. México"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Ciudad"
                  tooltip="Ciudad principal de operación o sede."
                />
              </label>
              <Input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ej. Ciudad de México"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="coverage_area" className="text-sm font-medium">
              <LabelWithTooltip
                label="Alcance"
                tooltip="Nivel de alcance actual de tu negocio: local, nacional o internacional."
              />
            </label>
            <select
              id="coverage_area"
              name="coverage_area"
              value={form.coverage_area}
              onChange={handleChange}
              disabled={isPending}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">
                Selecciona alcance
              </option>
              <option value="local">Local</option>
              <option value="nacional">Nacional</option>
              <option value="internacional">Internacional</option>
            </select>
          </div>
        </section>

        {/* 1.2 Marca y comunicación */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Marca y comunicación
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="brand_tone" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Tono de marca"
                  tooltip="Cómo quieres que suene tu comunicación: más formal, cercana, divertida, motivadora, etc."
                />
              </label>
              <select
                id="brand_tone"
                name="brand_tone"
                value={form.brand_tone}
                onChange={handleChange}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Selecciona tono
                </option>
                <option value="formal">Formal</option>
                <option value="juvenil">Juvenil</option>
                <option value="profesional">Profesional</option>
                <option value="premium">Premium</option>
                <option value="divertido">Divertido</option>
                <option value="cercano">Cercano</option>
                <option value="motivador">Motivador</option>
                <option value="serio">Serio</option>
                <option value="emocional">Emocional</option>
                <option value="informal">Informal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="brand_language_level" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Nivel de lenguaje"
                  tooltip="Qué tan técnico o sencillo debe ser el lenguaje de la comunicación."
                />
              </label>
              <select
                id="brand_language_level"
                name="brand_language_level"
                value={form.brand_language_level}
                onChange={handleChange}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Selecciona nivel
                </option>
                <option value="simple">Simple</option>
                <option value="medio">Medio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="allowed_emojis"
                name="allowed_emojis"
                type="checkbox"
                checked={form.allowed_emojis}
                onChange={handleChange}
                disabled={isPending}
                className="h-4 w-4 rounded border"
              />
              <label htmlFor="allowed_emojis" className="text-sm">
                Permitir emojis en el copy
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="brand_personality" className="text-sm font-medium">
              <LabelWithTooltip
                label="Personalidad de marca"
                tooltip="Palabras clave que describen la personalidad de tu marca. Usa varias, como si fueran etiquetas."
              />
            </label>
            <div className="space-y-2">
              <Input
                id="brand_personality"
                name="brand_personality"
                value={brandPersonalityInput}
                onChange={(e) => setBrandPersonalityInput(e.target.value)}
                onKeyDown={(e) =>
                  handleTagInputKeyDown(
                    e,
                    "brand_personality",
                    brandPersonalityInput,
                    setBrandPersonalityInput,
                  )
                }
                disabled={isPending}
                placeholder="Escribe un rasgo y presiona Enter o coma para agregarlo"
              />
              <input
                type="hidden"
                name="brand_personality_hidden"
                value={form.brand_personality}
              />
              {brandPersonalityTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {brandPersonalityTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTagFromField("brand_personality", tag)}
                        disabled={isPending}
                        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[10px] text-muted-foreground hover:bg-foreground/20"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="forbidden_words" className="text-sm font-medium">
              <LabelWithTooltip
                label="Palabras prohibidas"
                tooltip="Palabras, expresiones o conceptos que no quieres que la IA utilice nunca."
              />
            </label>
            <div className="space-y-2">
              <Input
                id="forbidden_words"
                name="forbidden_words"
                value={forbiddenWordsInput}
                onChange={(e) => setForbiddenWordsInput(e.target.value)}
                onKeyDown={(e) =>
                  handleTagInputKeyDown(
                    e,
                    "forbidden_words",
                    forbiddenWordsInput,
                    setForbiddenWordsInput,
                  )
                }
                disabled={isPending}
                placeholder="Escribe una palabra y presiona Enter o coma para agregarla"
              />
              <input
                type="hidden"
                name="forbidden_words_hidden"
                value={form.forbidden_words}
              />
              {forbiddenWordsTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {forbiddenWordsTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTagFromField("forbidden_words", tag)}
                        disabled={isPending}
                        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive/20 text-[10px] hover:bg-destructive/30"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 1.3 Público base */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Público base
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="target_age_range_min" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Rango de edad"
                  tooltip="Define una edad mínima y máxima aproximada de tu público objetivo."
                />
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="target_age_range_min"
                  type="number"
                  min={0}
                  value={ageMin}
                  onChange={(e) => {
                    const value = e.target.value
                    setAgeMin(value)
                    const next =
                      value && ageMax
                        ? `${value}-${ageMax}`
                        : value || ageMax
                          ? `${value || ageMax}`
                          : ""
                    setForm((f) => ({ ...f, target_age_range: next }))
                  }}
                  disabled={isPending}
                  placeholder="Ej. 25"
                />
                <span className="text-xs text-muted-foreground">a</span>
                <Input
                  id="target_age_range_max"
                  type="number"
                  min={0}
                  value={ageMax}
                  onChange={(e) => {
                    const value = e.target.value
                    setAgeMax(value)
                    const next =
                      ageMin && value
                        ? `${ageMin}-${value}`
                        : ageMin || value
                          ? `${ageMin || value}`
                          : ""
                    setForm((f) => ({ ...f, target_age_range: next }))
                  }}
                  disabled={isPending}
                  placeholder="Ej. 40"
                />
              </div>
              <input type="hidden" name="target_age_range" value={form.target_age_range} />
            </div>
            <div className="space-y-2">
              <label htmlFor="target_gender" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Género principal"
                  tooltip="Si tu comunicación está más dirigida a un género específico o es mixta."
                />
              </label>
              <select
                id="target_gender"
                name="target_gender"
                value={form.target_gender}
                onChange={handleChange}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Selecciona género
                </option>
                <option value="mixto">Mixto</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>

          </div>
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Insights del cliente
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="main_pain_point" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Dolor principal"
                  tooltip="Problema o frustración más importante que resuelves para tu cliente ideal."
                />
              </label>
              <Textarea
                id="main_pain_point"
                name="main_pain_point"
                value={form.main_pain_point}
                onChange={handleChange}
                disabled={isPending}
                placeholder="Ej. No sabe cómo conseguir clientes constantes."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="main_desire" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Deseo principal"
                  tooltip="Resultado positivo que tu cliente quiere conseguir gracias a tu oferta."
                />
              </label>
              <Textarea
                id="main_desire"
                name="main_desire"
                value={form.main_desire}
                onChange={handleChange}
                disabled={isPending}
                placeholder="Ej. Quiere aumentar sus ventas online mes a mes."
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="main_objection" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Objeción principal"
                  tooltip="Razón más común por la que un potencial cliente duda o no compra."
                />
              </label>
              <Textarea
                id="main_objection"
                name="main_objection"
                value={form.main_objection}
                onChange={handleChange}
                disabled={isPending}
                placeholder="Ej. Cree que el servicio es muy caro o que no funcionará."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="buying_motivation" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Motivación de compra"
                  tooltip="Disparadores y motivaciones que impulsan al cliente a tomar la decisión de compra."
                />
              </label>
              <Textarea
                id="buying_motivation"
                name="buying_motivation"
                value={form.buying_motivation}
                onChange={handleChange}
                disabled={isPending}
                placeholder="Ej. Quiere ahorrar tiempo, dinero o mejorar su imagen profesional."
              />
            </div>
          </div>
        </section>

        {/* 1.4 Oferta base */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Oferta base
          </h2>
          <div className="space-y-2">
            <label htmlFor="main_products" className="text-sm font-medium">
              <LabelWithTooltip
                label="Productos/servicios principales"
                tooltip="Describe tus productos o servicios clave y su importancia relativa."
              />
            </label>
            <Textarea
              id="main_products"
              name="main_products"
              value={form.main_products}
              onChange={handleChange}
              disabled={isPending}
              placeholder="Describe brevemente los productos clave y su prioridad."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="average_ticket" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Ticket promedio"
                  tooltip="Valor promedio que suele pagar un cliente por compra."
                />
              </label>
              <select
                id="average_ticket"
                name="average_ticket"
                value={form.average_ticket}
                onChange={handleChange}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Selecciona ticket
                </option>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="purchase_frequency" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Frecuencia de compra"
                  tooltip="Cada cuánto suelen comprarte los clientes (ocasional, recurrente, etc.)."
                />
              </label>
              <select
                id="purchase_frequency"
                name="purchase_frequency"
                value={form.purchase_frequency}
                onChange={handleChange}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Selecciona frecuencia
                </option>
                <option value="ocasional">Ocasional</option>
                <option value="recurrente">Recurrente</option>
              </select>
            </div>
          </div>
        </section>

        {/* 1.5 Canales base */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Canales base
          </h2>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selecciona las redes y canales donde la marca está activa. El primer canal se tomará como
              principal.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {SOCIAL_CHANNEL_OPTIONS.map((channel) => {
                const isActive = activeChannelsTags.includes(channel)
                return (
                  <label
                    key={channel}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border"
                      checked={isActive}
                      onChange={() => toggleChannel(channel)}
                      disabled={isPending}
                    />
                    <span className="capitalize">{channel}</span>
                  </label>
                )
              })}
            </div>
          </div>
          <input type="hidden" name="active_channels_hidden" value={form.active_channels} />
          <input type="hidden" name="main_channel" value={form.main_channel} />
        </section>

        {/* 1.6 Estilo visual base */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Estilo visual base
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="visual_style" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Estilo visual"
                  tooltip="Estilo general de la marca en piezas gráficas: minimalista, moderno, elegante, retro, etc."
                />
              </label>
              <select
                id="visual_style"
                name="visual_style"
                value={form.visual_style}
                onChange={handleChange}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Selecciona estilo
                </option>
                <option value="minimalista">Minimalista</option>
                <option value="moderno">Moderno</option>
                <option value="elegante">Elegante</option>
                <option value="colorido">Colorido</option>
                <option value="oscuro">Oscuro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="brand_colors" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Colores de marca"
                  tooltip="Agrega uno o varios colores principales de la marca en formato HEX (por ejemplo #FF0000)."
                />
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    ref={brandColorPickerRef}
                    defaultValue="#000000"
                    onInput={(e) => {
                      const value = (e.target as HTMLInputElement).value
                      syncBrandColorText(value)
                    }}
                    className="h-9 w-9 rounded-md border bg-background p-1"
                    aria-label="Seleccionar color"
                    disabled={isPending}
                  />
                  <input
                    id="brand_colors"
                    name="brand_colors"
                    ref={brandColorTextRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        const value = (e.currentTarget as HTMLInputElement).value
                        if (!value.trim()) return
                        upsertBrandColor(value)
                      }
                    }}
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Escribe un color HEX y presiona Enter (ej. #FF0000)"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={addBrandColorFromPicker}
                    disabled={isPending}
                    className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
                  >
                    {editingBrandColor ? "Actualizar" : "Agregar"}
                  </button>
                </div>
                <input type="hidden" name="brand_colors_hidden" value={form.brand_colors} />
                {editingBrandColor && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Editando: {editingBrandColor}</span>
                    <button
                      type="button"
                      onClick={cancelEditBrandColor}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {brandColorTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {brandColorTags.map((color) => (
                      <span
                        key={color}
                        onClick={() => beginEditBrandColor(color)}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${editingBrandColor === color
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                          }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        {color}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeTagFromField("brand_colors", color)
                          }}
                          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[10px] hover:bg-foreground/20"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </section>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Guardando..." : "Guardar configuración base"}
          </button>
        </div>
      </form>
    </div>
  )
}
