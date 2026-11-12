"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

type ApiResponse = { message?: string; fieldErrors?: Record<string, string[]> };

export function ResetPasswordForm({ token }: { token?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(token ? null : t("invalidResetLink"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await response.json().catch(() => ({}))) as ApiResponse;
      if (!response.ok) {
        setError(data.fieldErrors ? Object.values(data.fieldErrors).flat()[0] : data.message ?? t("resetRequestError"));
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setError(t("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="new-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("newPasswordLabel")}</label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
          <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("confirmPasswordLabel")}</label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
          <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
      </div>
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !token}>
        {isSubmitting ? t("resettingPassword") : t("resetPassword")}
      </Button>
    </form>
  );
}
