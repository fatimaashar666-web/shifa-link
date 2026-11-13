
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({
  error,
  reset,
}: ErrorProps) {

  useEffect(() => {
    // Log the error for debugging
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10">

        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle
            size={42}
            className="text-red-500"
          />
        </div>

        {/* Brand */}
        <h1 className="mb-2 text-2xl font-bold text-blue-700">
          ShifaLink
        </h1>

        {/* Error Heading */}
        <h2 className="mb-3 text-2xl font-bold text-gray-800">
          Something Went Wrong!
        </h2>

        {/* Description */}
        <p className="mb-8 text-sm leading-6 text-gray-500">
          We encountered an unexpected problem while
          loading this page. Please try again.
        </p>

        {/* Error Digest */}
        {error.digest && (
          <p className="mb-5 text-xs text-gray-400">
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

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            <Home size={17} />
            Go Home
          </Link>

        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400">
          ShifaLink Healthcare Platform
        </p>

      </div>
    </div>
  );
}
