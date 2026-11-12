"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

type ApiResponse = { message?: string; resetUrl?: string; fieldErrors?: Record<string, string[]> };

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setResetUrl(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = (await response.json().catch(() => ({}))) as ApiResponse;
      if (!response.ok) {
        setError(data.fieldErrors ? Object.values(data.fieldErrors).flat()[0] : data.message ?? t("resetRequestError"));
        return;
      }
      setMessage(data.message ?? t("resetRequestSuccess"));
      setResetUrl(data.resetUrl ?? null);
    } catch {
      setError(t("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="forgot-password-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("emailLabel")}
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            id="forgot-password-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            required
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {message && <p className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{message}</p>}
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      {resetUrl && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-semibold">{t("developmentResetLink")}</p>
          <a href={resetUrl.replace(/^https?:\/\/[^/]+/, "")} className="mt-1 block break-all underline">
            {resetUrl}
          </a>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t("sendingReset") : t("sendReset")}
      </Button>
      <Button type="button" variant="link" className="w-full" onClick={() => router.push("/login")}>
        {t("backToLogin")}
      </Button>
    </form>
  );
}
