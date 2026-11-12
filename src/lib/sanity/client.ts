/**
 * Client for Sanity CMS integration (public editorial content only).
 * In accordance with ADR-02: Sanity is strictly for editorial, FAQ, legal, and public health articles.
 * Patient, clinical, and transactional records NEVER touch Sanity.
 */

import 'server-only'

import { createClient } from 'next-sanity'
import { ArticleDocument, FaqDocument, LegalPageDocument } from './types'
import { ARTICLES_QUERY, ARTICLE_BY_SLUG_QUERY } from './queries/articles'
import { LEGAL_PAGE_BY_TYPE_QUERY } from './queries/legal'
import { FALLBACK_LEGAL_PAGES } from './legal-fallbacks'

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

const sanityClient =
  sanityProjectId && sanityProjectId !== 'REPLACE_WITH_PROJECT_ID'
    ? createClient({
        projectId: sanityProjectId,
        dataset: sanityDataset,
        apiVersion: '2025-01-01',
        useCdn: process.env.NODE_ENV === 'production',
      })
    : null

// Mock / Fallback editorial articles with multi-lingual support
const FALLBACK_ARTICLES: ArticleDocument[] = [
  {
    _id: 'art-hypertension-guide',
    title: {
      en: 'Understanding Hypertension: Symptoms, Risks, and Prevention',
      ur: 'بلڈ پریشر کے بارے میں آگاہی: علامات، خطرات اور احتیاطی تدابیر',
      ar: 'فهم ارتفاع ضغط الدم: الأعراض والمخاطر والوقاية',
      de: 'Bluthochdruck verstehen: Symptome, Risiken und Prävention',
      fr: 'Comprendre l’hypertension : symptômes, risques et prévention',
      ja: '高血圧の理解：症状、リスク、および予防',
    },
    slug: { current: 'understanding-hypertension' },
    category: 'Cardiovascular Health',
    excerpt: {
      en: 'Essential guidelines on monitoring blood pressure, lifestyle interventions, and when to seek urgent specialist review.',
      ur: 'بلڈ پریشر کی مانیٹرنگ، طرز زندگی میں تبدیلیاں اور ماہر معالج سے رجوع کرنے کے اہم رہنما اصول۔',
      ar: 'إرشادات أساسية حول مراقبة ضغط الدم وتعديل نمط الحياة وموعد استشارة الطبيب المختص.',
      de: 'Wichtige Richtlinien zur Blutdruckmessung, Lebensstiländerungen und dem richtigen Zeitpunkt für einen Facharztbesuch.',
      fr: 'Directives essentielles sur la surveillance de la tension artérielle, les modifications du mode de vie et le moment de consulter.',
      ja: '血圧モニタリング、ライフスタイルの改善、専門医の受診が必要なタイミングに関する重要ガイドライン。',
    },
    coverImage: {
      url: '/banner.jpg',
      alt: 'ShifaLink health education article',
    },
    authorDisplay: 'Clinical Advisory Panel',
    publishedAt: '2026-11-01T10:00:00Z',
    reviewStatus: 'published',
    tags: ['Cardiology', 'Preventive Health', 'Lifestyle'],
  },
  {
    _id: 'art-fasting-lab-prep',
    title: {
      en: 'How to Prepare for Routine Blood and Fasting Diagnostics',
      ur: 'خون اور روزہ کے تشخیصی ٹیسٹوں کی تیاری کے رہنما اصول',
      ar: 'كيفية الاستعداد لفحوصات الدم والتحاليل أثناء الصيام',
      de: 'Vorbereitung auf routinemäßige Blut- und Nüchterndiagnostik',
      fr: 'Comment se préparer aux analyses sanguines et aux bilans à jeun',
      ja: '定期的な血液検査および空腹時検査の事前準備について',
    },
    slug: { current: 'how-to-prepare-for-blood-tests' },
    category: 'Diagnostic Guides',
    excerpt: {
      en: 'Step-by-step instructions on fasting duration, hydration, and medication holds prior to metabolic and lipid panels.',
      ur: 'لیپڈ پروفائل اور شوگر ٹیسٹ سے قبل فاقہ کے دورانیے اور پانی پینے کے طریقہ کار کی وضاحت۔',
      ar: 'تعليمات مفصلة حول مدة الصيام وشرب الماء وتناول الأدوية قبل إجراء تحاليل الكولسترول والسكر.',
      de: 'Schritt-für-Schritt-Anleitung zu Fastendauer, Hydratation und Medikamenteneinnahme vor Blutuntersuchungen.',
      fr: 'Instructions étape par étape sur le jeûne, l’hydratation et la prise de médicaments avant les bilans métaboliques.',
      ja: '代謝パネルや脂質パネル検査前の絶食期間、水分補給、服薬管理に関する手順ガイド。',
    },
    coverImage: {
      url: '/labtests.jpg',
      alt: 'Laboratory testing guide',
    },
    authorDisplay: 'Laboratory Clinical Team',
    publishedAt: '2026-10-28T08:30:00Z',
    reviewStatus: 'published',
    tags: ['Laboratory', 'Diagnostics', 'Patient Guide'],
  },
  {
    _id: 'art-telehealth-safety',
    title: {
      en: 'When to Choose Telehealth vs. In-Person Emergency Care',
      ur: 'ویڈیو مشاورت بمقابلہ ایمرجنسی وزٹ: صحیح وقت پر صحیح فیصلہ',
      ar: 'متى تختار الاستشارة عن بعد ومتى تتوجه إلى الرعاية الطارئة',
      de: 'Telemedizin vs. Notfallambulanz: Die richtige Wahl treffen',
      fr: 'Téléconsultation ou urgences : comment faire le bon choix',
      ja: 'オンライン診療と対面救急診療の使い分けガイド',
    },
    slug: { current: 'telehealth-vs-emergency-care' },
    category: 'Preventive Care',
    excerpt: {
      en: 'Identifying red-flag symptoms in respiratory illnesses and when video consultations provide timely clinical triage.',
      ur: 'سانس کی تکالیف میں خطرے کی علامات کی شناخت اور ویڈیو مشاورت سے فائدہ اٹھانے کی ہدایات۔',
      ar: 'التعرف على الأعراض التحذيرية في الأمراض التنفسية ودور الاستشارات عن بُعد في الفرز السريري السريع.',
      de: 'Erkennen von Warnsymptomen bei Atemwegsinfektionen und die Rolle der Telemedizin bei der Triage.',
      fr: 'Identifier les signes d’alerte des infections respiratoires et choisir le niveau de prise en charge adapté.',
      ja: '呼吸器疾患における危険信号の識別と、オンライン診療が有効なトリアージ手順について。',
    },
    coverImage: {
      url: '/secure-video-consultations.png',
      alt: 'Telehealth safety guide',
    },
    authorDisplay: 'Primary Care Working Group',
    publishedAt: '2026-10-20T12:00:00Z',
    reviewStatus: 'published',
    tags: ['Telehealth', 'Triage', 'Emergency Safety'],
  },
]

