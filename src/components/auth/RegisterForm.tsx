"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Droplets, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";

type ApiErrorResponse = {
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};

export function RegisterForm() {
  const t = useTranslations("auth");
  const tRegistration = useTranslations("registration");
  const router = useRouter();
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
          bloodGroup: bloodGroup || undefined,
          phone: phone || undefined,
          locale,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as ApiErrorResponse;

      if (!response.ok) {
        const firstFieldError = data.fieldErrors
          ? Object.values(data.fieldErrors).flat()[0]
          : undefined;
        setError(firstFieldError ?? data.message ?? "Unable to create your account.");
        return;
      }

      router.push("/patient");
      router.refresh();
    } catch {
      setError("Unable to connect to ShifaLink. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CardContent className="pt-6">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label htmlFor="register-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t("nameLabel")}
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              id="register-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Sara Ahmed"
              autoComplete="name"
              required
              minLength={2}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t("emailLabel")}
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              id="register-email"
              name="email"
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

        <div className="space-y-1.5">
          <label htmlFor="register-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t("passwordLabel")}
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              id="register-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="register-date-of-birth" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {tRegistration("dateOfBirth")}
            </label>
            <div className="relative flex items-center">
              <CalendarDays className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                id="register-date-of-birth"
                name="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                autoComplete="bday"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {tRegistration("phoneNumber")}
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                id="register-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+92 300 1234567"
                autoComplete="tel"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="register-gender" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {tRegistration("gender")}
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 h-4 w-4 text-slate-400" />
              <select
                id="register-gender"
                name="gender"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">{tRegistration("selectGender")}</option>
                <option value="MALE">{tRegistration("male")}</option>
                <option value="FEMALE">{tRegistration("female")}</option>
                <option value="OTHER">{tRegistration("other")}</option>
                <option value="PREFER_NOT_TO_SAY">{tRegistration("preferNotToSay")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-blood-group" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {tRegistration("bloodGroup")}
            </label>
            <div className="relative flex items-center">
              <Droplets className="absolute left-3 h-4 w-4 text-slate-400" />
              <select
                id="register-blood-group"
                name="bloodGroup"
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
                className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">{tRegistration("selectBloodGroup")}</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
                <option value="UNKNOWN">{tRegistration("unknown")}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <span>{tRegistration("consentNotice")}</span>
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2 w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? tRegistration("creatingAccount") : t("submitRegister")}
        </Button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {tRegistration("doctorPrompt")} {" "}
          <Link href="/register-doctor" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            {tRegistration("registerAsDoctor")}
          </Link>
        </p>
      </form>
    </CardContent>
  );
}
