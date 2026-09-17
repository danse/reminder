import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppData, useBlobs } from '../../hooks/useAppData'
import { notesOverTime, storageUsage, topTags, typeBreakdown } from '../../db/analytics'

const TYPE_COLORS: Record<string, string> = {
  text: '#6366f1',
  voice: '#0ea5e9',
  picture: '#f59e0b',
}

const NOTE_TYPES = ['text', 'voice', 'picture'] as const

export function AnalyticsView() {
  const { t, i18n } = useTranslation()
  const { notes } = useAppData()
  const blobs = useBlobs()

  const charts = useMemo(() => {
    return {
      overTime: notesOverTime(notes, 'day'),
      byType: typeBreakdown(notes),
      tags: topTags(notes, 8),
      storage: storageUsage(notes, blobs),
    }
  }, [notes, blobs])

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric' }),
    [i18n.language],
  )
  const bytesFmt = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'unit',
        unit: 'kilobyte',
        maximumFractionDigits: 1,
      }),
    [i18n.language],
  )

  const typeLabel = (type: string): string =>
    (NOTE_TYPES as readonly string[]).includes(type) ? t(`note.types.${type as (typeof NOTE_TYPES)[number]}`) : type

  if (notes.length === 0) {
    return (
      <div className="analytics analytics-empty" data-testid="analytics-empty">
        <p>{t('analytics.noData')}</p>
      </div>
    )
  }

  return (
    <div className="analytics" data-testid="analytics-view">
      <div className="analytics-grid">
        <section className="chart-card chart-card-wide">
          <h2 className="chart-title">{t('analytics.byType')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={charts.byType}
                dataKey="count"
                nameKey="type"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {charts.byType.map((d) => (
                  <Cell key={d.type} fill={TYPE_COLORS[d.type] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [String(value), typeLabel(String(name))]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {charts.byType.map((d) => (
              <span key={d.type} className="chart-legend-item">
                <span className="legend-dot" style={{ backgroundColor: TYPE_COLORS[d.type] }} />
                {t(`note.types.${d.type}`)} — {d.count}
              </span>
            ))}
          </div>
        </section>

        <section className="chart-card chart-card-wide">
          <h2 className="chart-title">{t('analytics.overTime')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.overTime}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="bucket"
                tickFormatter={(ts: number) => dateFmt.format(ts)}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(ts) => dateFmt.format(Number(ts))}
                formatter={(value) => [String(value), t('analytics.overTime')]}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-card">
          <h2 className="chart-title">{t('analytics.topTags')}</h2>
          {charts.tags.length === 0 ? (
            <p className="chart-empty">{t('tag.noTags')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.tags} layout="vertical" margin={{ left: 16 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="tag" width={90} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [String(value), t('analytics.topTags')]} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="chart-card">
          <h2 className="chart-title">{t('analytics.storage')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={charts.storage}
                dataKey="bytes"
                nameKey="type"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {charts.storage.map((d) => (
                  <Cell key={d.type} fill={TYPE_COLORS[d.type] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [bytesFmt.format(Number(value) / 1024), typeLabel(String(name))]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {charts.storage.map((d) => (
              <span key={d.type} className="chart-legend-item">
                <span className="legend-dot" style={{ backgroundColor: TYPE_COLORS[d.type] }} />
                {t(`note.types.${d.type}`)} — {bytesFmt.format(d.bytes / 1024)}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}