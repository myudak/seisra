<script setup lang="ts">
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
import { RouterLink } from 'vue-router'

defineProps<{
  events: EarthQuakeEvent[]
  now: Date
  loading?: boolean
}>()

const originOf = (event: EarthQuakeEvent) => {
  const origin = getOriginTimeFromEvent(event)
  return origin ? newISODate(origin) : null
}
</script>

<template>
  <section class="app-card flex min-h-0 flex-col overflow-hidden" aria-label="Gempa terkini">
    <header class="flex items-center justify-between border-b border-base-300 px-4 py-3">
      <h2 class="text-sm font-semibold text-base-content">Gempa terkini</h2>
      <RouterLink to="/origin-locator-view/events" class="text-xs font-semibold text-primary hover:underline">Semua →</RouterLink>
    </header>

    <EmptyState v-if="loading && !events.length" title="Memuat kejadian…" loading />
    <EmptyState v-else-if="!events.length" title="Belum ada gempa" description="Tidak ada kejadian dalam 7 hari terakhir." icon="la-dot-circle" />

    <ol v-else class="min-h-0 flex-1 divide-y divide-base-300/70 overflow-y-auto">
      <li v-for="event in events" :key="event._id">
        <RouterLink
          :to="`/origin-locator-view/location/${event._id}`"
          class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-base-200/60">
          <span class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-base-300 leading-none">
            <span class="text-base font-bold tabular-nums text-base-content">
              {{ formatMagnitude(getDisplayMagnitude(event.magnitudes)?.value) ?? '-' }}
            </span>
            <span class="mt-0.5 text-[10px] text-base-content/50">{{ getDisplayMagnitude(event.magnitudes)?.type }}</span>
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium text-base-content">
              {{ [event.sub_region, event.region].filter(Boolean).join(', ') }}
            </span>
            <span class="block text-xs text-base-content/55">
              <template v-if="originOf(event)">{{ formatTimeUTC(originOf(event)!) }} UTC · {{ timeAgo(originOf(event)!, now) }}</template>
            </span>
          </span>
          <span class="flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-base-content/60">
            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: getDepthColor(event.depth) }" />
            {{ formatDepth(event.depth) }} km
          </span>
        </RouterLink>
      </li>
    </ol>
  </section>
</template>