// Fallback FAQs with multi-lingual support
const FALLBACK_FAQS: FaqDocument[] = [
  {
    _id: 'faq-1',
    category: 'appointments',
    sortOrder: 1,
    reviewStatus: 'approved',
    question: {
      en: 'How do I book an appointment with a specialist?',
      ur: 'کسی ماہر ڈاکٹر کے ساتھ مشاورت کا وقت کیسے بک کیا جائے؟',
      ar: 'كيف يمكنني حجز موعد مع طبيب متخصص؟',
      de: 'Wie buche ich einen Termin bei einem Facharzt?',
      fr: 'Comment prendre rendez-vous avec un médecin spécialiste ?',
      ja: '専門医との診療予約はどのように行いますか？',
    },
    answer: {
      en: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'You can navigate to "Find a Doctor", search by medical specialty or location, select an available time slot, and confirm your booking instantly.',
            },
          ],
        },
      ],
      ur: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'آپ "ڈاکٹر تلاش کریں" پر جا کر شعبہ یا شہر کے لحاظ سے سرچ کر سکتے ہیں، مناسب وقت منتخب کر کے فوری طور پر بکنگ مکمل کر سکتے ہیں۔',
            },
          ],
        },
      ],
      ar: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'يمكنك الانتقال إلى "البحث عن طبيب"، والبحث حسب التخصص أو المدينة، واختيار الموعد المتاح وتأكيد الحجز فوراً.',
            },
          ],
        },
      ],
      de: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Navigieren Sie zu "Arzt finden", filtern Sie nach Fachbereich oder Stadt, wählen Sie einen freien Termin und bestätigen Sie die Buchung.',
            },
          ],
        },
      ],
      fr: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Accédez à "Trouver un médecin", effectuez une recherche par spécialité ou lieu, sélectionnez un créneau horaire disponible et confirmez.',
            },
          ],
        },
      ],
      ja: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: '「医師を検索」ページから診療科や地域で検索し、利用可能な時間枠を選択して即座に予約を完了できます。',
            },
          ],
        },
      ],
    },
  },
  {
    _id: 'faq-2',
    category: 'records',
    sortOrder: 2,
    reviewStatus: 'approved',
    question: {
      en: 'Who has access to my ShifaLink Drive medical records?',
      ur: 'میری شفا لنک ڈرائیو کے طبی ریکارڈز تک کس کو رسائی حاصل ہے؟',
      ar: 'من يملك صلاحية الوصول إلى ملفاتي الطبية في محرك شفا لينك؟',
      de: 'Wer hat Zugriff auf meine Krankenakten im ShifaLink Drive?',
      fr: 'Qui a accès à mes dossiers médicaux sur ShifaLink Drive ?',
      ja: 'ShifaLink Driveの医療記録には誰がアクセスできますか？',
    },
    answer: {
      en: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Only you have default access. You can grant temporary, revocable access to specific verified doctors for clinical consultations.',
            },
          ],
        },
      ],
      ur: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'صرف آپ کو رسائی حاصل ہے۔ آپ مشاورت کے لیے مخصوص تصدیق شدہ ڈاکٹر کو عارضی اور منسوخ کی جانے والی رسائی دے سکتے ہیں۔',
            },
          ],
        },
      ],
      ar: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'أنت فقط من يملك حق الوصول افتراضياً. يمكنك منح حق وصول مؤقت وقابل للإلغاء لأطباء معتمدين لأغراض الاستشارة السريرية.',
            },
          ],
        },
      ],
      de: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Standardmäßig haben nur Sie Zugriff. Sie können verifizierten Ärzten für Konsultationen einen zeitlich befristeten, widerrufbaren Zugriff gewähren.',
            },
          ],
        },
      ],
      fr: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Vous seul y avez accès par défaut. Vous pouvez accorder un accès temporaire et révocable à des médecins vérifiés.',
            },
          ],
        },
      ],
      ja: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: '初期設定ではご本人のみがアクセスできます。診療の目的に応じて、認証済み医師にいつでも取り消し可能な期間限定アクセス権を付与できます。',
            },
          ],
        },
      ],
    },
  },
]

