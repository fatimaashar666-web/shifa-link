import LegalPage from "@/components/legal/LegalPage";

export default async function PatientConsentInfoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} pageType="consent-information" />;
}
