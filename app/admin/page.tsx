import { isAuthenticated } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { SubscriptionDashboard } from "@/components/subscription-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const authed = await isAuthenticated()

  if (!authed) {
    return <LoginForm />
  }

  return <SubscriptionDashboard admin />
}
