import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, ShieldCheck } from "lucide-react";

export default function ArticlesPage() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const articles = [
    {
      id: "art-1",
      title: "Understanding Hypertension: Symptoms, Risks, and Prevention",
      category: "Cardiovascular Health",
      excerpt: "Essential guidelines on monitoring blood pressure, dietary lifestyle interventions, and when to seek urgent specialist review.",
      author: "Clinical Review Board",
      date: "Nov 2026",
      readTime: "5 min read",
    },
    {
      id: "art-2",
      title: "How to Prepare for Routine Blood and Fasting Diagnostics",
      category: "Diagnostic Guides",
      excerpt: "Step-by-step instructions on fasting duration, hydration, and medication holds prior to standard metabolic and lipid panels.",
      author: "Diagnostic Advisory Team",
      date: "Nov 2026",
      readTime: "4 min read",
    },
    {
      id: "art-3",
      title: "Seasonal Respiratory Infections: Clinical Care vs. Home Management",
      category: "Preventive Care",
      excerpt: "Identifying red-flag symptoms in respiratory illnesses and when video consultations provide timely clinical triage.",
      author: "Primary Care Working Group",
      date: "Oct 2026",
      readTime: "6 min read",
    },
  ];

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
        {articles.map((art) => (
          <Card key={art.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {art.category}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>{art.date}</span>
                </div>
              </div>
              <CardTitle className="text-base font-semibold leading-snug">
                {art.title}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                {art.excerpt}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {art.author}
                </span>
                <span>{art.readTime}</span>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <span>{tCommon("learnMore")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
