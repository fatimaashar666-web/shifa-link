import LegalPage from "@/components/legal/LegalPage";

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} pageType="terms-of-service" />;
}
