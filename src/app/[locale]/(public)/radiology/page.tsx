import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/layout/PageBanner";
import { Scan, Clock, MapPin, AlertCircle } from "lucide-react";
import { searchServices } from "@/server/services/diagnostic.service";

export default async function RadiologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {radiologyServices.map((service) => {
          const lowestPrice =
            service.locations.length > 0
              ? Math.min(...service.locations.map((l) => Number(l.price) ?? Number(service.basePrice)))
              : Number(service.basePrice);

          const orgName = service.locations[0]?.organization?.name ?? "Partner Center";

          return (
            <Card key={service.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                    <Scan className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {service.category}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold">{service.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {service.description ?? tDiagnostics("certifiedImagingService")}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs text-slate-600 dark:text-slate-400">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 space-y-1.5">
                  {service.turnaroundHours != null && (
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>
                        {service.turnaroundHours <= 24
                          ? tDiagnostics("sameDayReport")
                          : tDiagnostics("reportWithinDays", { days: Math.ceil(service.turnaroundHours / 24) })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{orgName}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 p-6">
                <div className="font-bold text-slate-900 dark:text-white text-base">
                  Rs. {lowestPrice.toLocaleString()}
                </div>
                <Button asChild size="sm">
                  <Link href={`/login?redirect=/radiology/${service.id}`}>
                    {tCommon("bookNow")}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        </div>
    </div>
  );
}
