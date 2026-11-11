import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scan, Clock, MapPin } from "lucide-react";

export default function RadiologyPage() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const radiologyServices = [
    {
      id: "rad-1",
      title: "Chest X-Ray (PA & Lateral)",
      modality: "Digital Radiography",
      description: "Standard diagnostic imaging for lung fields, cardiac silhouette, and thoracic skeletal structures.",
      preparation: "Wear comfortable clothing without metallic fasteners or jewelry.",
      turnaround: "Report available same day",
      location: "Central Diagnostic Center",
      price: "Rs. 1,500",
    },
    {
      id: "rad-2",
      title: "Abdominal & Pelvic Ultrasound",
      modality: "Diagnostic Ultrasound",
      description: "High-resolution sonography of liver, gallbladder, kidneys, spleen, pancreas, and bladder.",
      preparation: "Fasting 6-8 hours; full bladder required before scan.",
      turnaround: "Immediate preliminary review + final report in 4 hours",
      location: "Al-Shifa Imaging Hub",
      price: "Rs. 2,800",
    },
    {
      id: "rad-3",
      title: "Brain MRI (Without Contrast)",
      modality: "Magnetic Resonance Imaging (1.5T)",
      description: "Detailed soft-tissue neuroimaging for headaches, neurological symptoms, or cranial trauma evaluation.",
      preparation: "Safety questionnaire mandatory. No metallic implants.",
      turnaround: "Detailed report within 24 hours",
      location: "Advanced Neuro Imaging Suite",
      price: "Rs. 9,500",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tNav("radiologyTests")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Schedule diagnostic imaging services including X-Rays, Ultrasounds, CT Scans, and MRIs with certified partner radiology centers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {radiologyServices.map((service) => (
          <Card key={service.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                  <Scan className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {service.modality}
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
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{service.location}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 p-6">
              <div className="font-bold text-slate-900 dark:text-white text-base">
                {service.price}
              </div>
              <Button asChild size="sm">
                <Link href={`/login?redirect=/radiology/${service.id}`}>
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
