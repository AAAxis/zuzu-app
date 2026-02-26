/**
 * Locale and translation display helpers.
 * Default locale is Hebrew for end users.
 */

export type Locale = "he" | "en"

export const DEFAULT_LOCALE: Locale = "he"

export interface TranslatedFields {
  name?: string
  description?: string
  muscle_group?: string
  equipment?: string
  template_name?: string
  workout_title?: string
  workout_description?: string
}

export interface WithTranslations {
  name?: string | null
  description?: string | null
  muscle_group?: string | null
  equipment?: string | null
  template_name?: string | null
  workout_title?: string | null
  workout_description?: string | null
  translations?: { he?: TranslatedFields; en?: TranslatedFields } | null
}

/** Prefer Hebrew (or other locale) when available. */
export function getTranslated<T extends WithTranslations>(
  item: T,
  field: keyof TranslatedFields,
  locale: Locale = DEFAULT_LOCALE
): string {
  if (!item) return ""
  const val = item[field as keyof T]
  const str = val != null ? String(val).trim() : ""
  if (locale === "he" && item.translations?.he?.[field]) {
    const he = item.translations.he[field]
    return (he && String(he).trim()) || str
  }
  if (locale === "en" && item.translations?.en?.[field]) {
    const en = item.translations.en[field]
    return (en && String(en).trim()) || str
  }
  return str
}

export function getDisplayName(
  item: WithTranslations,
  locale: Locale = DEFAULT_LOCALE
): string {
  return getTranslated(item, "name", locale) || getTranslated(item, "template_name", locale) || getTranslated(item, "workout_title", locale) || ""
}

export function getDisplayDescription(item: WithTranslations, locale: Locale = DEFAULT_LOCALE): string {
  return getTranslated(item, "description", locale) || getTranslated(item, "workout_description", locale) || ""
}

export function getDisplayMuscleGroup(item: WithTranslations, locale: Locale = DEFAULT_LOCALE): string {
  return getTranslated(item, "muscle_group", locale) || ""
}

export function getDisplayEquipment(item: WithTranslations, locale: Locale = DEFAULT_LOCALE): string {
  return getTranslated(item, "equipment", locale) || ""
}
