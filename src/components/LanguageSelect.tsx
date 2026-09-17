import { useTranslation } from 'react-i18next'
import { setLanguage, SUPPORTED_LANGUAGES, type LanguageCode } from '../i18n'

export function LanguageSelect() {
  const { t, i18n } = useTranslation()

  return (
    <select
      className="language-select"
      value={i18n.resolvedLanguage}
      onChange={(e) => setLanguage(e.target.value as LanguageCode)}
      aria-label={t('language.label')}
      data-testid="language-select"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {t(lang.labelKey)}
        </option>
      ))}
    </select>
  )
}