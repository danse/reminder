import { describe, expect, it } from 'vitest'
import en from '../locales/en.json'
import itLocale from '../locales/it.json'

type Dict = Record<string, unknown>

function flatten(obj: Dict, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object') {
      keys.push(...flatten(value as Dict, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

describe('locale files', () => {
  it('en and it expose the same translation keys', () => {
    const enKeys = flatten(en as Dict).sort()
    const itKeys = flatten(itLocale as Dict).sort()

    expect(itKeys).toEqual(enKeys)
  })

  it('has no empty translation values', () => {
    for (const [lang, dict] of [['en', en], ['it', itLocale]] as const) {
      for (const path of flatten(dict as Dict)) {
        const value = path.split('.').reduce<unknown>((acc, k) => (acc as Dict)[k], dict)
        expect(String(value).trim(), `${lang}.${path}`).not.toBe('')
      }
    }
  })

  it('declares a language label for each supported language', () => {
    expect(en.language).toHaveProperty('en')
    expect(en.language).toHaveProperty('it')
    expect(itLocale.language).toHaveProperty('en')
    expect(itLocale.language).toHaveProperty('it')
  })
})