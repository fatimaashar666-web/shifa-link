import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ShieldCheck, User } from "lucide-react";
import { getArticleBySlug, getPublishedArticles } from "@/lib/sanity/client";

interface ArticleDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug.current }));
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { locale, slug } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const title =
    (article.title as Record<string, string>)[locale] ||
    article.title.en ||
    "Article";

  const excerpt =
    article.excerpt &&
    ((article.excerpt as Record<string, string>)[locale] || article.excerpt.en);

  return (
    <article className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs -ml-2 mb-6">
          <Link href="/articles">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{tCommon("backToHome")}</span>
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {article.category}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Clinically Reviewed
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl leading-tight">
          {title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {article.authorDisplay ?? "Clinical Review Board"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString(locale, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent"}
          </span>
        </div>
      </div>

      {excerpt && (
        <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/30 p-4 border-l-4 border-blue-600 text-sm text-slate-700 dark:text-slate-300 italic">
          {excerpt}
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
        <p>
          Routine health screening and proactive monitoring are fundamental to early diagnosis and improved outcomes. This educational overview has been compiled from international clinical practice guidelines to assist patients in understanding standard healthcare pathways.
        </p>
        <p>
          Always discuss specific symptoms, medical history, and prescribed medications directly with a qualified healthcare practitioner. Teleconsultation and clinic booking options are available through ShifaLink for registered users.
        </p>
      </div>

      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Button asChild size="sm">
          <Link href="/doctors">Book Doctor Consultation</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/lab-tests">Explore Diagnostic Tests</Link>
        </Button>
      </div>
    </article>
  );
}
