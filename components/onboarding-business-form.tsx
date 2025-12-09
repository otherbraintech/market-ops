"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { createBusiness } from "@/app/actions/business"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

type Step = 0 | 1 | 2

export function OnboardingBusinessForm({ welcomeName }: { welcomeName?: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [isAdvancing, setIsAdvancing] = useState(false)

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
    mode: "onTouched",
  })

  const next = async () => {
    const fieldsByStep: Record<Step, (keyof z.infer<typeof formSchema>)[]> = {
      0: ["name", "type"],
      1: ["imageUrl", "description"],
      2: ["goals", "valueProposition"],
    }
    const fields = fieldsByStep[step]
    const valid = await form.trigger(fields)
    if (!valid) return
    // Defer state update to next tick to avoid click-up hitting the new button
    setIsAdvancing(true)
    setTimeout(() => {
      setStep((s) => (s < 2 ? ((s + 1) as Step) : s))
      setIsAdvancing(false)
    }, 0)
  }

  const back = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Defensive: do not allow submit unless we're on the last step (2)
    if (step < 2 || isAdvancing) return
    const res = await createBusiness(values)
    if ((res as any)?.error) {
      form.setError("name", { message: "No se pudo crear el negocio" })
      return
    }
    router.replace("/negocio")
  }

  const stepLabelClass = (i: number) => (step === i ? "font-semibold text-foreground" : step > i ? "text-foreground" : "text-muted-foreground")

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-3 text-base">
        <span className={stepLabelClass(0)}>Básicos</span>
        <span>›</span>
        <span className={stepLabelClass(1)}>Marca</span>
        <span>›</span>
        <span className={stepLabelClass(2)}>Objetivos</span>
      </div>

      {step === 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-sm text-muted-foreground">Paso 1 de 3</p>
          <h2 className="text-2xl font-semibold tracking-tight">Datos básicos del negocio</h2>
          <p className="text-base text-muted-foreground">Indica el nombre y el tipo de tu negocio.</p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2 pt-1">
          <p className="text-sm text-muted-foreground">Paso 2 de 3</p>
          <h2 className="text-2xl font-semibold tracking-tight">Marca y descripción</h2>
          <p className="text-base text-muted-foreground">Añade una imagen (opcional) y describe brevemente tu negocio.</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2 pt-1">
          <p className="text-sm text-muted-foreground">Paso 3 de 3</p>
          <h2 className="text-2xl font-semibold tracking-tight">Objetivos y propuesta de valor</h2>
          <p className="text-base text-muted-foreground">Define metas y tu propuesta de valor. Siempre podrás cambiarlas.</p>
        </div>
      )}

      

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && step < 2) {
              e.preventDefault()
              next()
            }
          }}
          className="space-y-4"
        >
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Negocio</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Acme Corp" {...field} autoFocus />
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
                    <FormLabel>Tipo de Negocio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Logo/Imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Servicio/Producto</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Resumen de tu negocio" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivos Comerciales</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Aumentar MRR 20% en Q1; Adquirir 50 clientes B2B." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valueProposition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Propuesta de Valor Única (PVU)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ayudamos a [cliente] a [resolver problema] con [solución única]." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          

          <div className={`flex ${step > 0 ? "justify-between" : "justify-end"} pt-2`}>
            {step > 0 && (
              <Button type="button" variant="secondary" className="hover:cursor-pointer" onClick={back} disabled={form.formState.isSubmitting}>
                Atrás
              </Button>
            )}
            {step < 2 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  next()
                }}
                disabled={form.formState.isSubmitting}
              >
                Siguiente
              </Button>
            ) : (
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear negocio
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
