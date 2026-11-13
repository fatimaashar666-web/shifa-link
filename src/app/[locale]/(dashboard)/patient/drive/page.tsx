import { getTranslations } from "next-intl/server";
import { HardDrive } from "lucide-react";
import { ShifaDriveClient } from "@/features/drive/ShifaDriveClient";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default async function PatientDrivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tDashboard = await getTranslations({ locale, namespace: "patientDashboard" });
  const tDrive = await getTranslations({ locale, namespace: "driveWorkspace" });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-blue-600" />
          {tDrive("title")}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {tDrive("description")}
        </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/patient" locale={locale}>{tDashboard("dashboardLink")}</Link>
        </Button>
      </div>

      <ShifaDriveClient />
    </div>
  );
}
