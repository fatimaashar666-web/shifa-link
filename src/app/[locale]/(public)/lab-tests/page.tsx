import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { PageBanner } from "@/components/layout/PageBanner";
import { AlertCircle } from "lucide-react";
import { searchServices } from "@/server/services/diagnostic.service";
import { verifySession } from "@/server/auth/session";
import { DiagnosticCatalogClient, type DiagnosticCatalogItem } from "@/features/diagnostics/DiagnosticCatalogClient";
import { getDiagnosticServiceTranslation } from "@/lib/diagnostics/localization";

export const dynamic = "force-dynamic";

export default async function LabTestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tDiagnostics = await getTranslations({ locale, namespace: "diagnostics" });
  const sessionToken = (await cookies()).get("shifalink-session")?.value;
  const session = sessionToken ? await verifySession(sessionToken) : null;

  let labServices: Awaited<ReturnType<typeof searchServices>> = [];
  let fetchError = false;

  try {
    labServices = await searchServices({ type: "LAB" });
  } catch {
    fetchError = true;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <PageBanner
        image="/lab-tests.png"
        alt={tDiagnostics("labImageAlt")}
        heading={tNav("labTests")}
        description={tDiagnostics("labDescription")}
      />

        {fetchError && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{tDiagnostics("loadError")}</span>
        </div>
        )}

        {!fetchError && labServices.length === 0 && (
        <p className="text-sm text-slate-500">{tDiagnostics("noLabServices")}</p>
        )}

        <DiagnosticCatalogClient
          type="LAB"
          canUseCart={Boolean(session)}
          items={labServices.map((service): DiagnosticCatalogItem => {
            const localized = getDiagnosticServiceTranslation(service.translations, locale);
            return {
              id: service.id,
              code: service.code,
              name: localized?.name ?? service.name,
              category: localized?.category ?? service.category,
              description: localized?.description ?? (localized ? localized.shortDescription : service.description),
              shortDescription: localized?.shortDescription ?? service.shortDescription,
              turnaroundHours: service.turnaroundHours,
              homeCollection: service.homeCollection,
              basePrice: service.locations.length > 0
                ? Math.min(...service.locations.map((location) => Number(location.price)))
                : service.basePrice === null ? null : Number(service.basePrice),
              providerName: service.locations[0]?.organization.name ?? null,
              organizationId: service.locations[0]?.organizationId ?? null,
              type: "LAB",
            };
          })}
          labels={{
            addToCart: tDiagnostics("addToCart"),
            addedToCart: tDiagnostics("addedToCart"),
            cart: tDiagnostics("cart"),
            checkout: tDiagnostics("checkout"),
            continueShopping: tDiagnostics("continueShopping"),
            priceOnRequest: tDiagnostics("priceOnRequest"),
            provider: tDiagnostics("provider"),
            remove: tDiagnostics("remove"),
            reportWithinHours: tDiagnostics("reportWithinHours", { hours: "{hours}" }),
            homeCollectionAvailable: tDiagnostics("homeCollectionAvailable"),
            paymentNotice: tDiagnostics("paymentNotice"),
            cartEmpty: tDiagnostics("cartEmpty"),
            test: tDiagnostics("test"),
            tests: tDiagnostics("tests"),
            subtotal: tDiagnostics("subtotal"),
            close: tDiagnostics("close"),
            certifiedService: tDiagnostics("certifiedService"),
          }}
        />
    </div>
  );
}
