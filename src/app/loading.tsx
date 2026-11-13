
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center gap-5">

        {/* Loading Spinner */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

          <div className="h-6 w-6 rounded-full bg-blue-600" />
        </div>

        {/* Brand Name */}
        <h2 className="text-2xl font-bold tracking-wide text-blue-700">
          ShifaLink
        </h2>

        {/* Loading Message */}
        <p className="text-sm font-medium text-gray-500">
          Loading, please wait...
        </p>

        {/* Animated Dots */}
        <div className="flex gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms]" />
        </div>

      </div>
    </div>
  );
}
