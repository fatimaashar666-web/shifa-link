"use client";

import { useState, useEffect } from "react";

interface Review {
  id: number;
  text: string;
  author: string;
  role: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    text: "Very good app.Well thought out about booking/rescheduling/cancelling an appointment. Also, Doctor's feedback mechanism is good and describes all the basics in a good way.",
    author: "Ayesha Khan",
    role: "Product Lead at Novatek",
  },
  {
    id: 2,
    text: "Clean interface, fast performance, very easy to book,maintain history.Hassle free from older versions of booking appointments via telephone.Thanks Shifalink for making it simple.",
    author: "Marcus Vance",
    role: "Founder at Studio North",
  },
  {
    id: 3,
    text: "Very helpful.Far easier than doing it manually.Allows you to see the available slots and book an appointment without having to call the clinic.Thank you for making it easy.",
    author: "Elena Rostova",
    role: "Head of Growth at Looma",
  },
];

export default function ReviewCarousel() {
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
      aria-label="Customer Reviews"
      className="mx-auto max-w-3xl px-6 py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
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
              {REVIEWS[current].text}
            </p>
          </blockquote>

          <div className="mt-6">
            <p className="font-semibold text-slate-900 dark:text-white">
              {REVIEWS[current].author}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{REVIEWS[current].role}</p>
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
          aria-label="Previous review"
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
              aria-label={`Go to review ${index + 1}`}
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
          aria-label="Next review"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
}
