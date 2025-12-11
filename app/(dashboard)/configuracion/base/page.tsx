"use client"

import * as React from "react"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const SOCIAL_CHANNEL_OPTIONS = [
  "instagram",
  "tiktok",
  "facebook"
]

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

export default function ConfiguracionBasePage() {
  const [form, setForm] = React.useState({
    // 1.1 Identidad del negocio (solo datos extra que usa la IA)
    years_in_market: "",
    country: "",
    city: "",
    coverage_area: "local" as "local" | "nacional" | "internacional",

    brand_tone: "profesional" as
      | "formal"
      | "juvenil"
      | "profesional"
      | "premium"
      | "divertido"
      | "cercano"
      | "motivador"
      | "serio"
      | "emocional"
      | "informal",
    brand_personality: "",
    brand_language_level: "medio" as "simple" | "medio" | "avanzado",
    allowed_emojis: true,
    forbidden_words: "",

    // 1.3 Público base
    target_age_range: "",
    target_gender: "mixto" as "hombre" | "mujer" | "mixto",
    target_location: "",
    main_pain_point: "",
    main_desire: "",
    main_objection: "",
    buying_motivation: "",

    // 1.4 Oferta base
    main_products: "", // texto libre por ahora
    average_ticket: "medio" as "bajo" | "medio" | "alto",
    purchase_frequency: "recurrente" as "ocasional" | "recurrente",

    // 1.5 Canales base
    active_channels: "instagram, tiktok", // comma separated
    main_channel: "instagram",

    // 1.6 Estilo visual base
    visual_style: "moderno" as "minimalista" | "moderno" | "elegante" | "colorido" | "oscuro",
    brand_colors: "", // por ahora lista de colores en texto
    image_style_reference: "",
  })

  const [brandPersonalityInput, setBrandPersonalityInput] = React.useState("")
  const [forbiddenWordsInput, setForbiddenWordsInput] = React.useState("")
  const [brandColorInput, setBrandColorInput] = React.useState("")
  const [ageMin, setAgeMin] = React.useState("")
  const [ageMax, setAgeMax] = React.useState("")

  const brandPersonalityTags = parseCommaList(form.brand_personality)
  const forbiddenWordsTags = parseCommaList(form.forbidden_words)
  const activeChannelsTags = parseCommaList(form.active_channels)
  const brandColorTags = parseCommaList(form.brand_colors)

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
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target
    setForm((f) => ({ ...f, [name]: checked }))
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
      const next = { ...f, [field]: nextParts.join(", ") }
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
      const next = { ...f, [field]: nextParts.join(", ") }
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: hook to server action to persist
    console.log("Configuración base:", form)
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
      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        {/* 1.1 Identidad del negocio (datos complementarios, no duplican Business) */}
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
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
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
                onChange={handleCheckboxChange}
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
                  handleTagInputKeyDown(e, "brand_personality", brandPersonalityInput, setBrandPersonalityInput)
                }
                placeholder="Escribe un rasgo y presiona Enter o coma para agregarlo"
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
                  handleTagInputKeyDown(e, "forbidden_words", forbiddenWordsInput, setForbiddenWordsInput)
                }
                placeholder="Escribe una palabra y presiona Enter o coma para agregarla"
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
                    const next = value && ageMax ? `${value}-${ageMax}` : value || ageMax ? `${value || ageMax}` : ""
                    setForm((f) => ({ ...f, target_age_range: next }))
                  }}
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
                    const next = ageMin && value ? `${ageMin}-${value}` : ageMin || value ? `${ageMin || value}` : ""
                    setForm((f) => ({ ...f, target_age_range: next }))
                  }}
                  placeholder="Ej. 40"
                />
              </div>
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="mixto">Mixto</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="target_location" className="text-sm font-medium">
                <LabelWithTooltip
                  label="Zona / ubicación"
                  tooltip="Zonas, ciudades o regiones clave donde se concentra tu audiencia."
                />
              </label>
              <Input
                id="target_location"
                name="target_location"
                value={form.target_location}
                onChange={handleChange}
                placeholder="Ej. Zona norte de la ciudad"
              />
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
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
              Selecciona las redes y canales donde la marca está activa. El primer canal se tomará como principal.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {SOCIAL_CHANNEL_OPTIONS.map((channel) => {
                const isActive = activeChannelsTags.includes(channel)
                return (
                  <label
                    key={channel}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border"
                      checked={isActive}
                      onChange={() => toggleChannel(channel)}
                    />
                    <span className="capitalize">{channel}</span>
                  </label>
                )
              })}
            </div>
          </div>
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
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
                    id="brand_colors"
                    name="brand_colors"
                    value={brandColorInput}
                    onChange={(e) => setBrandColorInput(e.target.value)}
                    onKeyDown={(e) =>
                      handleTagInputKeyDown(e, "brand_colors", brandColorInput, setBrandColorInput)
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Escribe un color HEX y presiona Enter (ej. #FF0000)"
                  />
                </div>
                {brandColorTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {brandColorTags.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        <span
                          className="h-3 w-3 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        {color}
                        <button
                          type="button"
                          onClick={() => removeTagFromField("brand_colors", color)}
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
          <div className="space-y-2">
            <label htmlFor="image_style_reference" className="text-sm font-medium">
              <LabelWithTooltip
                label="Referencia de estilo visual (opcional)"
                tooltip="Puedes describir o pegar referencias de estilo (links, descripciones) que la IA deba imitar."
              />
            </label>
            <textarea
              id="image_style_reference"
              name="image_style_reference"
              value={form.image_style_reference}
              onChange={handleChange}
              className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Describe o pega referencias de estilo visual que debe seguir la IA."
            />
          </div>
        </section>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Guardar configuración base
          </button>
        </div>
      </form>
    </div>
  )
}
