import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ArrowRight, Calendar, FileText, FlaskConical, Mail, Search, UserRound } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";
import { verifySession } from "@/server/auth/session";
import { getMe } from "@/server/services/auth.service";
import * as appointmentService from "@/server/services/appointment.service";
import * as diagnosticService from "@/server/services/diagnostic.service";
import * as medicalRecordService from "@/server/services/medical-record.service";

function statusClass(status: string) {
  if (["CONFIRMED", "COMPLETED", "PUBLISHED"].includes(status)) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
  }
  if (["CANCELLED", "REJECTED", "NO_SHOW"].includes(status)) {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  }
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
}

function readableStatus(status: string) {
  return status.replace(/_/g, " ");
}

type PatientAppointment = Extract<
  Awaited<ReturnType<typeof appointmentService.getUserAppointments>>[number],
  { doctor: unknown }
>;

export default async function PatientDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const token = (await cookies()).get("shifalink-session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || !session.roles.includes("patient")) {
    redirect(`/${locale}/login?redirect=/${locale}/patient`);
  }

  const [profile, appointments, diagnosticBookings, records] = await Promise.all([
    getMe(session.userId),
    appointmentService.getUserAppointments(session.userId),
    diagnosticService.getUserDiagnosticBookings(session.userId),
    medicalRecordService.listMyRecords(session.userId),
  ]);

  if (!profile) {
    redirect(`/${locale}/login?redirect=/${locale}/patient`);
  }

  const t = await getTranslations({ locale, namespace: "patientDashboard" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const dateOnlyFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const recentAppointments = appointments.filter(
    (appointment): appointment is PatientAppointment => "doctor" in appointment,
  ).slice(0, 5);
  const recentDiagnosticBookings = diagnosticBookings.slice(0, 5);
  const recentRecords = records.slice(0, 5);
  const fullName = profile.name || "Patient";
  const cards = [
    { href: "/patient/appointments", title: t("appointmentsTitle"), description: t("appointmentsDescription"), icon: Calendar, count: appointments.length },
    { href: "/patient/drive", title: t("driveTitle"), description: t("driveDescription"), icon: FileText, count: records.length },
    { href: "/patient/diagnostics", title: t("diagnosticsTitle"), description: t("diagnosticsDescription"), icon: FlaskConical, count: diagnosticBookings.length },
  ];

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-slate-950 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">{t("eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{t("title")}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t("description")}</p>
        </div>
        <Button asChild size="sm" className="gap-1.5"><Link href="/doctors"><Search className="h-4 w-4" />{t("findDoctor")}</Link></Button>
      </div>

      <Card className="border-blue-100 dark:border-blue-900/50">
        <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-base"><UserRound className="h-4 w-4 text-blue-600" />Account</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Full name</p><p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{fullName}</p></div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70"><p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500"><Mail className="h-3.5 w-3.5" />Email address</p><p className="mt-1 break-all text-base font-semibold text-slate-900 dark:text-white">{profile.email}</p></div>
        </CardContent>
      </Card>

      <ChangePasswordForm />

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map(({ href, title, description, icon: Icon, count }) => (
          <Card key={href} className="flex h-full flex-col transition-shadow hover:shadow-md">
            <CardHeader><div className="mb-2 flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"><Icon className="h-5 w-5" /></div><Badge variant="secondary">{count}</Badge></div><CardTitle className="text-base">{title}</CardTitle></CardHeader>
            <CardContent className="mt-auto space-y-4"><p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p><Button asChild variant="outline" size="sm" className="gap-1.5 text-xs"><Link href={href}>{t("open")}<ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /></Link></Button></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0"><CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-blue-600" />Doctor appointments</CardTitle><Button asChild variant="ghost" size="sm" className="gap-1 text-xs"><Link href="/patient/appointments">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button></CardHeader>
          <CardContent>{recentAppointments.length === 0 ? <p className="text-sm text-slate-500">No doctor appointments yet.</p> : <div className="space-y-3">{recentAppointments.map((appointment) => <div key={appointment.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">Dr. {appointment.doctor.fullName}</p><p className="mt-1 text-xs text-slate-500">{appointment.doctor.primarySpecialty ?? "Doctor consultation"}</p><p className="mt-1 text-xs text-slate-500">{dateFormatter.format(new Date(appointment.scheduledAt))} · {appointment.location.name}</p></div><Badge className={`shrink-0 text-[10px] ${statusClass(appointment.status)}`} variant="secondary">{readableStatus(appointment.status)}</Badge></div>)}</div>}</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0"><CardTitle className="flex items-center gap-2 text-base"><FlaskConical className="h-4 w-4 text-emerald-600" />Booked tests</CardTitle><Button asChild variant="ghost" size="sm" className="gap-1 text-xs"><Link href="/patient/diagnostics">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button></CardHeader>
          <CardContent>{recentDiagnosticBookings.length === 0 ? <p className="text-sm text-slate-500">No diagnostic tests booked yet.</p> : <div className="space-y-3">{recentDiagnosticBookings.map((booking) => <div key={booking.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{booking.service.name}</p><p className="mt-1 text-xs text-slate-500">{booking.organization.name} · {dateFormatter.format(new Date(booking.scheduledAt))}</p><p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">Rs. {Number(booking.totalAmount).toLocaleString()}</p></div><Badge className={`shrink-0 text-[10px] ${statusClass(booking.status)}`} variant="secondary">{readableStatus(booking.status)}</Badge></div>)}</div>}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0"><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-violet-600" />ShifaLink Drive reports</CardTitle><Button asChild variant="ghost" size="sm" className="gap-1 text-xs"><Link href="/patient/drive">Open Drive <ArrowRight className="h-3.5 w-3.5" /></Link></Button></CardHeader>
        <CardContent>{recentRecords.length === 0 ? <p className="text-sm text-slate-500">No uploaded reports or medical records yet.</p> : <div className="grid gap-3 md:grid-cols-2">{recentRecords.map((record) => <div key={record.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{record.title}</p><p className="mt-1 text-xs text-slate-500">{record.fileObject.fileName}</p><p className="mt-1 text-xs text-slate-500">{readableStatus(record.category)} · {dateOnlyFormatter.format(new Date(record.recordDate))}</p></div>)}</div>}</CardContent>
      </Card>
    </div>
  );
}
