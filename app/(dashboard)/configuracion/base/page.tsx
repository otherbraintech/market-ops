"use client"

import * as React from "react"

export default function ConfiguracionBasePage() {
  const [form, setForm] = React.useState({
    // 1.1 Identidad del negocio
    business_name: "",
    business_description: "",
    business_category: "",
    business_subcategory: "",
    years_in_market: "",
    country: "",
    city: "",
    coverage_area: "local" as "local" | "nacional" | "internacional",

    // 1.2 Marca y comunicación
    brand_tone: "profesional" as "formal" | "juvenil" | "profesional" | "premium" | "divertido",
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
        {/* 1.1 Identidad del negocio */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Identidad del negocio
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="business_name" className="text-sm font-medium">
                Nombre del negocio
              </label>
              <input
                id="business_name"
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Ej. Studio XYZ"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="business_category" className="text-sm font-medium">
                Categoría
              </label>
              <input
                id="business_category"
                name="business_category"
                value={form.business_category}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Ej. Marketing, e-commerce, servicios profesionales"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="business_description" className="text-sm font-medium">
              Descripción del negocio
            </label>
            <textarea
              id="business_description"
              name="business_description"
              value={form.business_description}
              onChange={handleChange}
              className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Qué ofrece, a quién y cómo."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="years_in_market" className="text-sm font-medium">
                Años en el mercado
              </label>
              <input
                id="years_in_market"
                name="years_in_market"
                type="number"
                min={0}
                value={form.years_in_market}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">
                País
              </label>
              <input
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                Ciudad
              </label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="coverage_area" className="text-sm font-medium">
              Alcance
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
                Tono de marca
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
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="brand_language_level" className="text-sm font-medium">
                Nivel de lenguaje
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
              Personalidad de marca
            </label>
            <input
              id="brand_personality"
              name="brand_personality"
              value={form.brand_personality}
              onChange={handleChange}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Ej. cercana, experta, rebelde"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="forbidden_words" className="text-sm font-medium">
              Palabras prohibidas
            </label>
            <textarea
              id="forbidden_words"
              name="forbidden_words"
              value={form.forbidden_words}
              onChange={handleChange}
              className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Lista de términos que no se deben usar (separados por coma)"
            />
          </div>
        </section>

        {/* 1.3 Público base */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Público base
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="target_age_range" className="text-sm font-medium">
                Rango de edad
              </label>
              <input
                id="target_age_range"
                name="target_age_range"
                value={form.target_age_range}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Ej. 25-40"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="target_gender" className="text-sm font-medium">
                Género principal
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
                Zona / ubicación
              </label>
              <input
                id="target_location"
                name="target_location"
                value={form.target_location}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="main_pain_point" className="text-sm font-medium">
                Dolor principal
              </label>
              <textarea
                id="main_pain_point"
                name="main_pain_point"
                value={form.main_pain_point}
                onChange={handleChange}
                className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="main_desire" className="text-sm font-medium">
                Deseo principal
              </label>
              <textarea
                id="main_desire"
                name="main_desire"
                value={form.main_desire}
                onChange={handleChange}
                className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="main_objection" className="text-sm font-medium">
                Objeción principal
              </label>
              <textarea
                id="main_objection"
                name="main_objection"
                value={form.main_objection}
                onChange={handleChange}
                className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="buying_motivation" className="text-sm font-medium">
                Motivación de compra
              </label>
              <textarea
                id="buying_motivation"
                name="buying_motivation"
                value={form.buying_motivation}
                onChange={handleChange}
                className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
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
              Productos/servicios principales
            </label>
            <textarea
              id="main_products"
              name="main_products"
              value={form.main_products}
              onChange={handleChange}
              className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Describe brevemente los productos clave y su prioridad."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="average_ticket" className="text-sm font-medium">
                Ticket promedio
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
                Frecuencia de compra
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
            <label htmlFor="active_channels" className="text-sm font-medium">
              Canales activos
            </label>
            <input
              id="active_channels"
              name="active_channels"
              value={form.active_channels}
              onChange={handleChange}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Ej. instagram, tiktok, youtube"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="main_channel" className="text-sm font-medium">
              Canal principal
            </label>
            <input
              id="main_channel"
              name="main_channel"
              value={form.main_channel}
              onChange={handleChange}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Ej. instagram"
            />
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
                Estilo visual
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
                Colores de marca
              </label>
              <input
                id="brand_colors"
                name="brand_colors"
                value={form.brand_colors}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Ej. #FF0000, #000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="image_style_reference" className="text-sm font-medium">
              Referencia de estilo visual (opcional)
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
