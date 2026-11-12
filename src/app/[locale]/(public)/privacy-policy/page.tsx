import LegalPage from "@/components/legal/LegalPage";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} pageType="privacy-policy" />;
}
