import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, User, Mail, Lock, ShieldCheck } from "lucide-react";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
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
            {t("registerTitle")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("registerSubtitle")}
          </p>
        </div>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("nameLabel")}
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Sara Ahmed"
                  className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("emailLabel")}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("passwordLabel")}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="rounded-md bg-blue-50 dark:bg-blue-950/50 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <span>By creating an account, you consent to our secure, role-based medical record handling policy.</span>
            </div>

            <Button className="w-full mt-2" size="lg">
              {t("submitRegister")}
            </Button>
          </CardContent>

          <CardFooter className="flex justify-center text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
            <p>
              {t("haveAccount")}{" "}
              <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {t("loginTitle")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
