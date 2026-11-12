import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { getPublishedArticles } from "@/lib/sanity/client";
import { getSanityImageUrl } from "@/lib/sanity/image";
import { getLocalizedValue } from "@/lib/sanity/localization";

interface ArticlesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ArticlesPage({ params }: ArticlesPageProps) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const articles = await getPublishedArticles();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tNav("healthArticles")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Clinically reviewed articles and patient education resources to help you make informed decisions regarding appointments and diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => {
          const localizedTitle = getLocalizedValue(art.title, locale) || "Health Article";
          const localizedExcerpt = getLocalizedValue(art.excerpt, locale);
          const imageUrl = getSanityImageUrl(art.coverImage, { width: 720, height: 400 });

          return (
            <Card key={art._id} className="group flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={art.coverImage?.alt ?? localizedTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-100 via-sky-50 to-white dark:from-blue-950/50 dark:via-slate-900 dark:to-slate-950" />
                )}
              </div>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {art.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Reviewed
                  </span>
                </div>
                <CardTitle className="text-base font-semibold leading-snug">
                  {localizedTitle}
                </CardTitle>
                {localizedExcerpt && (
                  <CardDescription className="text-xs leading-relaxed line-clamp-3">
                    {localizedExcerpt}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-0 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {art.publishedAt
                      ? new Date(art.publishedAt).toLocaleDateString(locale, {
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent"}
                  </span>
                  <span>•</span>
                  <span>{art.authorDisplay ?? "Editorial Board"}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 p-6">
                <Button variant="ghost" size="sm" asChild className="gap-1.5 p-0 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-transparent">
                  <Link href={`/articles/${art.slug.current}`}>
                    <span>{tCommon("learnMore")}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
