"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "ur", name: "اردو", dir: "rtl" },
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "de", name: "Deutsch", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "ja", name: "日本語", dir: "ltr" },
]

export function LangSelector() {
  const currentLocale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleSelect = (locale: string) => {
    router.replace(pathname, { locale })
  }

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold">{currentLang.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span dir={lang.dir}>{lang.name}</span>
            {currentLocale === lang.code && (
              <span className="text-xs text-blue-600 font-bold ml-2">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
