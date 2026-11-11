import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, MapPin, Clock, Star } from "lucide-react";

export default function DoctorsPage() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  // Synthetic placeholder doctors (M1 UI only - no DB queries)
  const doctors = [
    {
      id: "doc-1",
      name: "Dr. Ayesha Malik",
      specialty: "Cardiology",
      qualifications: "MBBS, FCPS (Cardiology)",
      experience: "12 years experience",
      location: "Central Medical Complex, Islamabad",
      fee: "Rs. 2,500",
      rating: "4.9",
      types: ["Video", "In-person"],
      nextSlot: "Today, 4:30 PM",
    },
    {
      id: "doc-2",
      name: "Dr. Tariq Khan",
      specialty: "General Medicine & Diabetology",
      qualifications: "MBBS, MRCP (UK)",
      experience: "15 years experience",
      location: "Al-Shifa Health Plaza, Lahore",
      fee: "Rs. 2,000",
      rating: "4.8",
      types: ["Video", "In-person"],
      nextSlot: "Tomorrow, 10:00 AM",
    },
    {
      id: "doc-3",
      name: "Dr. Fatima Noor",
      specialty: "Pediatrics & Neonatology",
      qualifications: "MBBS, MD (Pediatrics)",
      experience: "9 years experience",
      location: "Children's Care Center, Karachi",
      fee: "Rs. 1,800",
      rating: "5.0",
      types: ["Video"],
      nextSlot: "Today, 6:00 PM",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header and Search */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tNav("findDoctor")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Search qualified healthcare practitioners by specialty, language, consultation type, and real-time availability.
        </p>

        {/* Search Bar Input Placeholder */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name, specialty, or clinic location..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">All Specialties</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">Cardiology</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">General Medicine</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">Pediatrics</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">Dermatology</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">Video Available</Badge>
        </div>
      </div>

      {/* Doctor Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <Card key={doc.id} className="flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-base font-semibold">{doc.name}</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {doc.specialty}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{doc.rating}</span>
                </div>
              </div>

              <CardDescription className="text-xs space-y-1 pt-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">{doc.qualifications}</p>
                <p>{doc.experience}</p>
                <div className="flex items-center gap-1 text-slate-500 pt-0.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{doc.location}</span>
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  <span>Next: {doc.nextSlot}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {doc.fee}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button asChild className="w-full text-xs">
                <Link href={`/login?redirect=/doctors/${doc.id}`}>
                  {tCommon("bookNow")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
