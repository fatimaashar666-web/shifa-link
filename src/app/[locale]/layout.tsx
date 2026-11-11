import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, isRtlLocale, type Locale } from "@/i18n/routing";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SupportChatWidget } from "@/components/ai/SupportChatWidget";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isRtl = isRtlLocale(locale);

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="shifalink-theme"
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
            <SupportChatWidget />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
