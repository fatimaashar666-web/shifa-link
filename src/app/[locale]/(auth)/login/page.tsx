import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Lock, Mail } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const tLinks = await getTranslations({ locale, namespace: "loginLinks" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Shifa<span className="text-blue-600">Link</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white pt-2">
            {t("loginTitle")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("loginSubtitle")}
          </p>
        </div>

        {/* Card Form */}
        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardContent className="hidden">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("emailLabel")}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="patient@example.com"
                  className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("passwordLabel")}
                </label>
                <Link href="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  {t("forgotPasswordTitle")}
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <Button className="w-full mt-2" size="lg">
              {t("submitLogin")}
            </Button>
          </CardContent>
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
            <p>
              {t("noAccount")}{" "}
              <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {t("registerTitle")}
              </Link>
            </p>
            <p>
              {tLinks("doctorPrompt")}{" "}
              <Link href="/register-doctor" className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">
                {tLinks("doctorOnboarding")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
