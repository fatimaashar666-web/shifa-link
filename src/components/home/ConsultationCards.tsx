import Image from "next/image";
import { ArrowRight, CalendarCheck, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";

const consultationOptions = [
  {
    title: "Secure Video Consultations",
    description:
      "Consult with qualified specialists from the convenience of your home with encrypted video links.",
    image: "/secure-video-consultations.png",
    imageAlt: "Patient having a video consultation with a doctor",
    buttonText: "Explore Telehealth",
    href: "/doctors",
    icon: Video,
    iconClassName: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    title: "In-Person Clinic Visits",
    description:
      "Book direct appointments with verified doctors at partner clinics with transparent time slots.",
    image: "/in-person-clinic-visits.png",
    imageAlt: "Doctor consulting with a patient at a clinic",
    buttonText: "Find a Clinic",
    href: "/doctors",
    icon: CalendarCheck,
    iconClassName: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  },
];

export default function ConsultationCards({ locale }: { locale: string }) {
  return (
    <div
      className="container mx-auto max-w-7xl px-4 sm:px-6"
      aria-label="Consultation options"
    >
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Flexible Healthcare Delivery
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Choose the consultation format that matches your clinical needs and comfort.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {consultationOptions.map((option) => (
          <Card
            key={option.title}
            className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/8] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={option.image}
                alt={option.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${option.iconClassName}`}
              >
                <option.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                {option.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                {option.description}
              </p>
              <Button size="sm" variant="outline" className="mt-6 w-fit gap-2" asChild>
                <Link href={option.href} locale={locale}>
                  {option.buttonText}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
