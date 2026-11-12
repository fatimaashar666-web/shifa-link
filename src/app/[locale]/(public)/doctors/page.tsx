import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageBanner } from "@/components/layout/PageBanner";
import { Search, CheckCircle2, MapPin, Video, Stethoscope, Globe2 } from "lucide-react";
import * as doctorService from "@/server/services/doctor.service";

interface DoctorsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    specialty?: string;
    city?: string;
    virtual?: string;
  }>;
}

export default async function DoctorsPage({ params, searchParams }: DoctorsPageProps) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const specialtySlug = resolvedParams.specialty;
  const city = resolvedParams.city;
  const isVirtual = resolvedParams.virtual === "true" ? true : undefined;

  const [searchResult, specialties] = await Promise.all([
    doctorService.searchDoctors({
      query: q,
      specialtySlug,
      city,
      isVirtual,
      limit: 20,
    }),
    doctorService.getAllSpecialties(),
  ]);

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <PageBanner
        image="/find-a-doctor.png"
        alt="Doctors working in a bright hospital"
        heading={tNav("findDoctor")}
        description="Book verified healthcare specialists, view transparent consultation fees, and schedule clinic or telehealth appointments."
      />

        {/* Search and filters */}
        <div className="max-w-3xl space-y-4">
        {/* Search Bar Form */}
        <form method="GET" className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by doctor name, clinical focus, or medical condition..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-24 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
          >
            {tCommon("search")}
          </button>
        </form>

        {/* Specialty Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/doctors">
            <Badge
              variant={!specialtySlug ? "default" : "outline"}
              className="cursor-pointer"
            >
              All Specialties
            </Badge>
          </Link>
          {specialties.map((s) => (
            <Link key={s.id} href={`/doctors?specialty=${s.slug}`}>
              <Badge
                variant={specialtySlug === s.slug ? "default" : "outline"}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {s.name}
              </Badge>
            </Link>
          ))}
          <Link href="/doctors?virtual=true">
            <Badge
              variant={isVirtual ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
            >
              <Video className="h-3 w-3" />
              Telehealth Only
            </Badge>
          </Link>
        </div>
        </div>

        {/* Doctor Listings Grid */}
        {searchResult.doctors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3">
          <Stethoscope className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No doctors found matching criteria
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or clearing specialty filters.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/doctors">Clear Filters</Link>
          </Button>
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResult.doctors.map((doc) => {
            const primarySpec = doc.specialties.find((s) => s.isPrimary) ?? doc.specialties[0];
            const primaryLoc = doc.locations[0];

            return (
              <Card
                key={doc.id}
                className="flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CardTitle className="text-base font-semibold">
                          {doc.fullName}
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                      {primarySpec && (
                        <Badge variant="secondary" className="mt-1 text-xs font-medium">
                          {primarySpec.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs">
                    {doc.qualifications.length > 0 && (
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {doc.qualifications.map((q) => q.degree).join(", ")}
                      </p>
                    )}
                    {doc.bio && (
                      <p className="line-clamp-2 text-slate-500 dark:text-slate-400">
                        {doc.bio}
                      </p>
                    )}
                    {primaryLoc && (
                      <div className="flex items-center gap-1 text-slate-500 pt-0.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">
                          {primaryLoc.name} • {primaryLoc.city}
                        </span>
                      </div>
                    )}
                    {doc.languages.length > 0 && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Globe2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{doc.languages.map((l) => l.toUpperCase()).join(", ")}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Consultation Fee</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Rs. {doc.consultationFee.toLocaleString()}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button asChild className="w-full text-xs">
                    <Link href={`/doctors/${doc.id}`}>
                      {tCommon("bookNow")}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        )}
    </div>
  );
}
