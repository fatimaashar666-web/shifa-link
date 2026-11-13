
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Stethoscope,
} from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log critical application errors
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-12">

          <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl sm:p-12">

            {/* Healthcare Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle
                size={42}
                className="text-red-500"
              />
            </div>

            {/* Brand */}
            <div className="mb-5 flex items-center justify-center gap-2">
              <Stethoscope
                size={25}
                className="text-blue-600"
              />

              <h1 className="text-2xl font-bold text-blue-700">
                ShifaLink
              </h1>
            </div>

            {/* Error Heading */}
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              Critical Application Error
            </h2>

            {/* Description */}
            <p className="mb-6 text-sm leading-6 text-gray-500">
              Something unexpected happened while
              running ShifaLink. We apologize for
              the inconvenience. Please try again.
            </p>

            {/* Error Reference */}
            {error.digest && (
              <p className="mb-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                Error Reference: {error.digest}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">

              <button
                onClick={() => reset()}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <RefreshCw size={17} />
                Try Again
              </button>

              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <Home size={17} />
                Go to Home
              </button>

            </div>

            {/* Footer */}
            <p className="mt-10 text-xs text-gray-400">
              ShifaLink Healthcare Platform
            </p>

          </div>
        </main>
      </body>
    </html>
  );
}
