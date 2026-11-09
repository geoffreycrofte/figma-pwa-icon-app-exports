/**
 * The interface language chosen by the user, remembered per user and per
 * device with figma.clientStorage. Figma does not expose its own UI language,
 * so without a saved choice the UI falls back to the system language.
 */
import { isLang, type Lang } from '../shared/i18n.ts'

const STORAGE_KEY = 'lang'

/** Never rejects: a storage failure just means "no saved choice". */
export async function readLangPreference(): Promise<Lang | null> {
  try {
    const value: unknown = await figma.clientStorage.getAsync(STORAGE_KEY)
    return isLang(value) ? value : null
  } catch {
    return null
  }
}

export function saveLangPreference(lang: Lang): Promise<void> {
  return figma.clientStorage.setAsync(STORAGE_KEY, lang)
}
