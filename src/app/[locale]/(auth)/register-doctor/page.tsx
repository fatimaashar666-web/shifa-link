import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { DoctorRegisterForm } from "@/components/auth/DoctorRegisterForm";

export default async function RegisterDoctorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Shifa<span className="text-blue-600">Link</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 pt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("doctorRegisterTitle")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("doctorRegisterSubtitle")}
          </p>
        </div>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <DoctorRegisterForm />
          </CardContent>

          <CardFooter className="flex justify-center text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
            <p>
              Already verified?{" "}
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
