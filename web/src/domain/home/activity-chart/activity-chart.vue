<script setup lang="ts">
// Events per UTC day for the last N days. Bar height = count; the label above shows the day's largest magnitude.
import { EarthQuakeEvent } from '@src/types/event'
import { formatMagnitude, getDisplayMagnitude, getOriginTimeFromEvent, newISODate } from '@src/utils/string'
import { computed } from 'vue'

const props = defineProps<{
  events: EarthQuakeEvent[]
  days: number
  now: Date
}>()

const BAR_MAX_PX = 112
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const buckets = computed(() => {
  const today = Date.UTC(props.now.getUTCFullYear(), props.now.getUTCMonth(), props.now.getUTCDate())
  const list = Array.from({ length: props.days }, (_, i) => {
    const start = today - (props.days - 1 - i) * 86_400_000
    const date = new Date(start)
    return {
      start,
      label: i === props.days - 1 ? 'Hari ini' : DAY_NAMES[date.getUTCDay()],
      date: `${date.getUTCDate()}/${date.getUTCMonth() + 1}`,
      count: 0,
      maxMag: null as number | null
    }
  })
  for (const event of props.events) {
    const origin = getOriginTimeFromEvent(event)
    if (!origin) continue
    const t = newISODate(origin).getTime()
    const bucket = list.find((b) => t >= b.start && t < b.start + 86_400_000)
    if (!bucket) continue
    bucket.count += 1
    const mag = getDisplayMagnitude(event.magnitudes)?.value
    if (mag !== undefined && (bucket.maxMag === null || mag > bucket.maxMag)) bucket.maxMag = mag
  }
  return list
})

const maxCount = computed(() => Math.max(1, ...buckets.value.map((b) => b.count)))
const total = computed(() => buckets.value.reduce((sum, b) => sum + b.count, 0))
</script>

<template>
  <section class="app-card flex flex-col gap-4 p-5" aria-label="Aktivitas harian">
    <div class="flex items-baseline justify-between gap-2">
      <h2 class="app-section-title">Aktivitas {{ days }} hari</h2>
      <span class="text-xs text-base-content/50">{{ total }} kejadian · per hari (UTC)</span>
    </div>
    <div class="grid min-h-[136px] items-end gap-2" :style="{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }">
      <div v-for="bucket in buckets" :key="bucket.start" class="flex flex-col items-center justify-end gap-1">
        <span class="text-[11px] tabular-nums text-base-content/50">
          {{ bucket.maxMag !== null ? `M${formatMagnitude(bucket.maxMag)}` : '' }}
        </span>
        <div
          class="w-full max-w-10 rounded-md bg-primary/80 transition-all"
          :class="{ '!bg-base-300': bucket.count === 0 }"
          :style="{ height: `${bucket.count === 0 ? 4 : Math.max(12, Math.round((bucket.count / maxCount) * BAR_MAX_PX))}px` }"
          :title="`${bucket.date}: ${bucket.count} kejadian`" />
      </div>
    </div>
    <div class="grid gap-2 text-center" :style="{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }">
      <div v-for="bucket in buckets" :key="bucket.start" class="min-w-0">
        <div class="truncate text-xs font-medium text-base-content/80">{{ bucket.label }}</div>
        <div class="text-[11px] tabular-nums text-base-content/50">{{ bucket.count }}</div>
      </div>
    </div>
  </section>
</template>
