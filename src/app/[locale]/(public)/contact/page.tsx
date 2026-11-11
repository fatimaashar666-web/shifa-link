import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tNav("contact")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Have questions regarding patient registration, diagnostic partner onboarding, or platform support? Our support team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Mail className="h-5 w-5" />
                <CardTitle className="text-base">Support Email</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-700 dark:text-slate-300">
                support@shifalink.example.com
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Phone className="h-5 w-5" />
                <CardTitle className="text-base">Inquiry Helpline</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-700 dark:text-slate-300">
                +92 (051) 111-SHIFA (74432) — Monday to Saturday, 9 AM to 6 PM
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <MapPin className="h-5 w-5" />
                <CardTitle className="text-base">Operational Headquarters</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-700 dark:text-slate-300">
                ShifaLink Health Tech Innovation Center, Sector G-11/3, Islamabad, Pakistan
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Contact Form Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Send an Inquiry</CardTitle>
            <CardDescription className="text-xs">
              Fill out the form below. Please do not submit urgent clinical symptoms through this general contact channel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Your Name</label>
              <input
                type="text"
                placeholder="Full name"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Subject</label>
              <input
                type="text"
                placeholder="General inquiry, provider onboarding, or feedback"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                rows={4}
                placeholder="How can we assist you?"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <Button className="w-full">
              {tCommon("submit")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
