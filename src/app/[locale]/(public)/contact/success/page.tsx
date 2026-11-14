import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default async function ContactSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full text-center">
        <CardContent className="flex flex-col items-center gap-5 p-8 sm:p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("successTitle")}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("successMessage")}
            </p>
          </div>
          <Button asChild>
            <Link href="/">{t("backHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
