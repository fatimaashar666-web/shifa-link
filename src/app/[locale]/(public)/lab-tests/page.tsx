import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, Clock, Home } from "lucide-react";

export default function LabTestsPage() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const labServices = [
    {
      id: "lab-1",
      title: "Complete Blood Count (CBC)",
      description: "Comprehensive panel measuring white blood cells, red blood cells, hemoglobin, and platelets.",
      preparation: "No fasting required. Routine sample collection.",
      turnaround: "Report within 12 hours",
      homeCollection: true,
      price: "Rs. 950",
    },
    {
      id: "lab-2",
      title: "Fasting Blood Glucose & HbA1c",
      description: "Standard screening and monitoring panel for diabetes and pre-diabetic metabolic health.",
      preparation: "Strict 8-10 hour overnight fasting required.",
      turnaround: "Report within 6 hours",
      homeCollection: true,
      price: "Rs. 1,600",
    },
    {
      id: "lab-3",
      title: "Lipid Profile (Cholesterol Panel)",
      description: "Evaluates cardiovascular risk assessing Total Cholesterol, HDL, LDL, and Triglycerides.",
      preparation: "10-12 hours fasting required. Water permitted.",
      turnaround: "Report within 24 hours",
      homeCollection: true,
      price: "Rs. 1,400",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tNav("labTests")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Book certified laboratory tests with transparent pricing, certified phlebotomy sample collection, and digital reports delivered securely to your ShifaLink Drive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {labServices.map((service) => (
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
              <CardTitle className="text-base font-semibold">{service.title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                {service.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0 text-xs text-slate-600 dark:text-slate-400">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  <span>{service.turnaround}</span>
                </div>
                <p className="text-xs text-slate-500">{service.preparation}</p>
                {service.homeCollection && (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                    <Home className="h-3.5 w-3.5" />
                    <span>Home Sample Collection Available</span>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 p-6">
              <div className="font-bold text-slate-900 dark:text-white text-base">
                {service.price}
              </div>
              <Button asChild size="sm">
                <Link href={`/login?redirect=/lab-tests/${service.id}`}>
                  {tCommon("bookNow")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
