import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import ReviewCarousel from "@/components/ui/review-carousel";
import ServiceCards from "@/components/home/ServiceCards";
import ConsultationCards from "@/components/home/ConsultationCards";
import HealthArticles from "@/components/home/HealthArticles";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section
        aria-labelledby="hero-title"
        className="relative isolate min-h-[540px] overflow-hidden border-b border-sky-100 bg-cover bg-center dark:border-slate-800"
        style={{ backgroundImage: "url('/herobanner.png')" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-white/55 via-white/20 to-transparent dark:from-slate-950/60 dark:via-slate-950/25 dark:to-transparent"
        />
        <div className="container mx-auto flex min-h-[540px] max-w-7xl items-center px-4 py-16 sm:px-6 md:py-20">
          <div className="flex max-w-2xl flex-col items-start space-y-6 text-left">
          <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Modern Multilingual Healthcare SaaS</span>
          </Badge>
          <h1 id="hero-title" className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-700 dark:text-slate-200 sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="lg" asChild className="gap-2">
              <Link href="/doctors" locale={locale}>
                {t("heroCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/lab-tests" locale={locale}>
                {t("secondaryCta")}
              </Link>
            </Button>
          </div>
        </div>
        </div>
      </section>

      {/* Emergency Notice Banner */}
      <section className="container mx-auto max-w-5xl px-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
            <strong>Clinical Safety Notice:</strong> ShifaLink is a scheduled appointment and record coordination platform, not an emergency facility. If you or someone with you experiences acute emergency symptoms, please call your local emergency service (e.g. 112, 911, or 15) immediately.
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <ServiceCards locale={locale} />
      </section>

      {/* Consultation Modalities */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <ConsultationCards locale={locale} />
      </section>
      <HealthArticles locale={locale} />
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <ReviewCarousel />
      </section>
    </div>
  );
}
