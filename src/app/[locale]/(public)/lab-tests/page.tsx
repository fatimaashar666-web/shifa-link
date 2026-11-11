import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, Clock, Home, AlertCircle } from "lucide-react";
import { searchServices } from "@/server/services/diagnostic.service";

export default async function LabTestsPage() {
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  let labServices: Awaited<ReturnType<typeof searchServices>> = [];
  let fetchError = false;

  try {
    labServices = await searchServices({ type: "LAB" });
  } catch {
    fetchError = true;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tNav("labTests")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Book certified laboratory tests with transparent pricing, certified phlebotomy sample
          collection, and digital reports delivered securely to your ShifaLink Drive.
        </p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Unable to load services at this time. Please try again shortly.</span>
        </div>
      )}

      {!fetchError && labServices.length === 0 && (
        <p className="text-sm text-slate-500">No lab services available yet. Check back soon.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {labServices.map((service) => {
          const lowestPrice =
            service.locations.length > 0
              ? Math.min(...service.locations.map((l) => Number(l.price) ?? service.basePrice))
              : Number(service.basePrice);

          const homeCollectionAvailable = Boolean(service.homeCollection);

          return (
            <Card key={service.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ISO-15189 Certified
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold">{service.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {service.description ?? "Certified diagnostic laboratory test."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs text-slate-600 dark:text-slate-400">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 space-y-1.5">
                  {service.turnaroundHours != null && (
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>Report within {service.turnaroundHours} hours</span>
                    </div>
                  )}
                  {homeCollectionAvailable && (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                      <Home className="h-3.5 w-3.5" />
                      <span>Home Sample Collection Available</span>
                    </div>
                  )}
                  {service.category && (
                    <p className="text-xs text-slate-500 capitalize">{service.category}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 p-6">
                <div className="font-bold text-slate-900 dark:text-white text-base">
                  Rs. {lowestPrice.toLocaleString()}
                </div>
                <Button asChild size="sm">
                  <Link href={`/login?redirect=/lab-tests/${service.id}`}>
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
