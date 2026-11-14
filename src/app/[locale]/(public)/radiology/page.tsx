import { getTranslations } from "next-intl/server";
import { PageBanner } from "@/components/layout/PageBanner";
import { AlertCircle } from "lucide-react";
import { searchServices } from "@/server/services/diagnostic.service";
import { DiagnosticCatalogClient, type DiagnosticCatalogItem } from "@/features/diagnostics/DiagnosticCatalogClient";

export default async function RadiologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tDiagnostics = await getTranslations({ locale, namespace: "diagnostics" });

  let radiologyServices: Awaited<ReturnType<typeof searchServices>> = [];
  let fetchError = false;

  try {
    radiologyServices = await searchServices({ type: "RADIOLOGY" });
  } catch {
    fetchError = true;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <PageBanner
        image="/radiology-tests.png"
        alt={tDiagnostics("radiologyImageAlt")}
        heading={tNav("radiologyTests")}
        description={tDiagnostics("radiologyDescription")}
      />

        {fetchError && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{tDiagnostics("loadError")}</span>
        </div>
        )}

        {!fetchError && radiologyServices.length === 0 && (
        <p className="text-sm text-slate-500">{tDiagnostics("noRadiologyServices")}</p>
        )}

        <DiagnosticCatalogClient
          type="RADIOLOGY"
          items={radiologyServices.map((service): DiagnosticCatalogItem => ({
            id: service.id,
            code: service.code,
            name: service.name,
            category: service.category,
            description: service.description,
            shortDescription: service.shortDescription,
            turnaroundHours: service.turnaroundHours,
            homeCollection: service.homeCollection,
            basePrice: service.locations.length > 0
              ? Math.min(...service.locations.map((location) => Number(location.price)))
              : service.basePrice === null ? null : Number(service.basePrice),
            providerName: service.locations[0]?.organization.name ?? null,
            organizationId: service.locations[0]?.organizationId ?? null,
            type: "RADIOLOGY",
          }))}
          labels={{
            addToCart: "Add to cart",
            addedToCart: "Added to cart",
            cart: "Cart",
            checkout: "Continue to payment",
            continueShopping: "Continue shopping",
            priceOnRequest: "Price on request",
            provider: "Provider",
            remove: "Remove",
            reportWithinHours: "Report within {hours} hours",
            homeCollectionAvailable: tDiagnostics("homeCollectionAvailable"),
            paymentNotice: "Some tests have no published price yet. The provider will confirm the price before payment.",
            cartEmpty: "Add a test to start your cart.",
          }}
        />
    </div>
  );
}
