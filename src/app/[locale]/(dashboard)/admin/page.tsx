import { ShieldCheck } from "lucide-react";
import { AdminVerificationClient } from "@/features/admin/AdminVerificationClient";
import { AdminAuditLogsClient } from "@/features/admin/AdminAuditLogsClient";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          System Administration & QA Audit Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review provider license verification queues and query immutable system security audit logs (ADR-10).
        </p>
      </div>

      <div className="space-y-6">
        <AdminVerificationClient />
      </div>

      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Security Audit Trail Explorer
        </h2>
        <AdminAuditLogsClient />
      </div>
    </div>
  );
}
