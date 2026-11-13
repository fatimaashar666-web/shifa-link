import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, FlaskConical, Search, ArrowRight } from "lucide-react";

export default async function PatientDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "patientDashboard" });
  const cards = [
    {
      href: "/patient/appointments",
      title: t("appointmentsTitle"),
      description: t("appointmentsDescription"),
      icon: Calendar,
    },
    {
      href: "/patient/drive",
      title: t("driveTitle"),
      description: t("driveDescription"),
      icon: FileText,
    },
    {
      href: "/patient/diagnostics",
      title: t("diagnosticsTitle"),
      description: t("diagnosticsDescription"),
      icon: FlaskConical,
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-slate-950 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t("description")}
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/doctors">
            <Search className="h-4 w-4" />
            {t("findDoctor")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map(({ href, title, description, icon: Icon }) => (
          <Card key={href} className="flex h-full flex-col transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="mt-auto space-y-4">
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {description}
              </p>
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                <Link href={href}>
                  {t("open")}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
