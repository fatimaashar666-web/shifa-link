import * as React from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Activity, ShieldCheck, HeartHandshake } from "lucide-react"

type SocialPlatform = "facebook" | "youtube" | "instagram" | "github" | "twitter"

const socialLinks: Array<{ label: string; href: string; platform: SocialPlatform }> = [
  { label: "Facebook", href: "https://www.facebook.com/shifalink", platform: "facebook" },
  { label: "YouTube", href: "https://www.youtube.com/@shifalink", platform: "youtube" },
  { label: "Instagram", href: "https://www.instagram.com/shifalink", platform: "instagram" },
  { label: "GitHub", href: "https://github.com/Shifalink/shifalink", platform: "github" },
  { label: "Twitter", href: "https://twitter.com/shifalink", platform: "twitter" },
]

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const commonProps = {
    "aria-hidden": true,
    className: "h-4 w-4",
    fill: "currentColor",
    viewBox: "0 0 24 24",
  }

  switch (platform) {
    case "facebook":
      return <svg {...commonProps}><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.01 10.125 11.927v-8.432H7.078v-3.495h3.047V9.414c0-3.025 1.791-4.7 4.533-4.7 1.312 0 2.686.236 2.686.236v2.979h-1.514c-1.491 0-1.956.931-1.956 1.887v2.257h3.328l-.532 3.495h-2.796V24C19.612 23.083 24 18.098 24 12.073Z" /></svg>
    case "youtube":
      return <svg {...commonProps}><path d="M23.498 6.186a2.997 2.997 0 0 0-2.109-2.118C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.389.568A2.997 2.997 0 0 0 .502 6.186 31.27 31.27 0 0 0 0 12a31.27 31.27 0 0 0 .502 5.814 2.997 2.997 0 0 0 2.109 2.118C4.495 20.5 12 20.5 12 20.5s7.505 0 9.389-.568a2.997 2.997 0 0 0 2.109-2.118A31.27 31.27 0 0 0 24 12a31.27 31.27 0 0 0-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" /></svg>
    case "instagram":
      return <svg {...commonProps}><path fillRule="evenodd" d="M7.5 1.5h9A6 6 0 0 1 22.5 7.5v9a6 6 0 0 1-6 6h-9a6 6 0 0 1-6-6v-9a6 6 0 0 1 6-6Zm0 2A4 4 0 0 0 3.5 7.5v9a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4v-9a4 4 0 0 0-4-4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" clipRule="evenodd" /></svg>
    case "github":
      return <svg {...commonProps}><path d="M12 .297a12 12 0 0 0-3.793 23.385c.6.111.82-.261.82-.58 0-.287-.01-1.047-.016-2.055-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.086 1.839 1.237 1.839 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.776.419-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.47 11.47 0 0 1 6.006 0c2.292-1.552 3.3-1.23 3.3-1.23.652 1.653.241 2.873.117 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.623-5.476 5.92.43.372.813 1.103.813 2.223 0 1.605-.015 2.897-.015 3.292 0 .322.216.697.825.578A12 12 0 0 0 12 .297Z" /></svg>
    case "twitter":
      return <svg {...commonProps}><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723 10.05 10.05 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.384 4.482A13.98 13.98 0 0 1 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417A9.867 9.867 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.01-7.504 14.01-14.01 0-.213-.005-.426-.015-.637a10.012 10.012 0 0 0 2.41-2.535Z" /></svg>
  }
}

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
              <span>{t("privacyBadge")}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`ShifaLink on ${social.label}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-blue-900 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                >
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
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
            <span>{t("mission")}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
