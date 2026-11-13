"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Review {
  id: number;
}

const REVIEWS: Review[] = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
];

export default function ReviewCarousel() {
  const t = useTranslations("reviews");
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      aria-label={t("ariaLabel")}
      className="mx-auto max-w-3xl px-6 py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t("title")}
        </h2>
      </div>
      <div className="relative rounded-2xl border border-slate-200 bg-white px-8 py-12 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-16">
        {/* Opening Quotation Mark */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-4 left-6 select-none font-serif text-7xl leading-none text-indigo-200 dark:text-indigo-400/40 sm:text-8xl"
        >
          &ldquo;
        </span>

        {/* Review Content */}
        <div className="relative z-10 text-center" aria-live="polite">
          <blockquote className="flex min-h-[110px] items-center justify-center">
            <p className="text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-100 sm:text-xl">
              {t(`items.${REVIEWS[current].id}.text`)}
            </p>
          </blockquote>

          <div className="mt-6">
            <p className="font-semibold text-slate-900 dark:text-white">
              {t(`items.${REVIEWS[current].id}.author`)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(`items.${REVIEWS[current].id}.role`)}
            </p>
          </div>
        </div>

        {/* Closing Quotation Mark */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-6 bottom-0 select-none font-serif text-7xl leading-none text-indigo-200 dark:text-indigo-400/40 sm:text-8xl"
        >
          &rdquo;
        </span>
      </div>

      {/* Controls: Prev / Dots / Next */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prevSlide}
          aria-label={t("previous")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          &#8592;
        </button>

        <div className="flex gap-2">
          {REVIEWS.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={t("goTo", { number: index + 1 })}
              aria-pressed={current === index}
              className={`h-2.5 rounded-full transition-all ${
                current === index
                  ? "w-6 bg-indigo-600"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          aria-label={t("next")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
}