export async function getPublishedArticles(): Promise<ArticleDocument[]> {
  if (!sanityClient) return FALLBACK_ARTICLES

  try {
    const articles = await sanityClient.fetch<ArticleDocument[]>(ARTICLES_QUERY)
    return articles.length > 0 ? articles : FALLBACK_ARTICLES
  } catch (error) {
    console.error('Unable to fetch published articles from Sanity:', error)
    return FALLBACK_ARTICLES
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleDocument | null> {
  if (!sanityClient) {
    const article = FALLBACK_ARTICLES.find((a) => a.slug.current === slug)
    return article ?? null
  }

  try {
    const article = await sanityClient.fetch<ArticleDocument | null>(ARTICLE_BY_SLUG_QUERY, { slug })
    return article ?? FALLBACK_ARTICLES.find((item) => item.slug.current === slug) ?? null
  } catch (error) {
    console.error('Unable to fetch article from Sanity:', error)
    return FALLBACK_ARTICLES.find((article) => article.slug.current === slug) ?? null
  }
}

export async function getLegalPage(
  pageType: LegalPageDocument['pageType'],
  locale: string,
): Promise<LegalPageDocument> {
  const fallback =
    FALLBACK_LEGAL_PAGES.find((page) => page.pageType === pageType) ??
    FALLBACK_LEGAL_PAGES[0]

  if (!sanityClient) return fallback

  try {
    const page = await sanityClient.fetch<LegalPageDocument | null>(
      LEGAL_PAGE_BY_TYPE_QUERY,
      { pageType, locale },
    )
    return page ?? fallback
  } catch (error) {
    console.error(`Unable to fetch ${pageType} from Sanity:`, error)
    return fallback
  }
}

export async function getFaqs(category?: string): Promise<FaqDocument[]> {
  if (category) {
    return Promise.resolve(FALLBACK_FAQS.filter((f) => f.category === category))
  }
  return Promise.resolve(FALLBACK_FAQS)
}
