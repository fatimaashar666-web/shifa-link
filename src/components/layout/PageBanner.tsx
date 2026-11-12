import Image from "next/image";
import type { ReactNode } from "react";

interface PageBannerProps {
  image: string;
  alt: string;
  heading: ReactNode;
  description: ReactNode;
}

export function PageBanner({ image, alt, heading, description }: PageBannerProps) {
  return (
    <section className="relative isolate min-h-[280px] overflow-hidden border-y border-sky-100 bg-sky-50 shadow-sm sm:min-h-[340px] dark:border-slate-800 dark:bg-slate-900">
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1280px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-white/85 to-white/10 dark:from-slate-950 dark:via-slate-950/85 dark:to-slate-950/10" />
      <div className="relative z-10 flex min-h-[280px] items-center px-6 py-10 text-left sm:min-h-[340px] sm:px-10 lg:px-14">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            {heading}
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-200">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
