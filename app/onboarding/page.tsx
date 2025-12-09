import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getBusinesses } from "@/app/actions/business"
import { redirect } from "next/navigation"
import { OnboardingBusinessForm } from "@/components/onboarding-business-form"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions())
  const businesses = await getBusinesses()
  if (businesses && businesses.length > 0) {
    redirect("/negocio")
  }

  const name = session?.user?.name || ""
  const firstName = name ? name.split(" ")[0] : ""

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <OnboardingBusinessForm welcomeName={firstName} />
      </div>
    </div>
  )
}
