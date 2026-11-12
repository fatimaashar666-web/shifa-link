import { PortableText } from "@portabletext/react";
import type { ComponentProps } from "react";
import { getTranslations } from "next-intl/server";
import { CalendarDays, FileText, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLegalPage } from "@/lib/sanity/client";
import { getLocalizedValue } from "@/lib/sanity/localization";
import type { LegalPageDocument } from "@/lib/sanity/types";

interface LegalPageProps {
  locale: string;
  pageType: LegalPageDocument["pageType"];
}

export default async function LegalPage({ locale, pageType }: LegalPageProps) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const page = await getLegalPage(pageType, locale);
  const title = getLocalizedValue(page.title, locale) ?? t("fallbackTitle");
  const body = Array.isArray(page.body)
    ? page.body
    : page.body?.[locale] ?? page.body?.en;

  return (
    <article className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 space-y-5">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5 text-xs">
          <Link href="/" locale={locale}>
            {tCommon("backToHome")}
          </Link>
        </Button>

        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
          <FileText className="h-4 w-4" />
          <span>{t("policyBadge")}</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {t("effectiveDate")}:{" "}
              {new Date(page.effectiveDate).toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>{t("version")}: {page.version}</span>
            <Badge variant="outline" className="gap-1 text-[10px] uppercase tracking-wide">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              {t("approvedContent")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        {t("legalNotice")}
      </div>

      <div className="prose mt-10 max-w-none text-sm leading-relaxed text-slate-800 dark:prose-invert dark:text-slate-200 sm:text-base">
        {body ? (
          <PortableText value={body as ComponentProps<typeof PortableText>["value"]} />
        ) : (
          <p>{t("contentPending")}</p>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("questionsPrompt")}
        </p>
        <Button size="sm" asChild>
          <Link href="/contact" locale={locale}>
            {t("contactSupport")}
          </Link>
        </Button>
      </div>
    </article>
  );
}
