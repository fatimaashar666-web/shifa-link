"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface DiagnosticBookingClientProps {
  serviceId: string;
  organizationId: string;
  serviceName: string;
  organizationName: string;
  price: number;
}

export function DiagnosticBookingClient({
  serviceId,
  organizationId,
  serviceName,
  organizationName,
  price,
}: DiagnosticBookingClientProps) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState("");
  const [isHomeCollection, setIsHomeCollection] = useState(false);
  const [collectionAddress, setCollectionAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/diagnostic-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          organizationId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          isHomeCollection,
          collectionAddress: isHomeCollection ? collectionAddress : undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Booking failed. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/patient/diagnostics"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="font-semibold text-slate-900 dark:text-white">Booking Confirmed!</p>
          <p className="text-sm text-slate-500">Redirecting to your diagnostics dashboard…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Book: {serviceName}
        </CardTitle>
        <p className="text-xs text-slate-500">{organizationName} · Rs. {price.toLocaleString()}</p>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="scheduledAt" className="text-xs font-medium">
              Appointment Date & Time
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-md border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="homeCollection"
              checked={isHomeCollection}
              onCheckedChange={(v: boolean) => setIsHomeCollection(v)}
            />
            <Label htmlFor="homeCollection" className="text-xs cursor-pointer">
              Home sample collection
            </Label>
          </div>

          {isHomeCollection && (
            <div className="space-y-1.5">
              <Label htmlFor="collectionAddress" className="text-xs font-medium">
                Collection Address
              </Label>
              <Textarea
                id="collectionAddress"
                value={collectionAddress}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCollectionAddress(e.target.value)}
                placeholder="Enter your full address for home sample collection…"
                className="text-xs min-h-[72px] resize-none"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium">
              Notes <span className="text-slate-400">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Any special instructions or clinical notes for the lab…"
              className="text-xs min-h-[64px] resize-none"
            />
          </div>
        </CardContent>

        <CardFooter className="border-t border-slate-100 dark:border-slate-800/60 mt-2">
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Confirming…" : "Confirm Booking"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
