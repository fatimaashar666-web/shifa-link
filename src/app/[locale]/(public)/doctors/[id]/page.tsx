import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  MapPin,
  GraduationCap,
  Globe2,
  Building2,
  ArrowLeft,
  ShieldCheck,
  Video,
} from "lucide-react";
import * as doctorService from "@/server/services/doctor.service";
import { BookingWidget } from "@/features/appointments/BookingWidget";

interface DoctorDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { id } = await params;
  const doctor = await doctorService.getDoctorProfile(id);

  if (!doctor) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Back Button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <Link href="/doctors">
            <ArrowLeft className="h-4 w-4" />
            Back to Doctor Directory
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Doctor Profile & Credentials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Profile Card */}
          <Card className="shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                      {doctor.fullName}
                    </CardTitle>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {doctor.specialties.map((s) => (
                      <Badge key={s.id} variant="secondary" className="text-xs">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Licensed: {doctor.licenseNumber}</span>
                </div>
              </div>

              {doctor.bio && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                  {doctor.bio}
                </p>
              )}
            </CardHeader>
          </Card>

          {/* Qualifications & Medical Background */}
          {doctor.qualifications.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Qualifications & Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {doctor.qualifications.map((q, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {q.degree}
                      </div>
                      <div className="text-slate-500">{q.institution}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Class of {q.year}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Practice Locations */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Consultation Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctor.locations.map((loc) => (
                <div
                  key={loc.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-1.5 text-xs bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {loc.isVirtual ? <Video className="h-4 w-4 text-blue-600" /> : <MapPin className="h-4 w-4 text-blue-600" />}
                    {loc.name}
                  </div>
                  {loc.address && <p className="text-slate-600 dark:text-slate-400">{loc.address}</p>}
                  <p className="text-slate-500 font-medium">{loc.city}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Languages Spoken */}
          {doctor.languages.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-blue-600" />
                  Languages Spoken
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {doctor.languages.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs uppercase">
                    {lang === "en" ? "English" : lang === "ur" ? "Urdu (اردو)" : lang === "ar" ? "Arabic (العربية)" : lang}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Dynamic Booking Widget */}
        <div className="space-y-6">
          <BookingWidget
            doctorId={doctor.id}
            doctorName={doctor.fullName}
            fee={doctor.consultationFee}
          />
        </div>
      </div>
    </div>
  );
}
