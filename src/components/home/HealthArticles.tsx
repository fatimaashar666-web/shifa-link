import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, Calendar, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublishedArticles } from "@/lib/sanity/client";
import { getSanityImageUrl } from "@/lib/sanity/image";
import { getLocalizedValue } from "@/lib/sanity/localization";

const knownArticleCategories: Record<string, string> = {
  "Cardiovascular Health": "articleCategories.cardiovascular",
  "Diagnostic Guides": "articleCategories.diagnostics",
  "Preventive Care": "articleCategories.preventive",
};

const knownArticleAuthors: Record<string, string> = {
  "Clinical Advisory Panel": "articleAuthors.clinicalAdvisoryPanel",
  "Laboratory Clinical Team": "articleAuthors.laboratoryClinicalTeam",
  "Primary Care Working Group": "articleAuthors.primaryCareWorkingGroup",
};

export default async function HealthArticles({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home" });
  const tMeta = await getTranslations({ locale, namespace: "articleMeta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const articles = (await getPublishedArticles()).slice(0, 3);

  return (
    <section aria-labelledby="health-articles-title" className="container mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2 mx-auto mb-12 text-center">
          <h2 id="health-articles-title" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {t("articlesTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t("articlesSubtitle")}
          </p>
        </div>

        <Button variant="link" asChild className="h-auto justify-start gap-1.5 p-0 text-xs font-semibold sm:justify-end">
          <Link href="/articles" locale={locale}>
            {tCommon("viewAll")}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </Button>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {articles.map((article) => {
            const title = getLocalizedValue(article.title, locale) ?? "Health Article";
            const excerpt = getLocalizedValue(article.excerpt, locale);
            const imageUrl = getSanityImageUrl(article.coverImage, { width: 720, height: 400 });

            return (
              <Card key={article._id} className="group flex h-full flex-col overflow-hidden border-slate-200/80 bg-white/90 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/70">
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={article.coverImage?.alt ?? title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-blue-600/70 dark:text-blue-400/70">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {knownArticleCategories[article.category]
                        ? tMeta(knownArticleCategories[article.category])
                        : article.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {t("articlesReviewed")}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 text-base leading-snug">
                    {title}
                  </CardTitle>
                  {excerpt && (
                    <CardDescription className="line-clamp-3 text-xs leading-relaxed">
                      {excerpt}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="mt-auto pt-0 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(locale, {
                            month: "short",
                            year: "numeric",
                          })
                        : t("articlesRecent")}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>
                      {article.authorDisplay
                        ? knownArticleAuthors[article.authorDisplay]
                          ? tMeta(knownArticleAuthors[article.authorDisplay])
                          : article.authorDisplay
                        : t("articlesEditorialBoard")}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Button variant="link" size="sm" asChild className="h-auto gap-1.5 p-0 text-xs font-semibold text-blue-600 hover:no-underline dark:text-blue-400">
                    <Link href={`/articles/${article.slug.current}`} locale={locale}>
                      {tCommon("learnMore")}
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("articlesEmpty")}
        </div>
      )}
    </section>
  );
}
