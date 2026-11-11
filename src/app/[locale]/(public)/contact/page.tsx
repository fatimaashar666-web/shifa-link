import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Mail className="h-5 w-5" />
                <CardTitle className="text-base">{t("emailTitle")}</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-700 dark:text-slate-300">
                {t("email")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Phone className="h-5 w-5" />
                <CardTitle className="text-base">{t("phoneTitle")}</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-700 dark:text-slate-300">
                {t("phone")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <MapPin className="h-5 w-5" />
                <CardTitle className="text-base">{t("hqTitle")}</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("hq")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Contact Inquiry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("formTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 text-xs" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {t("namePlaceholder")}
                </label>
                <input
                  type="text"
                  placeholder={t("namePlaceholder")}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {t("emailPlaceholder")}
                </label>
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {t("messagePlaceholder")}
                </label>
                <textarea
                  rows={4}
                  placeholder={t("messagePlaceholder")}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                />
              </div>

              <Button type="submit" className="w-full text-xs">
                {t("sendButton")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
