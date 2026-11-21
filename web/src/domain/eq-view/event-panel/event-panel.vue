<script setup lang="ts">
// Left-hand event feed on the EQ map: date range, count and the events, newest first.
import { DateFilter } from '@src/components/date-filter'
import { EmptyState } from '@src/components/empty-state'
import { EarthQuakeEvent } from '@src/types/event'
import { getDepthColor } from '@src/utils/event'
import {
  formatDepth,
  formatMagnitude,
  formatTimeUTC,
  getDisplayMagnitude,
  getOriginTimeFromEvent,
  newISODate,
  timeAgo
} from '@src/utils/string'
import { computed } from 'vue'

const props = defineProps<{
  events: EarthQuakeEvent[]
  selectedId?: string | null
  loading?: boolean
}>()

defineEmits<{
  (e: 'select', event: EarthQuakeEvent): void
  (e: 'collapse'): void
}>()

const range = defineModel<{ start: Date; end: Date }>('range', { required: true })

const originOf = (event: EarthQuakeEvent) => {
  const origin = getOriginTimeFromEvent(event)
  return origin ? newISODate(origin) : null
}

const sorted = computed(() =>
  [...props.events].sort((a, b) => (originOf(b)?.getTime() ?? 0) - (originOf(a)?.getTime() ?? 0))
)
const strongest = computed(() =>
  props.events.reduce<number | null>((max, e) => {
    const m = getDisplayMagnitude(e.magnitudes)?.value
    return m !== undefined && (max === null || m > max) ? m : max
  }, null)
)
</script>

<template>
  <section class="app-float flex min-h-0 flex-col" aria-label="Daftar gempa">
    <header class="flex flex-col gap-3 border-b border-base-300 p-4">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h1 class="text-base font-semibold text-base-content">Gempa terkini</h1>
          <p class="text-xs text-base-content/60">
            {{ events.length }} kejadian
            <template v-if="strongest !== null"> · terbesar M {{ formatMagnitude(strongest) }}</template>
          </p>
        </div>
        <button class="btn btn-ghost btn-sm btn-square text-base-content/60" aria-label="Sembunyikan daftar" @click="$emit('collapse')">
          <v-icon name="ri-arrow-left-s-line" class="max-md:rotate-[-90deg]" />
        </button>
      </div>
      <DateFilter v-model:range="range" />
    </header>

    <EmptyState v-if="loading && !events.length" title="Memuat kejadian…" loading />
    <EmptyState
      v-else-if="!events.length"
      title="Tidak ada gempa"
      description="Belum ada kejadian pada rentang tanggal ini. Coba perluas rentangnya."
      icon="la-dot-circle" />

    <ol v-else class="min-h-0 flex-1 overflow-y-auto p-1.5">
      <li v-for="(event, index) in sorted" :key="event._id">
        <button
          class="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-base-200/70"
          :class="{ 'bg-primary/10 hover:bg-primary/15': selectedId === event._id }"
          @click="$emit('select', event)">
          <span
            class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-base-300 bg-base-100 leading-none"
            :aria-label="`Magnitudo ${formatMagnitude(getDisplayMagnitude(event.magnitudes)?.value)}`">
            <span class="text-base font-bold tabular-nums text-base-content">
              {{ formatMagnitude(getDisplayMagnitude(event.magnitudes)?.value) ?? '-' }}
            </span>
            <span class="mt-0.5 text-[10px] text-base-content/50">{{ getDisplayMagnitude(event.magnitudes)?.type }}</span>
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-2">
              <span class="truncate text-sm font-medium text-base-content">
                {{ event.sub_region ? `${event.sub_region}, ${event.region}` : event.region }}
              </span>
              <span v-if="index === 0" class="app-chip-primary shrink-0 !px-1.5 !py-0 text-[10px]">Terbaru</span>
            </span>
            <span class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-base-content/60">
              <span class="tabular-nums">{{ originOf(event) ? formatTimeUTC(originOf(event)!) : '-' }} UTC</span>
              <span aria-hidden="true">·</span>
              <span>{{ originOf(event) ? timeAgo(originOf(event)!) : '' }}</span>
            </span>
          </span>
          <span class="flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-base-content/60">
            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: getDepthColor(event.depth) }" />
            {{ formatDepth(event.depth) }} km
          </span>
        </button>
      </li>
    </ol>
  </section>
</template>
