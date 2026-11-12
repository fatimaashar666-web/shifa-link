import type { LocalizedString, LocalizedText } from "./types";

type LocalizedValue = LocalizedString | LocalizedText | undefined;

export function getLocalizedValue(
  value: LocalizedValue,
  locale: string,
  fallback = "en",
) {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    const match =
      value.find((item) => item._key === locale || item.locale === locale) ??
      value.find((item) => item._key === fallback || item.locale === fallback) ??
      value[0];

    return match?.value;
  }

  return value[locale] ?? value[fallback] ?? Object.values(value)[0];
}
