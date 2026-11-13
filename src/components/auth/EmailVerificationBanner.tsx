"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react"

export function EmailVerificationBanner({ email }: { email: string }) {
  const t = useTranslations("patientDashboard")
  const locale = useLocale()
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function sendVerificationEmail() {
    setStatus("sending")
    try {
      const response = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      })
      setStatus(response.ok ? "sent" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {status === "sent" ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        ) : status === "error" ? (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        ) : (
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
        )}
        <div>
          <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            {status === "sent" ? t("verificationEmailSentTitle") : t("verifyEmailTitle")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
            {status === "sent"
              ? t("verificationEmailSentMessage", { email })
              : status === "error"
                ? t("verificationEmailError")
                : t("verifyEmailMessage", { email })}
          </p>
        </div>
      </div>
      {status !== "sent" && (
        <Button type="button" size="sm" variant="outline" onClick={() => void sendVerificationEmail()} disabled={status === "sending"}>
          {status === "sending" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("verifyEmailButton")}
        </Button>
      )}
    </section>
  )
}
