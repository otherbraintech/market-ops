"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { updatePassword } from "@/app/actions/auth-security"
import { updateProfile } from "@/app/actions/user"
import { Loader2, Pencil, ShieldAlert, Lock, Check, X, Camera } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const passwordSchema = z.object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

export default function AccountPageClient({ user, hasPassword }: { user: any; hasPassword: boolean }) {
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()
    const [editMode, setEditMode] = useState<{ field: string | null }>({ field: null })
    const [avatarUrl, setAvatarUrl] = useState(user.avatar || "")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [hasPasswordState, setHasPasswordState] = useState(hasPassword)

    // Forms
    const formProfile = useForm({
        defaultValues: {
            name: user.name || "",
            email: user.email || "",
            avatar: user.avatar || "",
        }
    })

    const formPassword = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "", confirmPassword: "" }
    })

    // Actions
    function onUpdateProfileField(field: "name" | "email" | "avatar", value: string) {
        startTransition(async () => {
            const currentData = formProfile.getValues()
            const newData = { ...currentData, [field]: value }
            // Ensure we use the latest value for the field being updated, 
            // relying on form state might be slightly behind if not careful, but passing 'value' args helps.

            const res = await updateProfile(user.id, newData)

            if (res.error) {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Éxito", description: "Perfil actualizado correctamente" })
                setEditMode({ field: null })
                if (field === "avatar") setAvatarUrl(value)
            }
        })
    }

    function onUpdatePassword(data: z.infer<typeof passwordSchema>) {
        startTransition(async () => {
            const res = await updatePassword(user.id, data.password)
            if (res.error) {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Éxito", description: "Contraseña actualizada correctamente" })
                setHasPasswordState(true)
                formPassword.reset()
                setIsDialogOpen(false)
            }
        })
    }

    // Reusable Password Form Component
    const PasswordForm = () => (
        <Form {...formPassword}>
            <form onSubmit={formPassword.handleSubmit(onUpdatePassword)} className="space-y-4">
                <FormField
                    control={formPassword.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nueva Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={formPassword.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmar Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Contraseña
                </Button>
            </form>
        </Form>
    )

    return (
        <div className="max-w-5xl mx-auto space-y-4 py-8 px-4">

            {/* Header / Profile Section - Clean Design (No Card) */}
            <div className="flex flex-col items-center space-y-6">

                {/* Avatar */}
                <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl cursor-default">
                        <AvatarImage src={avatarUrl} className="object-cover" />
                        <AvatarFallback className="text-4xl">
                            {user.name?.substring(0, 2).toUpperCase() || "CN"}
                        </AvatarFallback>
                    </Avatar>
                    <div
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium text-xs flex-col gap-1"
                        onClick={() => setEditMode({ field: "avatar" })}
                    >
                        <Camera className="h-6 w-6" />
                        <span>Cambiar</span>
                    </div>
                </div>

                {/* Avatar Edit Input */}
                {editMode.field === "avatar" && (
                    <div className="flex w-full max-w-sm items-center space-x-2 animate-in fade-in zoom-in-95 duration-200">
                        <Input
                            placeholder="Pegar URL de imagen..."
                            defaultValue={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="bg-background"
                        />
                        <Button size="icon" onClick={() => onUpdateProfileField("avatar", avatarUrl)}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => {
                            setAvatarUrl(user.avatar || "")
                            setEditMode({ field: null })
                        }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Name & Email - centered and clean */}
                <div className="text-center w-full max-w-md space-y-2">

                    {/* Name */}
                    <div className="flex items-center justify-center gap-2 group min-h-[40px]">
                        {editMode.field === "name" ? (
                            <div className="flex items-center gap-2 w-full animate-in fade-in">
                                <Input
                                    defaultValue={user.name}
                                    onChange={(e) => formProfile.setValue("name", e.target.value)}
                                    className="text-center font-bold text-2xl h-10"
                                />
                                <div className="flex gap-1">
                                    <Button size="icon" variant="default" className="h-10 w-10" onClick={() => onUpdateProfileField("name", formProfile.getValues("name"))}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setEditMode({ field: null })}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setEditMode({ field: "name" })}
                                >
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-center gap-2 group min-h-[32px]">
                        {editMode.field === "email" ? (
                            <div className="flex items-center gap-2 w-full animate-in fade-in mt-1">
                                <Input
                                    defaultValue={user.email}
                                    onChange={(e) => formProfile.setValue("email", e.target.value)}
                                    className="text-center h-8"
                                />
                                <div className="flex gap-1">
                                    <Button size="icon" variant="default" className="h-8 w-8" onClick={() => onUpdateProfileField("email", formProfile.getValues("email"))}>
                                        <Check className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditMode({ field: null })}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-muted-foreground">{user.email}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setEditMode({ field: "email" })}
                                >
                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Security Section - Kept in Card/Container for clear separation */}
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold">Seguridad y Acceso</h2>
                    <p className="text-sm text-muted-foreground">Administra cómo accedes a tu cuenta.</p>
                </div>

                {!hasPasswordState ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                                <ShieldAlert className="h-5 w-5" />
                                <h3 className="font-semibold text-lg">Tu cuenta no tiene contraseña</h3>
                            </div>
                            <p className="text-muted-foreground text-base max-w-4xl">
                                Actualmente accedes solo via OAuth (Google). Para mayor seguridad y permitir el acceso por correo, debes establecer una contraseña.
                            </p>
                        </div>
                        <div className="max-w-sm pt-2">
                            <PasswordForm />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-6 border rounded-xl bg-card shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-base">Contraseña establecida</p>
                                <p className="text-sm text-muted-foreground">Tu cuenta está protegida con contraseña.</p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="ml-4">Cambiar contraseña</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                                    <DialogDescription>
                                        Ingresa tu nueva contraseña a continuación.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-2">
                                    <PasswordForm />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>
        </div>
    )
}
