<script setup lang="ts">
import { OLPreviewMap } from '@src/components/ol-preview-map'
import { EarthQuakeEvent } from '@src/types/event'
import {
  formatDateTimeUTC,
  formatDepth,
  formatLatLon,
  formatMagnitude,
  getDisplayMagnitude,
  getOriginTimeFromEvent
} from '@src/utils/string'
import { computed } from 'vue'

import { ArrivalList } from '../arrival-list'
import { ChartTabList } from '../chart-tab-list'

const { event } = defineProps<{
  event: EarthQuakeEvent
}>()

const magnitude = computed(() => getDisplayMagnitude(event.magnitudes))

const phaseCount = computed(() => {
  const arrivals = event.arrivals ?? []
  const p = arrivals.filter((a) => a.phase_type?.toUpperCase().startsWith('P')).length
  const s = arrivals.filter((a) => a.phase_type?.toUpperCase().startsWith('S')).length
  const stations = new Set(arrivals.map((a) => a.station_details?._id ?? a.pick_details?.station_id)).size
  return { p, s, total: arrivals.length, stations }
})

// Values the backend does not return yet are shown as "-" instead of placeholder text.
const hypocentre = computed(() => [
  { label: 'Waktu asal', value: formatDateTimeUTC(getOriginTimeFromEvent(event)) },
  { label: 'Lintang', value: `${formatLatLon(event.latitude)}°` },
  { label: 'Bujur', value: `${formatLatLon(event.longitude)}°` },
  { label: 'Kedalaman', value: `${formatDepth(event.depth)} km` },
  {
    label: 'Magnitudo',
    value: magnitude.value ? `${formatMagnitude(magnitude.value.value)} ${magnitude.value.type}` : '-'
  },
  { label: 'Fase (P / S)', value: `${phaseCount.value.p} / ${phaseCount.value.s}` },
  { label: 'Stasiun', value: String(phaseCount.value.stations) },
  { label: 'RMS residual', value: '-' },
  { label: 'Azimuth gap', value: '-' },
  { label: 'Jarak minimum', value: '-' }
])

const provenance = computed(() => [
  { label: 'Event ID', value: event.name || event._id },
  { label: 'Wilayah', value: [event.sub_region, event.region].filter(Boolean).join(', ') || '-' },
  { label: 'Negara', value: event.country || '-' },
  { label: 'Medan', value: event.terrain === 'sea' ? 'Laut' : event.terrain === 'land' ? 'Darat' : event.terrain || '-' },
  { label: 'Dibuat', value: formatDateTimeUTC(event.created_at) },
  { label: 'Agensi / metode', value: '-' }
])
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-12">
    <section class="app-card self-start overflow-hidden lg:col-span-5">
      <div class="relative aspect-[4/3] w-full max-w-full bg-base-200">
        <OLPreviewMap v-if="magnitude" :event="event" :magnitude="magnitude" :full-height="true" class="absolute inset-0" />
      </div>
      <div class="flex items-center justify-between gap-2 border-t border-base-300 px-4 py-2.5 text-xs text-base-content/60">
        <span class="inline-flex items-center gap-1.5">
          <v-icon name="ri-map-pin-2-line" scale="0.85" />
          {{ formatLatLon(event.latitude) }}, {{ formatLatLon(event.longitude) }}
        </span>
        <span>{{ formatDepth(event.depth) }} km</span>
      </div>
    </section>

    <div class="grid gap-4 lg:col-span-7 xl:grid-cols-2">
      <section class="app-card p-4">
        <h2 class="app-section-title mb-3">Hiposenter</h2>
        <dl class="app-dl">
          <template v-for="item in hypocentre" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd :title="item.value">{{ item.value }}</dd>
          </template>
        </dl>
      </section>
      <section class="app-card p-4">
        <h2 class="app-section-title mb-3">Asal data</h2>
        <dl class="app-dl">
          <template v-for="item in provenance" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd :title="item.value">{{ item.value }}</dd>
          </template>
        </dl>
      </section>
      <section class="app-card p-4 xl:col-span-2">
        <ChartTabList />
      </section>
    </div>

    <section class="app-card overflow-hidden lg:col-span-12">
      <ArrivalList :event="event" />
    </section>
  </div>
</template>
