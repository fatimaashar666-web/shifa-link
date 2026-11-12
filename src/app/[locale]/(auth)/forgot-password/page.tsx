import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, KeyRound } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow"><Activity className="h-6 w-6" /></div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Shifa<span className="text-blue-600">Link</span></span>
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white pt-2"><KeyRound className="h-5 w-5 text-blue-600" />{t("forgotPasswordTitle")}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("forgotPasswordSubtitle")}</p>
        </div>
        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6"><ForgotPasswordForm locale={locale} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
