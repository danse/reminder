const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

export function formatRelativeDate(ts: number, locale: string): string {
  const diff = ts - Date.now()
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const unit: Intl.RelativeTimeFormatUnit[] = ['year', 'month', 'week', 'day', 'hour', 'minute']
  const thresholds = [YEAR, MONTH, WEEK, DAY, HOUR, MINUTE]

  for (let i = 0; i < thresholds.length; i++) {
    if (abs >= thresholds[i]) {
      return rtf.format(Math.round(diff / thresholds[i]), unit[i])
    }
  }
  return rtf.format(Math.round(diff / MINUTE), 'minute')
}

export function formatDate(ts: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(ts)
}

export function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function formatDayHeader(
  ts: number,
  locale: string,
  labels: { today: string; yesterday: string },
): string {
  const day = startOfDay(ts)
  const today = startOfDay(Date.now())
  if (day === today) return labels.today
  if (day === today - 24 * 60 * 60 * 1000) return labels.yesterday
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(ts)
}