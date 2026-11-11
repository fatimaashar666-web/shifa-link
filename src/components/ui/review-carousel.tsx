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
    text: "This platform completely transformed how our team ships projects. Setup took minutes and support has been phenomenal.",
    author: "Ayesha Khan",
    role: "Product Lead at Novatek",
  },
  {
    id: 2,
    text: "Clean interface, fast performance, and zero bloat. Easily the best investment we made for our workflow this year.",
    author: "Marcus Vance",
    role: "Founder at Studio North",
  },
  {
    id: 3,
    text: "Our conversion rate jumped within the first two weeks of launching. Customers consistently mention how smooth the experience feels.",
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

  // Optional auto-play every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [current, isPaused]);

  return (
    <section
      aria-label="Customer Reviews"
      className="mx-auto max-w-3xl px-6 py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-2xl border border-gray-200 bg-white px-8 py-12 shadow-sm sm:px-16">
        {/* Opening Quotation Mark */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-4 left-6 select-none font-serif text-7xl leading-none text-indigo-200 sm:text-8xl"
        >
          &ldquo;
        </span>

        {/* Review Content */}
        <div className="relative z-10 text-center">
          <blockquote className="min-h-[110px] flex items-center justify-center">
            <p className="text-lg font-medium leading-relaxed text-gray-800 sm:text-xl">
              {REVIEWS[current].text}
            </p>
          </blockquote>

          <div className="mt-6">
            <p className="font-semibold text-gray-900">
              {REVIEWS[current].author}
            </p>
            <p className="text-sm text-gray-500">{REVIEWS[current].role}</p>
          </div>
        </div>

        {/* Closing Quotation Mark */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-6 bottom-0 select-none font-serif text-7xl leading-none text-indigo-200 sm:text-8xl"
        >
          &rdquo;
        </span>
      </div>

      {/* Controls: Prev / Dots / Next */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={prevSlide}
          aria-label="Previous review"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100"
        >
          &#8592;
        </button>

        <div className="flex gap-2">
          {REVIEWS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Go to review ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                current === index
                  ? "w-6 bg-indigo-600"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          aria-label="Next review"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
}