import { HardDrive } from "lucide-react";
import { ShifaDriveClient } from "@/features/drive/ShifaDriveClient";

export default function PatientDrivePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-blue-600" />
          ShifaLink Drive
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Securely store, organize, and share your medical records. Files are encrypted at rest
          and never stored directly in the database.
        </p>
      </div>

      <ShifaDriveClient />
    </div>
  );
}
