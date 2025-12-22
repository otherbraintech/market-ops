"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    LogOut,
    Moon,
    Sun,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar()
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        try {
            const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
            if (saved === 'dark') {
                document.documentElement.classList.add('dark')
                setIsDark(true)
            } else if (saved === 'light') {
                document.documentElement.classList.remove('dark')
                setIsDark(false)
            } else {
                // fallback to prefers-color-scheme
                const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                if (prefersDark) {
                    document.documentElement.classList.add('dark')
                    setIsDark(true)
                }
            }
        } catch { }
    }, [])

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        try {
            if (next) {
                document.documentElement.classList.add('dark')
                localStorage.setItem('theme', 'dark')
            } else {
                document.documentElement.classList.remove('dark')
                localStorage.setItem('theme', 'light')
            }
        } catch { }
    }

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                suppressHydrationWarning
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user.name}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/cuenta" className="flex items-center gap-2 w-full cursor-pointer">
                                        <BadgeCheck className="h-4 w-4" />
                                        Cuenta
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Bell />
                                    Notificaciones
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleTheme() }}>
                                    {isDark ? <Sun /> : <Moon />}
                                    {isDark ? 'Modo claro' : 'Modo oscuro'}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setConfirmOpen(true) }}>
                                <LogOut />
                                Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>¿Cerrar sesión?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Se cerrará tu sesión en Market-Ops. Podrás volver a iniciar cuando quieras.
                    </p>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>Cerrar sesión</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
