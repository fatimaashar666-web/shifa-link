"use client"

import { FormEvent, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Lock, Mail, Loader2 } from "lucide-react"

type LoginResponse = {
  message?: string
  fieldErrors?: Record<string, string[]>
}

export function LoginForm() {
  const t = useTranslations("auth")
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accountType, setAccountType] = useState<"patient" | "doctor">("patient")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, accountType }),
      })
      const data = (await response.json().catch(() => ({}))) as LoginResponse

      if (!response.ok) {
        const firstFieldError = data.fieldErrors
          ? Object.values(data.fieldErrors).flat()[0]
          : undefined
        setError(firstFieldError ?? data.message ?? t("networkError"))
        return
      }

      router.push(accountType === "doctor" ? "/doctor/summary" : "/patient")
      router.refresh()
    } catch {
      setError(t("networkError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("emailLabel")}
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="patient@example.com"
            autoComplete="email"
            required
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-account-type" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("accountTypeLabel")}
        </label>
        <select
          id="login-account-type"
          name="accountType"
          value={accountType}
          onChange={(event) => setAccountType(event.target.value as "patient" | "doctor")}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="patient">{t("patientAccount")}</option>
          <option value="doctor">{t("doctorAccount")}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t("passwordLabel")}
          </label>
          <a href={`/${locale}/forgot-password`} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
            {t("forgotPasswordTitle")}
          </a>
        </div>
        <div className="relative flex items-center">
          <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <Button className="mt-2 w-full" size="lg" type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("submitLogin")}
      </Button>
    </form>
  )
}
