import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  FlaskConical, 
  FolderLock, 
  CalendarCheck, 
  Video, 
  ShieldAlert, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import ReviewCarousel from "@/components/ui/review-carousel";

export default function HomePage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

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
              <Link href="/doctors">
                {t("heroCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/lab-tests">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex h-[230px] items-stretch gap-5 p-6">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                  {t("feature1Title")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {t("feature1Desc")}
                </p>
                <Button variant="link" className="mt-auto h-auto justify-start p-0 pt-5" asChild>
                  <Link href="/doctors" className="gap-1.5 text-xs font-semibold">
                    {tCommon("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="relative aspect-square w-auto shrink-0 self-stretch overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40">
                <Image
                  src="/doctor.png"
                  alt="Verified doctor"
                  fill
                  sizes="182px"
                  className="object-cover"
                />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex h-[230px] items-stretch gap-5 p-6">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                  {t("feature2Title")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {t("feature2Desc")}
                </p>
                <Button variant="link" className="mt-auto h-auto justify-start p-0 pt-5 text-emerald-600 dark:text-emerald-400" asChild>
                  <Link href="/lab-tests" className="gap-1.5 text-xs font-semibold">
                    {tCommon("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="relative aspect-square w-auto shrink-0 self-stretch overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40">
                <Image
                  src="/tests.png"
                  alt="Diagnostic booking equipment"
                  fill
                  sizes="182px"
                  className="object-cover"
                />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex h-[230px] items-stretch gap-5 p-6">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <FolderLock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                  {t("feature3Title")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {t("feature3Desc")}
                </p>
                <Button variant="link" className="mt-auto h-auto justify-start p-0 pt-5 text-purple-600 dark:text-purple-400" asChild>
                  <Link href="/about" className="gap-1.5 text-xs font-semibold">
                    {tCommon("learnMore")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="relative aspect-square w-auto shrink-0 self-stretch overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40">
                <Image
                  src="/drive.jpg"
                  alt="Secure medical records in ShifaLink Drive"
                  fill
                  sizes="182px"
                  className="object-cover"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Consultation Modalities */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Flexible Healthcare Delivery
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose the consultation format that matches your clinical needs and comfort.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
                  Secure Video Consultations
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Consult with qualified specialists from the convenience of your home with encrypted video links.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/doctors">Explore Telehealth</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
                  In-Person Clinic Visits
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Book direct appointments with verified doctors at partner clinics with transparent time slots.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/doctors">Book In-Person</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <ReviewCarousel />
      </section>
    </div>
  );
}
