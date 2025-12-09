"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Store } from "lucide-react"
import Image from "next/image"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

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
    imageUrl: string | null
    description: string | null
    createdAt: string
}

export function TeamSwitcher({
    businesses,
    initialActiveId,
}: {
    businesses: Business[]
    initialActiveId?: string | null
}) {
    const { isMobile } = useSidebar()
    const [activeBusiness, setActiveBusiness] = React.useState<Business | null>(null)

    // Initialize from localStorage or initialActiveId, fallback to first
    React.useEffect(() => {
        if (!businesses || businesses.length === 0) return
        let id: string | null = null
        try {
            id = typeof window !== 'undefined' ? localStorage.getItem('activeBusinessId') : null
        } catch {}
        if (!id && initialActiveId) id = initialActiveId
        const found = id ? businesses.find(b => b.id === id) : null
        setActiveBusiness(found || businesses[0])
    }, [businesses, initialActiveId])

    const selectBusiness = (business: Business) => {
        setActiveBusiness(business)
        try {
            if (typeof document !== 'undefined') {
                document.cookie = `activeBusinessId=${business.id}; path=/; max-age=31536000`
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem('activeBusinessId', business.id)
            }
        } catch {}
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {activeBusiness?.imageUrl ? (
                                <Image
                                    src={activeBusiness.imageUrl}
                                    alt={activeBusiness.name}
                                    width={32}
                                    height={32}
                                    className="size-8 rounded-lg object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Store className="size-4" />
                                </div>
                            )}
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {activeBusiness ? activeBusiness.name : "Seleccionar Negocio"}
                                </span>
                                <span className="truncate text-xs">
                                    {activeBusiness ? businessTypeLabels[activeBusiness.type] || activeBusiness.type : "Sin negocio"}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Negocios
                        </DropdownMenuLabel>
                        {businesses.map((business, index) => (
                            <DropdownMenuItem
                                key={business.id}
                                onClick={() => selectBusiness(business)}
                                className="gap-2 p-2"
                            >
                                {business.imageUrl ? (
                                    <Image
                                        src={business.imageUrl}
                                        alt={business.name}
                                        width={24}
                                        height={24}
                                        className="size-6 rounded-sm object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex size-6 items-center justify-center rounded-sm border">
                                        <Store className="size-4 shrink-0" />
                                    </div>
                                )}
                                {business.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">Crear nuevo negocio</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
