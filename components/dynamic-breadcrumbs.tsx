"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const TITLE_MAP: Record<string, string> = {
  "": "Dashboard",
  "negocio": "Negocio",
  "configuracion": "Configuración",
  "onboarding": "Onboarding",
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const segments = (pathname || "/").split("/").filter(Boolean)

  const items = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/")
    const title = TITLE_MAP[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
    const isLast = idx === segments.length - 1
    return { href, title, isLast }
  })

  // If at root ("/"), show single Dashboard item
  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, i) => (
          <React.Fragment key={item.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
