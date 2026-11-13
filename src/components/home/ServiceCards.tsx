
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const services = [
  { id: "doctors", image: "/doctor.jpg", link: "/doctors" },
  { id: "labs", image: "/labtests.jpg", link: "/lab-tests" },
  { id: "drive", image: "/drive.png", link: "/drive" },
] as const;

export default async function ServiceCards({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home" });

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
                alt={t(`services.${service.id}.title`)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                {t(`services.${service.id}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t(`services.${service.id}.description`)}
              </p>
              <Button
                size="sm"
                className="mt-6 w-full justify-between"
                asChild
              >
                <Link href={service.link} locale={locale}>
                  {t(`services.${service.id}.button`)}
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
