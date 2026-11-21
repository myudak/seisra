<script setup lang="ts">
import { OLPreviewMap } from '@src/components/ol-preview-map'
import { EarthQuakeEvent } from '@src/types/event'
import { getDepthColor } from '@src/utils/event'
import {
  formatDateTimeUTC,
  formatDepth,
  formatLatLon,
  formatMagnitude,
  getDisplayMagnitude,
  getOriginTimeFromEvent,
  newISODate,
  timeAgo
} from '@src/utils/string'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  event: EarthQuakeEvent
  now: Date
}>()

const magnitude = computed(() => getDisplayMagnitude(props.event.magnitudes))
const origin = computed(() => {
  const value = getOriginTimeFromEvent(props.event)
  return value ? newISODate(value) : null
})
const place = computed(() => [props.event.sub_region, props.event.region].filter(Boolean).join(', '))
const facts = computed(() => [
  { label: 'Waktu asal', value: formatDateTimeUTC(origin.value) },
  { label: 'Kedalaman', value: `${formatDepth(props.event.depth)} km` },
  { label: 'Koordinat', value: `${formatLatLon(props.event.latitude)}, ${formatLatLon(props.event.longitude)}` },
  { label: 'Medan', value: props.event.terrain === 'sea' ? 'Laut' : props.event.terrain === 'land' ? 'Darat' : '-' },
  { label: 'Event ID', value: props.event.name || props.event._id }
])
</script>

<template>
  <section class="app-card grid overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" aria-label="Gempa terbaru">
    <div class="relative aspect-[4/3] w-full max-w-full bg-base-200 md:aspect-auto md:min-h-[260px]">
      <OLPreviewMap v-if="magnitude" :event="event" :magnitude="magnitude" :full-height="true" class="absolute inset-0" />
    </div>
    <div class="flex min-w-0 flex-col gap-4 p-5">
      <div class="flex items-center gap-2">
        <span class="app-section-title">Gempa terbaru</span>
        <span v-if="origin" class="text-xs text-base-content/50">· {{ timeAgo(origin, now) }}</span>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-base-300 bg-base-200/50 leading-none">
          <span class="text-2xl font-bold tabular-nums text-base-content">{{ formatMagnitude(magnitude?.value) ?? '-' }}</span>
          <span class="mt-1 text-[11px] text-base-content/50">{{ magnitude?.type }}</span>
        </div>
        <div class="min-w-0">
          <h2 class="truncate text-xl font-semibold text-base-content">{{ place || event.region }}</h2>
          <p class="mt-0.5 flex items-center gap-1.5 text-sm text-base-content/60">
            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: getDepthColor(event.depth) }" />
            {{ event.depth < 70 ? 'Gempa dangkal' : event.depth < 300 ? 'Gempa menengah' : 'Gempa dalam' }}
            · {{ event.country }}
          </p>
        </div>
      </div>
      <dl class="app-dl">
        <template v-for="fact in facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd :title="fact.value">{{ fact.value }}</dd>
        </template>
      </dl>
      <div class="mt-auto flex flex-wrap gap-2">
        <RouterLink :to="`/origin-locator-view/location/${event._id}`" class="btn btn-sm btn-primary">Analisis kejadian</RouterLink>
        <RouterLink to="/eq-view" class="btn btn-sm btn-ghost border-base-300">Lihat di peta</RouterLink>
      </div>
    </div>
  </section>
</template>
