import { Stethoscope } from "lucide-react";
import { DoctorClinicalSummaryClient } from "@/features/doctor/DoctorClinicalSummaryClient";

interface ClinicalSummaryPageProps {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function DoctorClinicalSummaryPage({ searchParams }: ClinicalSummaryPageProps) {
  const { patientId } = await searchParams;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          Clinical Pre-Consultation Summary
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Evidence-based synthesis of patient-shared diagnostic reports, past records, and health trends.
        </p>
      </div>

      <DoctorClinicalSummaryClient patientId={patientId ?? "patient-seed-alpha-0000-000000000001"} />
    </div>
  );
}
