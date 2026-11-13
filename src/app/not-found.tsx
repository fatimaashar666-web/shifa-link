
import Link from "next/link";
import { Home, Search, Stethoscope } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg sm:p-12">

        {/* Healthcare Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Stethoscope
            size={42}
            className="text-blue-600"
          />
        </div>

        {/* Brand Name */}
        <h1 className="mb-4 text-2xl font-bold text-blue-700">
          ShifaLink
        </h1>

        {/* 404 */}
        <h2 className="text-7xl font-extrabold tracking-tight text-blue-600">
          404
        </h2>

        {/* Heading */}
        <h3 className="mt-5 text-2xl font-bold text-gray-800">
          Page Not Found!
        </h3>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
          Sorry, the page you are looking for doesn't
          exist, may have been moved, or is temporarily
          unavailable.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <Link
            href="/find-doctor"
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            <Search size={18} />
            Find a Doctor
          </Link>

        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-gray-400">
          ShifaLink Healthcare Platform
        </p>

      </div>
    </main>
  );
}
