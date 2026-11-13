import type { ReactNode } from "react";
import { isRtlLocale, routing, type Locale } from "@/i18n/routing";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "@/styles/globals.css";

export default function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  return <RootDocument params={params}>{children}</RootDocument>;
}

async function RootDocument({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;

  return (
    <html lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="shifalink-theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
