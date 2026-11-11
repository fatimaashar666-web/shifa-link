"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Video, Building2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface SlotItem {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  locationId: string;
  locationName: string;
  isVirtual: boolean;
}

interface BookingWidgetProps {
  doctorId: string;
  doctorName: string;
  fee: number;
}

export function BookingWidget({ doctorId, doctorName, fee }: BookingWidgetProps) {
  const router = useRouter();

  // Generate next 7 selectable days starting today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split("T")[0],
      dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
      formattedDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });

  const [selectedDate, setSelectedDate] = useState<string>(days[0].dateStr);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Form inputs
  const [consultationType, setConsultationType] = useState<"IN_PERSON" | "VIDEO">("IN_PERSON");
  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<{ id: string; time: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/v1/doctors/${doctorId}/availability?date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load availability");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setSlots(data.slots ?? []);
          setLoadingSlots(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setSlots([]);
          setLoadingSlots(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [doctorId, selectedDate]);

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          locationId: selectedSlot.locationId,
          scheduledAt: selectedSlot.startTime,
          appointmentType: consultationType,
          reason: reason.trim() || undefined,
          symptoms: symptoms.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        // Redirect to login with callback
        router.push(`/login?redirect=/doctors/${doctorId}`);
        return;
      }

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.message || "Failed to complete appointment reservation");
        setSubmitting(false);
        return;
      }

      setSuccessBooking({
        id: json.id,
        time: new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setSubmitting(false);
    } catch {
      setErrorMsg("A network error occurred. Please check your connection and retry.");
      setSubmitting(false);
    }
  }

  if (successBooking) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 shadow-md">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Appointment Confirmed!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your appointment with <span className="font-semibold">{doctorName}</span> has been confirmed for{" "}
            <span className="font-semibold">{selectedDate}</span> at{" "}
            <span className="font-semibold">{successBooking.time}</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSuccessBooking(null);
                setSelectedSlot(null);
              }}
            >
              Book Another
            </Button>
            <Button onClick={() => router.push("/patient/appointments")}>
              View My Appointments
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Book Consultation
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            Rs. {fee.toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Date Selector Row */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Date
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {days.map((d) => (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(d.dateStr);
                  setLoadingSlots(true);
                  setSelectedSlot(null);
                  setErrorMsg(null);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition ${
                  selectedDate === d.dateStr
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="text-[10px] uppercase text-slate-500">{d.dayName}</span>
                <span className="text-sm font-bold mt-0.5">{d.formattedDate}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slot Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Available Time Slots</span>
            {slots.length > 0 && (
              <span className="text-[11px] text-slate-500 font-normal">
                {slots.filter((s) => s.isAvailable).length} slots available
              </span>
            )}
          </label>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-8 text-xs text-slate-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Computing available slots...
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
              No consultation slots available on this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s, idx) => {
                const timeLabel = new Date(s.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isSelected = selectedSlot?.startTime === s.startTime;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!s.isAvailable}
                    onClick={() => {
                      setSelectedSlot(s);
                      if (s.isVirtual) setConsultationType("VIDEO");
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border text-xs transition ${
                      !s.isAvailable
                        ? "opacity-35 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 line-through"
                        : isSelected
                        ? "border-blue-600 bg-blue-600 text-white font-semibold"
                        : "border-slate-200 bg-white hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{timeLabel}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Slot Form */}
        {selectedSlot && (
          <form onSubmit={handleBookAppointment} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="rounded-lg bg-blue-50/60 dark:bg-blue-950/20 p-3 text-xs space-y-1">
              <div className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                {selectedSlot.isVirtual ? <Video className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                {selectedSlot.locationName}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Scheduled for {new Date(selectedSlot.startTime).toLocaleDateString()} at{" "}
                {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {/* Consultation Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Consultation Type
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="consultationType"
                    value="IN_PERSON"
                    checked={consultationType === "IN_PERSON"}
                    onChange={() => setConsultationType("IN_PERSON")}
                    className="accent-blue-600"
                  />
                  <span>In-Person Clinic Visit</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="consultationType"
                    value="VIDEO"
                    checked={consultationType === "VIDEO"}
                    onChange={() => setConsultationType("VIDEO")}
                    className="accent-blue-600"
                  />
                  <span>Telehealth Video Call</span>
                </label>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reason for Visit (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Chest discomfort, annual checkup, second opinion"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Symptoms */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Symptoms / Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe any current medications or symptoms..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {errorMsg && (
              <div className="rounded-md bg-rose-50 dark:bg-rose-950/30 p-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming Reservation...
                </span>
              ) : (
                `Confirm Booking (Rs. ${fee.toLocaleString()})`
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
