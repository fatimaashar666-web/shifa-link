
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const services = [
  {
    id: 1,
    title: "Find Doctors Near You",
    description: "Confirmed appointments",
    image: "/doctor.jpg",
    buttonText: "Find Doctors",
    link: "/doctors",
  },
  {
    id: 2,
    title: "Lab Tests",
    description: "Safe and trusted lab tests",
    image: "/labtests.jpg",
    buttonText: "Book a Test",
    link: "/lab-tests",
  },
  {
    id: 3,
    title: "Shifa Link Drive",
    description: "Connect within 60 seconds",
    image: "/drive.png",
    buttonText: "Learn More",
    link: "/about",
  }
];

export default function ServiceCards({ locale }: { locale: string }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {service.description}
              </p>
              <Button
                size="sm"
                className="mt-6 w-full justify-between"
                asChild
              >
                <Link href={service.link} locale={locale}>
                  {service.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
