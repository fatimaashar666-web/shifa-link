import type { LegalPageDocument } from "./types";

function paragraph(text: string) {
  return {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", marks: [], text }],
  };
}

function heading(text: string) {
  return {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", marks: [], text }],
  };
}

const metadata = {
  effectiveDate: "2026-11-12",
  version: "1.0",
  reviewStatus: "published" as const,
  locale: "en",
};

export const FALLBACK_LEGAL_PAGES: LegalPageDocument[] = [
  {
    _id: "legal-privacy-policy",
    title: {
      en: "Privacy Policy",
      ur: "رازداری کی پالیسی",
      ar: "سياسة الخصوصية",
      de: "Datenschutzerklärung",
      fr: "Politique de confidentialité",
      ja: "プライバシーポリシー",
    },
    slug: { current: "privacy-policy" },
    pageType: "privacy-policy",
    ...metadata,
    body: [
      heading("Information we collect"),
      paragraph("ShifaLink collects the information needed to create and operate accounts, coordinate appointments, provide diagnostic booking workflows, and protect the security of the platform. This can include contact details, account information, appointment activity, and information you choose to place in ShifaLink Drive."),
      heading("How we use information"),
      paragraph("We use information to provide requested services, communicate important account and appointment updates, prevent misuse, maintain audit trails, and improve platform reliability. Medical records are private by default and are shared with a doctor only when you grant permission through the platform."),
      heading("Data protection and retention"),
      paragraph("We apply access controls and security safeguards appropriate to the platform workflow. We retain information only as long as needed for the stated purpose, legal obligations, dispute resolution, and security auditing. Retention periods may vary by record type and applicable law."),
      heading("Your choices"),
      paragraph("You may update account details, revoke active record-sharing permissions where supported, and contact ShifaLink about privacy questions or requests. Do not use public support chat to submit passwords, one-time codes, payment-card details, or unnecessary medical information."),
      paragraph("This starter policy is product guidance and must be reviewed and adapted by qualified legal counsel before production use in a specific jurisdiction."),
    ],
  },
  {
    _id: "legal-terms-of-service",
    title: {
      en: "Terms of Service",
      ur: "سروس کی شرائط",
      ar: "شروط الخدمة",
      de: "Nutzungsbedingungen",
      fr: "Conditions d’utilisation",
      ja: "利用規約",
    },
    slug: { current: "terms-of-service" },
    pageType: "terms-of-service",
    ...metadata,
    body: [
      heading("Using ShifaLink"),
      paragraph("ShifaLink provides tools for healthcare discovery, appointment coordination, diagnostic bookings, secure record sharing, and platform support. You are responsible for providing accurate account information, protecting your sign-in credentials, and using the platform lawfully."),
      heading("Healthcare and emergency disclaimer"),
      paragraph("ShifaLink is not an emergency service and does not replace a qualified healthcare professional. Platform information and AI-assisted support are general guidance only. For urgent or life-threatening symptoms, contact local emergency services immediately."),
      heading("Appointments and records"),
      paragraph("Appointments, diagnostic bookings, availability, cancellations, and provider decisions are subject to the applicable workflow and provider policies. You must not upload unlawful, malicious, or unauthorized content to ShifaLink Drive or attempt to access another person’s information."),
      heading("Changes and termination"),
      paragraph("We may update platform features, policies, or these terms when necessary. We may restrict or suspend access for security, legal, or misuse reasons, while preserving appropriate records and user-notification obligations."),
      paragraph("These starter terms must be reviewed and adapted by qualified legal counsel before production use in a specific jurisdiction."),
    ],
  },
  {
    _id: "legal-patient-consent",
    title: {
      en: "Patient Consent Information",
      ur: "مریض کی رضامندی کی معلومات",
      ar: "معلومات موافقة المريض",
      de: "Informationen zur Patienteneinwilligung",
      fr: "Informations sur le consentement du patient",
      ja: "患者同意に関する情報",
    },
    slug: { current: "patient-consent-info" },
    pageType: "consent-information",
    ...metadata,
    body: [
      heading("Your consent matters"),
      paragraph("You control whether a verified doctor may access records you choose to share for a consultation. Consent should be specific to the person, purpose, and period of access. You may decline to share records and may ask questions before granting access."),
      heading("Sharing and revocation"),
      paragraph("When the product workflow supports it, sharing permissions are time-limited and revocable. Revoking access stops future access through ShifaLink, but it cannot undo information a recipient may have already viewed, downloaded, or recorded lawfully during the active permission period."),
      heading("Clinical responsibility"),
      paragraph("Consent to share information does not guarantee a diagnosis, treatment, appointment outcome, or provider availability. Clinical decisions remain the responsibility of an authorized healthcare professional."),
      heading("Questions and withdrawal"),
      paragraph("You may withdraw consent through the relevant account workflow or contact ShifaLink support for help. For urgent medical concerns, seek local emergency care rather than waiting for a platform response."),
      paragraph("This starter consent information must be reviewed and adapted by qualified legal and clinical professionals before production use in a specific jurisdiction."),
    ],
  },
];
