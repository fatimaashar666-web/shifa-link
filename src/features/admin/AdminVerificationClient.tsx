"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";

interface DoctorItem {
  id: string;
  fullName: string;
  licenseNumber: string;
  verificationStatus: string;
  user: { email: string; createdAt: string };
  specialties: Array<{ specialty: { name: string } }>;
}

interface OrgItem {
  id: string;
  name: string;
  type: string;
  status: string;
}

export function AdminVerificationClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [organizations, setOrganizations] = useState<OrgItem[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadQueue = useCallback(() => {
    fetch("/api/v1/admin/verification-queue")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load queue.");
        return res.json();
      })
      .then((data: { doctors?: DoctorItem[]; organizations?: OrgItem[] }) => {
        setDoctors(data.doctors ?? []);
        setOrganizations(data.organizations ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error loading queue.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleVerifyDoctor = async (doctorProfileId: string, status: "VERIFIED" | "REJECTED") => {
    setProcessingId(doctorProfileId);
    try {
      const res = await fetch("/api/v1/admin/verification-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorProfileId, status }),
      });
      if (!res.ok) throw new Error("Update failed.");
      setDoctors((prev) => prev.filter((d) => d.id !== doctorProfileId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Verification error.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyOrg = async (organizationId: string, status: "ACTIVE" | "SUSPENDED") => {
    setProcessingId(organizationId);
    try {
      const res = await fetch("/api/v1/admin/verification-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, status }),
      });
      if (!res.ok) throw new Error("Update failed.");
      setOrganizations((prev) => prev.filter((o) => o.id !== organizationId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Verification error.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Doctors Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Doctors Awaiting Credential Verification ({doctors.length})
          </h2>
        </div>

        {doctors.length === 0 ? (
          <Card className="py-8 text-center text-xs text-slate-400">
            No doctors currently pending verification.
          </Card>
        ) : (
          <div className="space-y-3">
            {doctors.map((doc) => (
              <Card key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      Dr. {doc.fullName}
                    </p>
                    <Badge variant="outline" className="text-[10px]">
                      License: {doc.licenseNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {doc.user.email} • Registered {new Date(doc.user.createdAt).toLocaleDateString()}
                  </p>
                  {doc.specialties.length > 0 && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400">
                      {doc.specialties.map((s) => s.specialty.name).join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={processingId === doc.id}
                    onClick={() => handleVerifyDoctor(doc.id, "VERIFIED")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    disabled={processingId === doc.id}
                    onClick={() => handleVerifyDoctor(doc.id, "REJECTED")}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Organizations Queue */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          Diagnostic Centers Awaiting Approval ({organizations.length})
        </h2>

        {organizations.length === 0 ? (
          <Card className="py-8 text-center text-xs text-slate-400">
            No diagnostic organizations pending verification.
          </Card>
        ) : (
          <div className="space-y-3">
            {organizations.map((org) => (
              <Card key={org.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {org.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {org.type}
                    </Badge>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="h-3 w-3" />
                      Pending Review
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={processingId === org.id}
                    onClick={() => handleVerifyOrg(org.id, "ACTIVE")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve Facility
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
