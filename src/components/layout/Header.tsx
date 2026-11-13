"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import { Activity, ChevronDown, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { LangSelector } from "./LangSelector"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MenuLink = { href: string; label: string }
type NavigationItem =
  | { key: string; href: string; label: string }
  | { key: string; label: string; items: MenuLink[] }

export function Header() {
  const t = useTranslations("nav")
  const tFooter = useTranslations("footer")
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navItems: NavigationItem[] = [
    { key: "home", href: "/", label: t("home") },
    { key: "doctors", href: "/doctors", label: t("findDoctor") },
    {
      key: "tests",
      label: t("tests"),
      items: [
        { href: "/lab-tests", label: t("labTests") },
        { href: "/radiology", label: t("radiologyTests") },
      ],
    },
    { key: "drive", href: "/drive", label: t("drive") },
    { key: "articles", href: "/articles", label: t("healthArticles") },
    {
      key: "company-info",
      label: t("aboutAndContact"),
      items: [
        { href: "/about", label: t("about") },
        { href: "/contact", label: t("contact") },
        { href: "/privacy-policy", label: tFooter("privacy") },
        { href: "/terms-of-service", label: tFooter("terms") },
        { href: "/patient-consent-info", label: tFooter("consent") },
      ],
    },
  ]

  function isActive(item: NavigationItem) {
    return "items" in item
      ? item.items.some((child) => pathname === child.href)
      : pathname === item.href
  }

  function renderNavigationItem(item: NavigationItem, mobile = false) {
    const active = isActive(item)
    const className = mobile
      ? cn(
          "w-full justify-between rounded-md px-3 py-2 text-sm font-medium",
          active
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
        )
      : cn(
          "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400",
          active
            ? "text-blue-600 font-semibold dark:text-blue-400"
            : "text-slate-600 dark:text-slate-300",
        )

    if ("items" in item) {
      return (
        <DropdownMenu key={item.key}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={mobile ? "sm" : "default"} className={className}>
              {item.label}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={mobile ? "start" : "center"}>
            {item.items.map((child) => (
              <DropdownMenuItem key={child.href} asChild>
                <Link href={child.href} onClick={() => setMobileMenuOpen(false)}>
                  {child.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <Link
        key={item.key}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={className}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Shifa<span className="text-blue-600">Link</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => renderNavigationItem(item))}
        </nav>

        {/* Right Actions: Lang, Theme, Login, Register */}
        <div className="hidden lg:flex items-center gap-2.5">
          <LangSelector />
          <ThemeToggle />
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">{t("register")}</Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-1.5">
          <LangSelector />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => renderNavigationItem(item, true))}
          </nav>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Button variant="outline" asChild className="w-full justify-center">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                {t("login")}
              </Link>
            </Button>
            <Button asChild className="w-full justify-center">
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                {t("register")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
