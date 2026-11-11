"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Building2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface AppointmentItem {
  id: string;
  status: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  appointmentType: "IN_PERSON" | "VIDEO";
  scheduledAt: string;
  endAt: string;
  reason?: string | null;
  doctor: {
    id: string;
    fullName: string;
    consultationFee: number;
    primarySpecialty?: string;
  };
  location: {
    id: string;
    name: string;
    address?: string | null;
    city: string;
    isVirtual: boolean;
  };
  cancellationReason?: string | null;
  createdAt: string;
}

export function PatientAppointmentsClient() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "PAST" | "CANCELLED">("UPCOMING");

  const loadAppointments = useCallback(() => {
    fetch("/api/v1/appointments")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      })
      .then((data) => {
        setAppointments(data.appointments ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setAppointments([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function handleCancelSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cancellingId || !cancelReason.trim()) return;

    setSubmittingCancel(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/v1/appointments/${cancellingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          reason: cancelReason.trim(),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setErrorMsg(json.message || "Failed to cancel appointment");
        setSubmittingCancel(false);
        return;
      }

      setCancellingId(null);
      setCancelReason("");
      setSubmittingCancel(false);
      loadAppointments();
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
      setSubmittingCancel(false);
    }
  }

  const now = new Date();

  const filteredAppointments = appointments.filter((apt) => {
    const aptTime = new Date(apt.scheduledAt);
    if (filter === "ALL") return true;
    if (filter === "CANCELLED") return apt.status === "CANCELLED";
    if (filter === "UPCOMING") return aptTime >= now && apt.status !== "CANCELLED";
    if (filter === "PAST") return aptTime < now || apt.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(["UPCOMING", "ALL", "PAST", "CANCELLED"] as const).map((tab) => (
          <Button
            key={tab}
            variant={filter === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab)}
            className="text-xs capitalize"
          >
            {tab.toLowerCase()}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading your appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
          <Calendar className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No {filter.toLowerCase()} appointments found
          </h3>
          <p className="text-xs text-slate-500">
            Search our doctor directory to book a new in-person or video consultation.
          </p>
          <Button asChild size="sm">
            <Link href="/doctors">Find a Doctor</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const dateObj = new Date(apt.scheduledAt);
            const isCancelled = apt.status === "CANCELLED";
            const isPast = dateObj < now;

            return (
              <Card key={apt.id} className="shadow-sm border border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                          {apt.doctor.fullName}
                        </CardTitle>
                        {apt.doctor.primarySpecialty && (
                          <Badge variant="secondary" className="text-xs">
                            {apt.doctor.primarySpecialty}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {apt.appointmentType === "VIDEO" ? (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Video className="h-3.5 w-3.5" /> Telehealth Video Call
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Building2 className="h-3.5 w-3.5" /> In-Person Clinic Visit
                          </span>
                        )}
                        <span>•</span>
                        <span>Rs. {apt.doctor.consultationFee.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isCancelled
                            ? "destructive"
                            : apt.status === "COMPLETED"
                            ? "secondary"
                            : "default"
                        }
                        className="text-xs"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>
                        {dateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {apt.location.name} ({apt.location.city})
                      </span>
                    </div>
                  </div>

                  {apt.reason && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Reason: </span>
                      {apt.reason}
                    </div>
                  )}

                  {isCancelled && apt.cancellationReason && (
                    <div className="rounded-md bg-rose-50 dark:bg-rose-950/20 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                      <span className="font-semibold">Cancellation reason: </span>
                      {apt.cancellationReason}
                    </div>
                  )}

                  {!isCancelled && !isPast && (
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCancellingId(apt.id);
                          setCancelReason("");
                          setErrorMsg(null);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Cancel Appointment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal Dialog */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Cancel Consultation
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to cancel this scheduled appointment? This action cannot be undone and will release the slot.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, feeling better, rescheduled with another physician..."
                  className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {errorMsg && (
                <div className="rounded-md bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancellingId(null)}
                >
                  Keep Appointment
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={submittingCancel}
                >
                  {submittingCancel ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Cancelling...
                    </span>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
