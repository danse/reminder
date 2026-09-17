import type { Note, NoteType, StoredBlob } from './types'

export interface TypeDatum {
  type: NoteType
  count: number
}

export interface BucketDatum {
  bucket: number
  count: number
}

export interface TagDatum {
  tag: string
  count: number
}

export interface StorageDatum {
  type: NoteType
  bytes: number
}

const ALL_TYPES: NoteType[] = ['text', 'voice', 'picture']

export function typeBreakdown(notes: Note[]): TypeDatum[] {
  return ALL_TYPES.map((type) => ({
    type,
    count: notes.filter((n) => n.type === type).length,
  })).filter((d) => d.count > 0)
}

export function notesOverTime(notes: Note[], granularity: 'day' | 'month'): BucketDatum[] {
  const byBucket = new Map<number, number>()
  for (const n of notes) {
    const bucket = bucketStart(n.createdAt, granularity)
    byBucket.set(bucket, (byBucket.get(bucket) ?? 0) + 1)
  }
  return [...byBucket.entries()]
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => a.bucket - b.bucket)
}

function bucketStart(ts: number, granularity: 'day' | 'month'): number {
  const d = new Date(ts)
  if (granularity === 'day') {
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function topTags(notes: Note[], limit: number): TagDatum[] {
  const counts = new Map<string, number>()
  for (const n of notes) {
    for (const tag of n.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit)
}

export function weeklyHeatmap(notes: Note[]): BucketDatum[] {
  const byWeek = new Map<number, number>()
  for (const n of notes) {
    const week = mondayOfWeek(n.createdAt)
    byWeek.set(week, (byWeek.get(week) ?? 0) + 1)
  }
  return [...byWeek.entries()]
    .map(([week, count]) => ({ bucket: week, count }))
    .sort((a, b) => a.bucket - b.bucket)
}

function mondayOfWeek(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  const dow = (d.getDay() + 6) % 7 // Mon=0
  d.setDate(d.getDate() - dow)
  return d.getTime()
}

export function storageUsage(notes: Note[], blobs: StoredBlob[]): StorageDatum[] {
  const blobSizes = new Map(blobs.map((b) => [b.id, b.data.byteLength]))
  return ALL_TYPES.map((type) => {
    let bytes = 0
    for (const n of notes) {
      if (n.type === type && n.blobId) {
        bytes += blobSizes.get(n.blobId) ?? 0
      }
    }
    return { type, bytes }
  }).filter((d) => d.bytes > 0 || d.type === 'text')
}