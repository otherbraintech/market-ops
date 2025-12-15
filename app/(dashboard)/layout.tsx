import { AppSidebar } from "@/components/app-sidebar"
import { cookies } from "next/headers"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs"
import { getUserBusinesses } from "@/app/actions/business"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BusinessProvider } from "@/contexts/business-context"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const businesses = await getUserBusinesses()
    const cookieStore = await cookies()
    const initialActiveId = cookieStore.get("activeBusinessId")?.value || null

    // If user has no businesses, send to onboarding
    if (!businesses || businesses.length === 0) {
        redirect("/onboarding")
    }

    // Fetch session user for NavUser
    const session = await getServerSession(authOptions())
    const user = {
        name: session?.user?.name || "Usuario",
        email: session?.user?.email || "",
        avatar: (session?.user as any)?.image || "",
    }

    return (
        <BusinessProvider>
            <SidebarProvider>
                <AppSidebar businesses={businesses} initialActiveId={initialActiveId} user={user} />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-3 px-4 min-w-0">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <div className="truncate">
                                <DynamicBreadcrumbs />
                            </div>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </BusinessProvider>
    )
}
