import * as Sentry from "@sentry/nextjs"
import { sentryOptions } from "./lib/sentry"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ...sentryOptions,
  integrations: (defaults) => defaults.filter((integration) => integration.name !== "BrowserSession"),
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
