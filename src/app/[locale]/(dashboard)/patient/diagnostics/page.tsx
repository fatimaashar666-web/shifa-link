import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { FlaskConical, Plus } from "lucide-react";
import { PatientDiagnosticsClient } from "@/features/diagnostics/PatientDiagnosticsClient";
import ErrorBoundary from "@/components/common/error-boundary";

export default function PatientDiagnosticsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-emerald-600" />
            My Diagnostic Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your lab tests, radiology scans, and diagnostic report status.
          </p>
        </div>

        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/lab-tests">
            <Plus className="h-4 w-4" />
            Book Lab Test
          </Link>
        </Button>
      </div>

      <ErrorBoundary>
        <PatientDiagnosticsClient />
      </ErrorBoundary>
    </div>
  );
}
