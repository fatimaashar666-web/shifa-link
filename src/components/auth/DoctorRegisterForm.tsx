"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type ApiErrorResponse = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const specialties = [
  ["general-medicine", "General Medicine"],
  ["cardiology", "Cardiology"],
  ["dermatology", "Dermatology"],
  ["pediatrics", "Pediatrics"],
  ["neurology", "Neurology"],
  ["orthopedics", "Orthopedics"],
] as const;

export function DoctorRegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/auth/register-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, licenseNumber, specialty, email, password }),
      });
      const data = (await response.json().catch(() => ({}))) as ApiErrorResponse;

      if (!response.ok) {
        const firstFieldError = data.fieldErrors
          ? Object.values(data.fieldErrors).flat()[0]
          : undefined;
        setError(firstFieldError ?? data.message ?? t("networkError"));
        return;
      }

      router.push("/doctor/summary");
      router.refresh();
    } catch {
      setError(t("networkError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="doctor-register-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t("nameLabel")}
          </label>
          <input id="doctor-register-name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} required minLength={2} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="doctor-register-license" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t("licenseLabel")}
          </label>
          <input id="doctor-register-license" value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} className={inputClass} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="doctor-register-specialty" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("specialtyLabel")}
        </label>
        <select id="doctor-register-specialty" value={specialty} onChange={(event) => setSpecialty(event.target.value)} className={inputClass} required>
          <option value="">{t("selectSpecialty")}</option>
          {specialties.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="doctor-register-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("emailLabel")}
        </label>
        <input id="doctor-register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} required autoComplete="email" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="doctor-register-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("passwordLabel")}
        </label>
        <input id="doctor-register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} required minLength={8} autoComplete="new-password" />
      </div>

      <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        {t("doctorReviewNotice")}
      </div>

      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

      <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("creatingDoctorAccount") : t("submitDoctorRegister")}
      </Button>
    </form>
  );
}
