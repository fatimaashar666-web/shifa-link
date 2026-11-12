import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageBanner } from "@/components/layout/PageBanner";
import { Shield, Activity, Users, CheckCircle2 } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div className="container mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
      <PageBanner
        image="/about.png"
        alt="Healthcare professionals standing outside a hospital"
        heading={t("title")}
        description={t("description")}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{t("pillar1Title")}</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {t("pillar1Desc")}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-2">
              <Users className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{t("pillar2Title")}</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {t("pillar2Desc")}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center mb-2">
              <Activity className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{t("pillar3Title")}</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {t("pillar3Desc")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Trust & Quality Indicators */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/40 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Our Clinical Standards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>ISO-15189 Lab Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>End-to-End Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>PMC/PMDC Verified Licensure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Multi-Region Cloud Redundancy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
