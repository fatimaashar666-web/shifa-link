export type DiagnosticServiceTranslation = {
  name: string;
  category: string;
  shortDescription: string;
  description?: string;
};

export type DiagnosticServiceTranslations = Record<string, DiagnosticServiceTranslation>;

// Operational catalog rows stay in PostgreSQL. These locale values are stored
// in each row's translations JSON so names and descriptions remain editable
// with the diagnostic service instead of being hardcoded in the UI.
export const DIAGNOSTIC_TRANSLATIONS: Record<string, DiagnosticServiceTranslations> = {
  cbc: {
    ur: { name: "مکمل خون کا ٹیسٹ (CBC)", category: "خون کے ٹیسٹ", shortDescription: "خون کے خلیوں کی پیمائش سمیت مکمل خون کا ٹیسٹ" },
    de: { name: "Großes Blutbild (CBC)", category: "Hämatologie", shortDescription: "Umfassendes Blutbild mit Messung der Blutzellen" },
    ar: { name: "تعداد الدم الكامل (CBC)", category: "أمراض الدم", shortDescription: "تحليل شامل لقياس خلايا الدم" },
    fr: { name: "Numération formule sanguine (CBC)", category: "Hématologie", shortDescription: "Bilan sanguin complet avec mesure des cellules sanguines" },
    ja: { name: "血球計算（CBC）", category: "血液学", shortDescription: "血球数を測定する総合的な血液検査" },
  },
  hba1c: {
    ur: { name: "HbA1c (گلیکیٹڈ ہیموگلوبن)", category: "ذیابیطس", shortDescription: "گزشتہ 2 سے 3 ماہ کی اوسط خون کی شکر کا اندازہ" },
    de: { name: "HbA1c (glykiertes Hämoglobin)", category: "Diabetes", shortDescription: "Schätzt den durchschnittlichen Blutzucker der letzten 2–3 Monate" },
    ar: { name: "HbA1c (الهيموغلوبين السكري)", category: "السكري", shortDescription: "يقدّر متوسط سكر الدم خلال الشهرين أو الثلاثة أشهر الماضية" },
    fr: { name: "HbA1c (hémoglobine glyquée)", category: "Diabète", shortDescription: "Estime la glycémie moyenne des 2 à 3 derniers mois" },
    ja: { name: "HbA1c（糖化ヘモグロビン）", category: "糖尿病", shortDescription: "過去2〜3か月の平均血糖値を推定" },
  },
  "lipid-profile": {
    ur: { name: "لِپڈ پروفائل", category: "دل کی صحت", shortDescription: "کولیسٹرول اور ٹرائی گلیسرائیڈز کی پیمائش" },
    de: { name: "Lipidprofil", category: "Herzgesundheit", shortDescription: "Misst Cholesterin und Triglyceride" },
    ar: { name: "تحليل الدهون", category: "صحة القلب", shortDescription: "يقيس الكوليسترول والدهون الثلاثية" },
    fr: { name: "Bilan lipidique", category: "Santé cardiaque", shortDescription: "Mesure le cholestérol et les triglycérides" },
    ja: { name: "脂質プロファイル", category: "心臓の健康", shortDescription: "コレステロールと中性脂肪を測定" },
  },
  lft: {
    ur: { name: "جگر کے افعال کا ٹیسٹ (LFT)", category: "جگر", shortDescription: "جگر کے افعال سے متعلق اشاریوں کا جائزہ" },
    de: { name: "Leberfunktionstest (LFT)", category: "Leber", shortDescription: "Bewertet Marker der Leberfunktion" },
    ar: { name: "اختبار وظائف الكبد (LFT)", category: "الكبد", shortDescription: "يقيّم المؤشرات المرتبطة بوظائف الكبد" },
    fr: { name: "Bilan hépatique (LFT)", category: "Foie", shortDescription: "Évalue les marqueurs associés à la fonction hépatique" },
    ja: { name: "肝機能検査（LFT）", category: "肝臓", shortDescription: "肝機能に関係する指標を評価" },
  },
  rft: {
    ur: { name: "گردوں کے افعال کا ٹیسٹ (RFT)", category: "گردے", shortDescription: "گردوں سے متعلق خون کے اشاریوں کا جائزہ" },
    de: { name: "Nierenfunktionstest (RFT)", category: "Nieren", shortDescription: "Bewertet nierenbezogene Blutmarker" },
    ar: { name: "اختبار وظائف الكلى (RFT)", category: "الكلى", shortDescription: "يقيّم مؤشرات الدم المرتبطة بالكلى" },
    fr: { name: "Bilan rénal (RFT)", category: "Reins", shortDescription: "Évalue les marqueurs sanguins liés aux reins" },
    ja: { name: "腎機能検査（RFT）", category: "腎臓", shortDescription: "腎臓に関係する血液指標を評価" },
  },
  "serum-creatinine": {
    ur: { name: "سیرم کریاٹینین", category: "گردے", shortDescription: "سیرم کریاٹینین کی پیمائش" },
    de: { name: "Serum-Kreatinin", category: "Nieren", shortDescription: "Misst Serum-Kreatinin" },
    ar: { name: "كرياتينين المصل", category: "الكلى", shortDescription: "يقيس كرياتينين المصل" },
    fr: { name: "Créatinine sérique", category: "Reins", shortDescription: "Mesure la créatinine sérique" },
    ja: { name: "血清クレアチニン", category: "腎臓", shortDescription: "血清クレアチニンを測定" },
  },
  tsh: {
    ur: { name: "تھائیرائڈ محرک ہارمون (TSH)", category: "تھائیرائڈ", shortDescription: "تھائیرائڈ محرک ہارمون کی پیمائش" },
    de: { name: "Thyreoidea-stimulierendes Hormon (TSH)", category: "Schilddrüse", shortDescription: "Misst das thyreoideastimulierende Hormon" },
    ar: { name: "الهرمون المنبه للغدة الدرقية (TSH)", category: "الغدة الدرقية", shortDescription: "يقيس الهرمون المنبه للغدة الدرقية" },
    fr: { name: "Hormone thyréostimulante (TSH)", category: "Thyroïde", shortDescription: "Mesure l’hormone thyréostimulante" },
    ja: { name: "甲状腺刺激ホルモン（TSH）", category: "甲状腺", shortDescription: "甲状腺刺激ホルモンを測定" },
  },
  "vitamin-d": {
    ur: { name: "وٹامن ڈی (25-OH)", category: "وٹامنز", shortDescription: "25-ہائیڈروکسی وٹامن ڈی کی پیمائش" },
    de: { name: "Vitamin D (25-OH)", category: "Vitamine", shortDescription: "Misst 25-Hydroxy-Vitamin D" },
    ar: { name: "فيتامين د (25-OH)", category: "الفيتامينات", shortDescription: "يقيس فيتامين د 25-هيدروكسي" },
    fr: { name: "Vitamine D (25-OH)", category: "Vitamines", shortDescription: "Mesure la vitamine D 25-hydroxy" },
    ja: { name: "ビタミンD（25-OH）", category: "ビタミン", shortDescription: "25-ヒドロキシビタミンDを測定" },
  },
  "vitamin-b12": {
    ur: { name: "وٹامن بی 12", category: "وٹامنز", shortDescription: "وٹامن بی 12 کی سطح کی پیمائش" },
    de: { name: "Vitamin B12", category: "Vitamine", shortDescription: "Misst den Vitamin-B12-Spiegel" },
    ar: { name: "فيتامين ب12", category: "الفيتامينات", shortDescription: "يقيس مستوى فيتامين ب12" },
    fr: { name: "Vitamine B12", category: "Vitamines", shortDescription: "Mesure le taux de vitamine B12" },
    ja: { name: "ビタミンB12", category: "ビタミン", shortDescription: "ビタミンB12濃度を測定" },
  },
  "fasting-glucose": {
    ur: { name: "فاسٹنگ بلڈ گلوکوز", category: "ذیابیطس", shortDescription: "فاسٹنگ کے بعد خون میں گلوکوز کی پیمائش" },
    de: { name: "Nüchternblutzucker", category: "Diabetes", shortDescription: "Misst den Blutzucker nach dem Fasten" },
    ar: { name: "سكر الدم أثناء الصيام", category: "السكري", shortDescription: "يقيس سكر الدم بعد الصيام" },
    fr: { name: "Glycémie à jeun", category: "Diabète", shortDescription: "Mesure la glycémie après le jeûne" },
    ja: { name: "空腹時血糖", category: "糖尿病", shortDescription: "絶食後の血糖値を測定" },
  },
  "random-glucose": {
    ur: { name: "رینڈم بلڈ گلوکوز", category: "ذیابیطس", shortDescription: "فاسٹنگ کے بغیر خون میں گلوکوز کی پیمائش" },
    de: { name: "Gelegenheitsblutzucker", category: "Diabetes", shortDescription: "Misst den Blutzucker ohne Nüchternheit" },
    ar: { name: "سكر الدم العشوائي", category: "السكري", shortDescription: "يقيس سكر الدم دون صيام" },
    fr: { name: "Glycémie aléatoire", category: "Diabète", shortDescription: "Mesure la glycémie sans jeûne" },
    ja: { name: "随時血糖", category: "糖尿病", shortDescription: "絶食せずに血糖値を測定" },
  },
  "urine-ce": {
    ur: { name: "مکمل پیشاب کا معائنہ", category: "پیشاب", shortDescription: "پیشاب کا معمول کا جسمانی، کیمیائی اور خوردبینی معائنہ" },
    de: { name: "Vollständige Urinuntersuchung", category: "Urin", shortDescription: "Routinemäßige körperliche, chemische und mikroskopische Urinuntersuchung" },
    ar: { name: "الفحص الكامل للبول", category: "البول", shortDescription: "فحص روتيني فيزيائي وكيميائي ومجهري للبول" },
    fr: { name: "Examen cytobactériologique des urines", category: "Urines", shortDescription: "Examen urinaire physique, chimique et microscopique de routine" },
    ja: { name: "尿一般検査", category: "尿検査", shortDescription: "尿の物理的・化学的・顕微鏡検査" },
  },
  esr: {
    ur: { name: "ایریتھروسائٹ سیڈیمنٹیشن ریٹ (ESR)", category: "خون کے ٹیسٹ", shortDescription: "سرخ خون کے خلیوں کے بیٹھنے کی رفتار کی پیمائش" },
    de: { name: "Blutsenkungsgeschwindigkeit (BSG)", category: "Hämatologie", shortDescription: "Misst, wie schnell rote Blutkörperchen absinken" },
    ar: { name: "معدل ترسيب كريات الدم الحمراء (ESR)", category: "أمراض الدم", shortDescription: "يقيس سرعة ترسب خلايا الدم الحمراء" },
    fr: { name: "Vitesse de sédimentation (VS)", category: "Hématologie", shortDescription: "Mesure la vitesse de sédimentation des globules rouges" },
    ja: { name: "赤血球沈降速度（ESR）", category: "血液学", shortDescription: "赤血球が沈む速度を測定" },
  },
  crp: {
    ur: { name: "سی ری ایکٹو پروٹین (CRP)", category: "سوزش", shortDescription: "سی ری ایکٹو پروٹین کی پیمائش" },
    de: { name: "C-reaktives Protein (CRP)", category: "Entzündung", shortDescription: "Misst das C-reaktive Protein" },
    ar: { name: "البروتين المتفاعل C (CRP)", category: "الالتهاب", shortDescription: "يقيس البروتين المتفاعل C" },
    fr: { name: "Protéine C-réactive (CRP)", category: "Inflammation", shortDescription: "Mesure la protéine C-réactive" },
    ja: { name: "C反応性タンパク（CRP）", category: "炎症", shortDescription: "C反応性タンパクを測定" },
  },
  ferritin: {
    ur: { name: "سیرم فیریٹن", category: "خون کے ٹیسٹ", shortDescription: "ذخیرہ شدہ آئرن کے اشاریے فیریٹن کی پیمائش" },
    de: { name: "Serum-Ferritin", category: "Hämatologie", shortDescription: "Misst den Ferritinwert als Marker der Eisenspeicher" },
    ar: { name: "فيريتين المصل", category: "أمراض الدم", shortDescription: "يقيس الفيريتين كمؤشر لمخزون الحديد" },
    fr: { name: "Ferritine sérique", category: "Hématologie", shortDescription: "Mesure la ferritine, marqueur des réserves en fer" },
    ja: { name: "血清フェリチン", category: "血液学", shortDescription: "貯蔵鉄の指標であるフェリチンを測定" },
  },
  hbsag: {
    ur: { name: "HBsAg", category: "متعدی امراض", shortDescription: "ہیپاٹائٹس بی سرفیس اینٹیجن ٹیسٹ" },
    de: { name: "HBsAg", category: "Infektionskrankheiten", shortDescription: "Test auf Hepatitis-B-Oberflächenantigen" },
    ar: { name: "HBsAg", category: "الأمراض المعدية", shortDescription: "فحص مستضد سطح التهاب الكبد B" },
    fr: { name: "Ag HBs", category: "Maladies infectieuses", shortDescription: "Test de l’antigène de surface de l’hépatite B" },
    ja: { name: "HBs抗原", category: "感染症", shortDescription: "B型肝炎表面抗原検査" },
  },
  "anti-hcv": {
    ur: { name: "Anti-HCV", category: "متعدی امراض", shortDescription: "ہیپاٹائٹس سی اینٹی باڈی اسکریننگ ٹیسٹ" },
    de: { name: "Anti-HCV", category: "Infektionskrankheiten", shortDescription: "Screeningtest auf Hepatitis-C-Antikörper" },
    ar: { name: "Anti-HCV", category: "الأمراض المعدية", shortDescription: "فحص تحري الأجسام المضادة لالتهاب الكبد C" },
    fr: { name: "Anti-VHC", category: "Maladies infectieuses", shortDescription: "Dépistage des anticorps contre l’hépatite C" },
    ja: { name: "抗HCV抗体", category: "感染症", shortDescription: "C型肝炎抗体スクリーニング検査" },
  },
  "beta-hcg": {
    ur: { name: "بیٹا hCG", category: "ہارمونز", shortDescription: "ہیومن کوریونک گوناڈوٹروپن کی پیمائش" },
    de: { name: "Beta-hCG", category: "Hormone", shortDescription: "Misst humanes Choriongonadotropin" },
    ar: { name: "بيتا hCG", category: "الهرمونات", shortDescription: "يقيس موجهة الغدد التناسلية المشيمائية البشرية" },
    fr: { name: "Bêta-hCG", category: "Hormones", shortDescription: "Mesure la gonadotrophine chorionique humaine" },
    ja: { name: "β-hCG", category: "ホルモン", shortDescription: "ヒト絨毛性ゴナドトロピンを測定" },
  },
  "t3-t4-tsh": {
    ur: { name: "تھائیرائڈ پروفائل (T3، T4، TSH)", category: "تھائیرائڈ", shortDescription: "تھائیرائڈ ہارمونز کا مشترکہ پروفائل" },
    de: { name: "Schilddrüsenprofil (T3, T4, TSH)", category: "Schilddrüse", shortDescription: "Kombiniertes Profil der Schilddrüsenhormone" },
    ar: { name: "ملف الغدة الدرقية (T3، T4، TSH)", category: "الغدة الدرقية", shortDescription: "تحليل مشترك لهرمونات الغدة الدرقية" },
    fr: { name: "Bilan thyroïdien (T3, T4, TSH)", category: "Thyroïde", shortDescription: "Bilan combiné des hormones thyroïdiennes" },
    ja: { name: "甲状腺プロファイル（T3、T4、TSH）", category: "甲状腺", shortDescription: "甲状腺ホルモンの総合検査" },
  },
  "blood-culture": {
    ur: { name: "بلڈ کلچر", category: "مائیکرو بایولوجی", shortDescription: "خون میں جراثیم کی شناخت کے لیے کلچر ٹیسٹ" },
    de: { name: "Blutkultur", category: "Mikrobiologie", shortDescription: "Kulturtest zum Nachweis von Erregern im Blut" },
    ar: { name: "زرع الدم", category: "الأحياء الدقيقة", shortDescription: "فحص زرع للكشف عن الكائنات الدقيقة في الدم" },
    fr: { name: "Hémoculture", category: "Microbiologie", shortDescription: "Culture destinée à détecter des microorganismes dans le sang" },
    ja: { name: "血液培養", category: "微生物学", shortDescription: "血液中の微生物を検出する培養検査" },
  },
  "chest-xray": {
    ur: { name: "سینے کا ایکس رے (PA اور لیٹرل)", category: "ریڈیگرافی", shortDescription: "پھیپھڑوں، دل کے حجم اور سینے کی ہڈیوں کی معیاری تشخیصی تصویر", description: "پھیپھڑوں، دل کے حجم اور سینے کی ہڈیوں کی معیاری تشخیصی امیجنگ۔" },
    de: { name: "Röntgenaufnahme des Brustkorbs (PA und lateral)", category: "Radiografie", shortDescription: "Standardbildgebung von Lungenfeldern, Herzsilhouette und Brustkorbknochen", description: "Standarddiagnostik der Lungenfelder, Herzsilhouette und knöchernen Strukturen des Brustkorbs." },
    ar: { name: "أشعة سينية للصدر (أمامي وجانبي)", category: "التصوير الشعاعي", shortDescription: "تصوير تشخيصي قياسي للرئتين وظل القلب وعظام الصدر", description: "تصوير تشخيصي قياسي لحقول الرئة وظل القلب والهياكل العظمية الصدرية." },
    fr: { name: "Radiographie thoracique (face et profil)", category: "Radiographie", shortDescription: "Imagerie standard des champs pulmonaires, du cœur et des structures osseuses thoraciques", description: "Imagerie diagnostique standard des champs pulmonaires, de la silhouette cardiaque et des structures osseuses thoraciques." },
    ja: { name: "胸部X線（正面・側面）", category: "放射線撮影", shortDescription: "肺野、心陰影、胸郭骨格を確認する標準的な画像検査", description: "肺野、心陰影、胸部の骨格を評価する標準的な画像検査。" },
  },
  "abdominal-ultrasound": {
    ur: { name: "پیٹ اور شرونی کا الٹراساؤنڈ", category: "الٹراساؤنڈ", shortDescription: "جگر، پتہ، گردے، تلی، لبلبہ اور مثانے کی ہائی ریزولوشن سونوگرافی", description: "جگر، پتہ، گردے، تلی، لبلبہ اور مثانے کی ہائی ریزولوشن سونوگرافی۔" },
    de: { name: "Ultraschall von Bauch und Becken", category: "Ultraschall", shortDescription: "Hochauflösende Sonografie von Leber, Gallenblase, Nieren, Milz, Bauchspeicheldrüse und Blase", description: "Hochauflösende Sonografie von Leber, Gallenblase, Nieren, Milz, Bauchspeicheldrüse und Blase." },
    ar: { name: "تصوير البطن والحوض بالموجات فوق الصوتية", category: "الموجات فوق الصوتية", shortDescription: "تصوير عالي الدقة للكبد والمرارة والكلى والطحال والبنكرياس والمثانة", description: "تصوير بالموجات فوق الصوتية عالي الدقة للكبد والمرارة والكلى والطحال والبنكرياس والمثانة." },
    fr: { name: "Échographie abdominale et pelvienne", category: "Échographie", shortDescription: "Échographie haute résolution du foie, de la vésicule, des reins, de la rate, du pancréas et de la vessie", description: "Échographie haute résolution du foie, de la vésicule biliaire, des reins, de la rate, du pancréas et de la vessie." },
    ja: { name: "腹部・骨盤超音波検査", category: "超音波検査", shortDescription: "肝臓、胆のう、腎臓、脾臓、膵臓、膀胱の高解像度超音波検査", description: "肝臓、胆のう、腎臓、脾臓、膵臓、膀胱を高解像度で確認する超音波検査。" },
  },
  "brain-mri": {
    ur: { name: "دماغ کا MRI (کنٹراسٹ کے بغیر)", category: "MRI", shortDescription: "سر درد، اعصابی علامات یا کھوپڑی کی چوٹ کے لیے نرم بافتوں کی تفصیلی امیجنگ", description: "سر درد، اعصابی علامات یا کھوپڑی کی چوٹ کے جائزے کے لیے نرم بافتوں کی تفصیلی نیورو امیجنگ۔" },
    de: { name: "MRT des Gehirns (ohne Kontrastmittel)", category: "MRT", shortDescription: "Detaillierte Weichteilbildgebung bei Kopfschmerzen, neurologischen Symptomen oder Schädeltrauma", description: "Detaillierte neuroradiologische Weichteilbildgebung zur Abklärung von Kopfschmerzen, neurologischen Symptomen oder Schädeltrauma." },
    ar: { name: "تصوير بالرنين المغناطيسي للدماغ (بدون تباين)", category: "الرنين المغناطيسي", shortDescription: "تصوير مفصل للأنسجة الرخوة للصداع أو الأعراض العصبية أو إصابات الجمجمة", description: "تصوير عصبي مفصل للأنسجة الرخوة لتقييم الصداع أو الأعراض العصبية أو إصابات الجمجمة." },
    fr: { name: "IRM cérébrale (sans contraste)", category: "IRM", shortDescription: "Imagerie détaillée des tissus mous en cas de céphalées, symptômes neurologiques ou traumatisme crânien", description: "Imagerie neurodiagnostique détaillée des tissus mous pour les céphalées, symptômes neurologiques ou traumatismes crâniens." },
    ja: { name: "脳MRI（造影剤なし）", category: "MRI", shortDescription: "頭痛、神経症状、頭部外傷の評価に用いる軟部組織の詳細画像検査", description: "頭痛、神経症状、頭部外傷を評価する詳細な神経画像検査。" },
  },
};

export function getDiagnosticServiceTranslation(
  translations: unknown,
  locale: string,
): DiagnosticServiceTranslation | null {
  if (!translations || typeof translations !== "object" || Array.isArray(translations)) return null;
  const values = translations as Record<string, unknown>;
  const selected = values[locale] ?? values[locale.split("-")[0]];
  if (!selected || typeof selected !== "object" || Array.isArray(selected)) return null;
  return selected as DiagnosticServiceTranslation;
}
