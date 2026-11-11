import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-6">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-3">
        404 — Page Not Found
      </h1>
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-400 mb-6">
        The requested healthcare portal page or resource does not exist or has been relocated.
      </p>
      <Button asChild>
        <Link href="/">{t("backToHome")}</Link>
      </Button>
    </div>
  );
}
