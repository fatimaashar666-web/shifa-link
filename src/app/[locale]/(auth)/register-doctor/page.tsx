import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

export default function RegisterDoctorPage() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Shifa<span className="text-blue-600">Link</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 pt-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("doctorRegisterTitle")}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("doctorRegisterSubtitle")}
          </p>
        </div>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("nameLabel")}
                </label>
                <input
                  type="text"
                  placeholder="Dr. Full Name"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("licenseLabel")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. PMDC-12345-X"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("specialtyLabel")}
              </label>
              <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <option value="">Select Specialty</option>
                <option value="cardiology">Cardiology</option>
                <option value="dermatology">Dermatology</option>
                <option value="general-medicine">General Medicine</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                placeholder="doctor@hospital.org"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                placeholder="Strong password"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="rounded-md bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold">Credential Verification Process:</p>
              <p>Submitted registrations require medical council license verification before schedules appear in public search directories.</p>
            </div>

            <Button className="w-full mt-2" size="lg">
              {t("submitDoctorRegister")}
            </Button>
          </CardContent>

          <CardFooter className="flex justify-center text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
            <p>
              Already verified?{" "}
              <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {t("loginTitle")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
