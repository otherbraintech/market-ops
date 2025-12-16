import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AccountPageClient from "./AccountPageClient"

import { prisma } from "@/lib/prisma"

export default async function AccountPage() {
    const session = await getServerSession(authOptions())

    if (!session || !session.user) {
        redirect("/login")
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { passwordHash: true }
    })

    const user = {
        id: (session.user as any).id,
        name: session.user.name || "Usuario",
        email: session.user.email || "",
        avatar: session.user.image || "",
    }

    const hasPassword = !!dbUser?.passwordHash

    return <AccountPageClient user={user} hasPassword={hasPassword} />
}
