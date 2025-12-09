"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

    useEffect(() => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem('sidebarOpenStates') : null
            const saved: Record<string, boolean> = raw ? JSON.parse(raw) : {}
            const initial: Record<string, boolean> = {}
            for (const it of items) {
                const key = it.title
                initial[key] = saved[key] ?? !!it.isActive
            }
            setOpenMap(initial)
        } catch {
            const initial: Record<string, boolean> = {}
            for (const it of items) initial[it.title] = !!it.isActive
            setOpenMap(initial)
        }
    }, [items])

    const setOpen = (key: string, value: boolean) => {
        setOpenMap((prev) => {
            const next = { ...prev, [key]: value }
            try {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('sidebarOpenStates', JSON.stringify(next))
                }
            } catch {}
            return next
        })
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    item.items && item.items.length > 0 ? (
                        <Collapsible
                            key={item.title}
                            asChild
                            open={!!openMap[item.title]}
                            onOpenChange={(open) => setOpen(item.title, open)}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild>
                                                    <a href={subItem.url}>
                                                        <span>{subItem.title}</span>
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                <a href={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
