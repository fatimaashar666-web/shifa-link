import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Activity, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  const tNav = useTranslations("nav");

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tNav("about")}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          ShifaLink is a responsive, privacy-conscious digital healthcare platform connecting patients, qualified physicians, and certified diagnostic centers across unified clinical workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Patient-Controlled Sharing</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Medical records in ShifaLink Drive are private by default. Access is granted only with explicit, time-bounded, revocable patient consent.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-2">
              <Users className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Verified Practitioners</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Every doctor and diagnostic organization is verified through formal credentialing review before appearing in public directories.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center mb-2">
              <Activity className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Controlled AI Assistance</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Application AI operates with narrow typed tools, explicit escalation gates, and transparent clinical disclosures under qualified human oversight.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Architectural Commitments</h2>
        <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Single Full-Stack Architecture:</strong> Built cleanly on Next.js App Router with no dual-backend complexity.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Operational Source of Truth:</strong> PostgreSQL guarantees ACID transaction safety for appointment schedules and consents.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Multilingual Accessibility:</strong> Native 6-language routing with verified right-to-left (RTL) support for Urdu and Arabic.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
