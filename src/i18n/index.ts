import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import it from './locales/it.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'it', labelKey: 'language.it' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

const resources = {
  en: { translation: en },
  it: { translation: it },
} as const

const STORAGE_KEY = 'reminder.language'

export function detectLanguage(): LanguageCode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
    return stored as LanguageCode
  }
  const nav = navigator.language?.toLowerCase().slice(0, 2)
  return SUPPORTED_LANGUAGES.some((l) => l.code === nav) ? (nav as LanguageCode) : 'en'
}

export function setLanguage(lang: LanguageCode): void {
  void i18n.changeLanguage(lang)
  localStorage.setItem(STORAGE_KEY, lang)
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n