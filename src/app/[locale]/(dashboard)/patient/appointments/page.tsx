import { PatientAppointmentsClient } from "@/features/appointments/PatientAppointmentsClient";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import ErrorBoundary from "@/components/common/error-boundary";

export default function PatientAppointmentsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            My Consultations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your scheduled clinic visits, video sessions, and consultation history.
          </p>
        </div>

        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/doctors">
            <Plus className="h-4 w-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      <ErrorBoundary>
        <PatientAppointmentsClient />
      </ErrorBoundary>
    </div>
  );
}
