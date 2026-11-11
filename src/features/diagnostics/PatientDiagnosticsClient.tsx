"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Scan, Loader2, AlertCircle, XCircle, CheckCircle2, Clock } from "lucide-react";

interface DiagnosticBooking {
  id: string;
  bookingNumber: string;
  status: string;
  serviceName?: string;
  service?: { name: string; type: string };
  organization?: { name: string };
  scheduledAt: string;
  isHomeCollection: boolean;
  totalAmount: number;
  cancellationReason?: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  REQUESTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  SAMPLE_COLLECTED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  PROCESSING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function PatientDiagnosticsClient() {
  const [bookings, setBookings] = useState<DiagnosticBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = useCallback(() => {
    fetch("/api/v1/diagnostic-bookings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load bookings.");
        return res.json();
      })
      .then((data: { bookings?: DiagnosticBooking[] }) => {
        setBookings(data.bookings ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load your bookings.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleCancel(bookingId: string) {
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/v1/diagnostic-bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by patient" }),
      });
      if (!res.ok) throw new Error("Failed to cancel.");
      await loadBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <FlaskConical className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500">No diagnostic bookings yet.</p>
        <p className="text-xs text-slate-400">
          Book a lab test or radiology scan from the services catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const serviceType = booking.service?.type ?? "";
        const Icon = serviceType === "RADIOLOGY" ? Scan : FlaskConical;
        const iconColor =
          serviceType === "RADIOLOGY"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400";

        const isCancellable =
          booking.status !== "CANCELLED" && booking.status !== "COMPLETED";

        return (
          <Card key={booking.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {booking.service?.name ?? "Diagnostic Test"}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {booking.organization?.name ?? "Partner Center"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] font-medium shrink-0 ${STATUS_STYLES[booking.status] ?? ""}`}
                >
                  {booking.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pb-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>
                  {new Date(booking.scheduledAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              {booking.isHomeCollection && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Home sample collection</span>
                </div>
              )}
              <p className="text-[10px] text-slate-400">Ref: {booking.bookingNumber}</p>
              {booking.status === "CANCELLED" && booking.cancellationReason && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Reason: {booking.cancellationReason}
                </p>
              )}
            </CardContent>

            <CardFooter className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Rs. {booking.totalAmount.toLocaleString()}
              </span>
              {isCancellable && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800/40 dark:hover:bg-red-900/20"
                  onClick={() => void handleCancel(booking.id)}
                  disabled={cancellingId === booking.id}
                >
                  {cancellingId === booking.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  Cancel
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
