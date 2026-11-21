<script setup lang="ts">
import { OLPreviewMap } from '@src/components/ol-preview-map'
import { EarthQuakeEvent } from '@src/types/event'
import { Magnitude } from '@src/types/magnitude'
import { formatDateTimeUTC } from '@src/utils/string'

import { MockChart } from '../mock-chart'

const { magnitudes, event } = defineProps<{
  event: EarthQuakeEvent
  magnitudes: Magnitude[]
}>()

const values = magnitudes.map((magnitude) => magnitude.value)
const selectedMagnitude = magnitudes[0]
const average = values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null

// Agency, author, evaluation and method are not returned by the backend yet, so they show "-".
const informations = [
  { label: 'Dihitung', value: formatDateTimeUTC(event.created_at) },
  { label: 'Jumlah nilai', value: String(magnitudes.length) },
  { label: 'Rata-rata', value: average === null ? '-' : average.toFixed(2) },
  { label: 'Minimum', value: values.length ? Math.min(...values).toFixed(2) : '-' },
  { label: 'Maksimum', value: values.length ? Math.max(...values).toFixed(2) : '-' },
  { label: 'Agensi', value: '-' },
  { label: 'Penulis', value: '-' },
  { label: 'Evaluasi', value: '-' },
  { label: 'Metode', value: '-' }
]
</script>
<template>
  <div class="grid gap-4 md:grid-cols-2">
    <section class="app-card self-start overflow-hidden">
      <div class="relative aspect-square w-full max-w-full bg-base-200">
        <OLPreviewMap v-if="selectedMagnitude" :magnitude="selectedMagnitude" :event="event" :full-height="true" class="absolute inset-0" />
      </div>
    </section>
    <div class="flex flex-col gap-4">
      <section class="app-card p-4">
        <h2 class="app-section-title mb-3">Ringkasan {{ selectedMagnitude?.type }}</h2>
        <dl class="app-dl">
          <template v-for="item in informations" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd :title="item.value">{{ item.value }}</dd>
          </template>
        </dl>
      </section>
      <section class="app-card p-4">
        <h2 class="app-section-title mb-3">Distribusi</h2>
        <MockChart tab="Distribusi magnitudo" />
      </section>
    </div>
  </div>
</template>
