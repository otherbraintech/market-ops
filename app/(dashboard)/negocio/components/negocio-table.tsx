"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateBusiness, deleteBusiness } from "@/app/actions/business"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Loader2 } from "lucide-react"

const businessTypeLabels: Record<string, string> = {
    MARCA_PERSONAL: "Marca Personal",
    EMPRESA: "Empresa",
    ECOMMERCE: "E-commerce",
    AGENCIA: "Agencia",
}

interface Business {
    id: string
    name: string
    type: string
    description: string | null
    createdAt: string
    imageUrl?: string | null
    goals?: string | null
    valueProposition?: string | null
}

interface NegocioTableProps {
    negocios: Business[]
}

export function NegocioTable({ negocios }: NegocioTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(null)
  const [formState, setFormState] = useState<{
    name: string
    type: string
    imageUrl: string
    description: string
    goals: string
    valueProposition: string
  }>({
    name: "",
    type: "EMPRESA",
    imageUrl: "",
    description: "",
    goals: "",
    valueProposition: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState("")

  function normalizeName(input: string) {
    return input
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}+/gu, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_+/g, "_")
  }

  function onOpenEdit(negocio: Business) {
    setFormState({
      name: negocio.name,
      type: negocio.type,
      imageUrl: negocio.imageUrl || "",
      description: negocio.description || "",
      goals: negocio.goals || "",
      valueProposition: negocio.valueProposition || "",
    })
    setOpenId(negocio.id)
  }

  async function onSubmitEdit() {
    if (!openId) return
    setSubmitting(true)
    const res = await updateBusiness(openId, {
      name: formState.name,
      type: formState.type as any,
      imageUrl: formState.imageUrl || undefined,
      description: formState.description || undefined,
      goals: formState.goals || undefined,
      valueProposition: formState.valueProposition || undefined,
    })
    setSubmitting(false)
    if ((res as any)?.error) {
      toast({ title: "Error", description: "No se pudo actualizar el negocio." })
      return
    }
    toast({ title: "Éxito", description: "Negocio actualizado correctamente." })
    setOpenId(null)
    router.refresh()
  }

  function openDelete(negocio: Business) {
    setDeleteId(negocio.id)
    setDeleteConfirm("")
  }

  async function confirmDelete() {
    if (!deleteId) return
    const res = await deleteBusiness(deleteId, deleteConfirm)
    if ((res as any)?.error) {
      toast({ title: "Error", description: (res as any).error || "No se pudo eliminar." })
      return
    }
    toast({ title: "Éxito", description: "Negocio eliminado." })
    setDeleteId(null)
    setDeleteConfirm("")
    router.refresh()
  }

  return (
    <>
      <Table>
        <TableCaption>Lista de tus negocios registrados.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Fecha de Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {negocios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No hay negocios registrados.
              </TableCell>
            </TableRow>
          ) : (
            negocios.map((negocio) => (
              <TableRow key={negocio.id}>
                <TableCell>
                  {negocio.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={negocio.imageUrl}
                      alt={negocio.name}
                      className="h-10 w-10 rounded-md object-cover border"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground border">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{negocio.name}</TableCell>
                <TableCell>{businessTypeLabels[negocio.type] || negocio.type}</TableCell>
                <TableCell>{negocio.description || "-"}</TableCell>
                <TableCell className="text-right">
                  {format(new Date(negocio.createdAt), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onOpenEdit(negocio)}>
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDelete(negocio)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!openId} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Negocio</DialogTitle>
            <DialogDescription>Actualiza los datos del negocio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formState.name}
                  onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={formState.type}
                  onValueChange={(v) => setFormState((s) => ({ ...s, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARCA_PERSONAL">Marca Personal</SelectItem>
                    <SelectItem value="EMPRESA">Empresa</SelectItem>
                    <SelectItem value="ECOMMERCE">E-commerce</SelectItem>
                    <SelectItem value="AGENCIA">Agencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL del Logo/Imagen</label>
              <Input
                placeholder="https://ejemplo.com/logo.png"
                value={formState.imageUrl}
                onChange={(e) => setFormState((s) => ({ ...s, imageUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={formState.description}
                onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Objetivos Comerciales</label>
              <Textarea
                value={formState.goals}
                onChange={(e) => setFormState((s) => ({ ...s, goals: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Propuesta de Valor Única</label>
              <Textarea
                value={formState.valueProposition}
                onChange={(e) => setFormState((s) => ({ ...s, valueProposition: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenId(null)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={onSubmitEdit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Negocio</DialogTitle>
            <DialogDescription>
              {(() => {
                const deleting = deleteId ? negocios.find((n) => n.id === deleteId) : null
                const norm = deleting ? normalizeName(deleting.name) : ""
                const expected = norm ? `eliminar_${norm}` : ""
                return expected
                  ? `Para confirmar la eliminación de "${deleting?.name}", escribe exactamente: ${expected}`
                  : "Para confirmar, escribe la cadena solicitada."
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmación</label>
            {(() => {
              const deleting = deleteId ? negocios.find((n) => n.id === deleteId) : null
              const norm = deleting ? normalizeName(deleting.name) : ""
              const expected = norm ? `eliminar_${norm}` : ""
              return (
                <Input
                  placeholder={expected || "eliminar_minegocio"}
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                />
              )
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            {(() => {
              const deleting = deleteId ? negocios.find((n) => n.id === deleteId) : null
              const norm = deleting ? normalizeName(deleting.name) : ""
              const expected = norm ? `eliminar_${norm}` : ""
              const disabled = !expected || deleteConfirm !== expected
              return (
                <Button
                  variant="destructive"
                  onClick={() => confirmDelete()}
                  disabled={disabled}
                >
                  Eliminar
                </Button>
              )
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
