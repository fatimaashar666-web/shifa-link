import * as React from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Activity, ShieldCheck, HeartHandshake } from "lucide-react"

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer")
  const tNav = useTranslations("nav")

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" locale={locale} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Shifa<span className="text-blue-600">Link</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Encrypted & Privacy-First</span>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              {t("sections.services")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/doctors" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tNav("findDoctor")}
                </Link>
              </li>
              <li>
                <Link href="/lab-tests" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tNav("labTests")}
                </Link>
              </li>
              <li>
                <Link href="/radiology" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tNav("radiologyTests")}
                </Link>
              </li>
              <li>
                <Link href="/articles" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tNav("healthArticles")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Healthcare Providers */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              {t("sections.company")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/register-doctor" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tNav("registerDoctor")}
                </Link>
              </li>
              <li>
                <Link href="/contact" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Consent */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              {t("sections.support")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/patient-consent-info" locale={locale} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("consent")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShifaLink. {t("rights")}.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <HeartHandshake className="h-3.5 w-3.5 text-red-500" />
            <span>Dedicated to human-centered digital healthcare</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
